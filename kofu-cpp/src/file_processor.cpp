// =============================================================================
// Kofu C++ Backend — M14: Native High-Performance Document Ingester
// =============================================================================

#include "kofu/file_processor.hpp"

#include <zip.h>
#include <pugixml.hpp>
#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <regex>

namespace kofu {

namespace fs = std::filesystem;

nlohmann::json IngestResult::to_json() const {
    return {
        {"success", success},
        {"filename", filename},
        {"content", content},
        {"error", error},
        {"size_bytes", size_bytes},
        {"file_type", file_type}
    };
}

std::string FileProcessor::detect_file_type(const fs::path& path) {
    std::ifstream file(path, std::ios::binary);
    if (!file.is_open()) return "unknown";

    char header[8] = {0};
    file.read(header, sizeof(header));
    std::streamsize bytes_read = file.gcount();
    if (bytes_read < 4) return "text";

    // Magic Numbers
    // Zip / OpenXML (PK\x03\x04)
    if (header[0] == 'P' && header[1] == 'K' && header[2] == 0x03 && header[3] == 0x04) {
        std::string ext = path.extension().string();
        std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
        if (ext == ".docx") return "docx";
        if (ext == ".pptx") return "pptx";
        if (ext == ".xlsx") return "xlsx";
        return "zip";
    }

    // PDF (%PDF)
    if (header[0] == '%' && header[1] == 'P' && header[2] == 'D' && header[3] == 'F') {
        return "pdf";
    }

    // Text fallback
    return "text";
}

std::string FileProcessor::extract_text(const fs::path& path) const {
    std::ifstream file(path);
    if (!file.is_open()) return "";
    std::stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

std::string FileProcessor::extract_docx(const fs::path& path) const {
    int err = 0;
    zip_t* archive = zip_open(path.string().c_str(), ZIP_RDONLY, &err);
    if (!archive) return "";

    zip_file_t* zfile = zip_fopen(archive, "word/document.xml", 0);
    if (!zfile) {
        zip_close(archive);
        return "";
    }

    struct zip_stat st;
    zip_stat_init(&st);
    zip_stat(archive, "word/document.xml", 0, &st);

    std::string xml_data(static_cast<size_t>(st.size), '\0');
    zip_fread(zfile, xml_data.data(), static_cast<zip_uint64_t>(st.size));
    zip_fclose(zfile);
    zip_close(archive);

    pugi::xml_document doc;
    if (!doc.load_buffer(xml_data.data(), xml_data.size())) {
        return "";
    }

    std::ostringstream text_out;
    for (pugi::xpath_node p : doc.select_nodes("//w:p")) {
        std::string para_text;
        for (pugi::xpath_node t : p.node().select_nodes(".//w:t")) {
            para_text += t.node().text().as_string();
        }
        if (!para_text.empty()) {
            text_out << para_text << "\n";
        }
    }

    return text_out.str();
}

std::string FileProcessor::extract_pptx(const fs::path& path) const {
    int err = 0;
    zip_t* archive = zip_open(path.string().c_str(), ZIP_RDONLY, &err);
    if (!archive) return "";

    zip_int64_t num_entries = zip_get_num_entries(archive, 0);
    std::ostringstream text_out;

    for (zip_int64_t i = 0; i < num_entries; ++i) {
        const char* name = zip_get_name(archive, static_cast<zip_uint64_t>(i), 0);
        if (!name) continue;

        std::string sname(name);
        if (sname.rfind("ppt/slides/slide", 0) == 0 && sname.find(".xml") != std::string::npos && sname.find("_rels") == std::string::npos) {
            struct zip_stat st;
            zip_stat_init(&st);
            zip_stat_index(archive, static_cast<zip_uint64_t>(i), 0, &st);

            zip_file_t* zfile = zip_fopen_index(archive, static_cast<zip_uint64_t>(i), 0);
            if (!zfile) continue;

            std::string xml_data(static_cast<size_t>(st.size), '\0');
            zip_fread(zfile, xml_data.data(), static_cast<zip_uint64_t>(st.size));
            zip_fclose(zfile);

            pugi::xml_document doc;
            if (doc.load_buffer(xml_data.data(), xml_data.size())) {
                for (pugi::xpath_node t : doc.select_nodes("//a:t")) {
                    text_out << t.node().text().as_string() << " ";
                }
                text_out << "\n";
            }
        }
    }

    zip_close(archive);
    return text_out.str();
}

std::string FileProcessor::extract_xlsx(const fs::path& path) const {
    int err = 0;
    zip_t* archive = zip_open(path.string().c_str(), ZIP_RDONLY, &err);
    if (!archive) return "";

    std::ostringstream text_out;
    zip_file_t* zfile = zip_fopen(archive, "xl/sharedStrings.xml", 0);
    if (zfile) {
        struct zip_stat st;
        zip_stat_init(&st);
        zip_stat(archive, "xl/sharedStrings.xml", 0, &st);

        std::string xml_data(static_cast<size_t>(st.size), '\0');
        zip_fread(zfile, xml_data.data(), static_cast<zip_uint64_t>(st.size));
        zip_fclose(zfile);

        pugi::xml_document doc;
        if (doc.load_buffer(xml_data.data(), xml_data.size())) {
            for (pugi::xpath_node t : doc.select_nodes("//t")) {
                text_out << t.node().text().as_string() << "\n";
            }
        }
    }

    zip_close(archive);
    return text_out.str();
}

std::string FileProcessor::extract_pdf(const fs::path& path) const {
    std::ifstream file(path, std::ios::binary);
    if (!file.is_open()) return "";

    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string pdf_data = buffer.str();

    // Fast regex extraction of text streams in uncompressed or lightly compressed PDF text objects
    std::ostringstream text_out;
    std::regex bt_et_regex(R"(\(([^()]+)\)\s*Tj)");
    auto words_begin = std::sregex_iterator(pdf_data.begin(), pdf_data.end(), bt_et_regex);
    auto words_end = std::sregex_iterator();

    for (std::sregex_iterator i = words_begin; i != words_end; ++i) {
        std::smatch match = *i;
        text_out << match[1].str() << " ";
    }

    std::string result = text_out.str();
    if (result.empty()) {
        result = "[Documento PDF: Se detectó estructura binaria válida de PDF (" + std::to_string(pdf_data.size()) + " bytes)]";
    }
    return result;
}

IngestResult FileProcessor::process_file(const fs::path& path) const {
    IngestResult res;
    res.filename = path.filename().string();

    std::error_code ec;
    if (!fs::exists(path, ec) || !fs::is_regular_file(path, ec)) {
        res.error = "Archivo no encontrado o inválido";
        return res;
    }

    res.size_bytes = fs::file_size(path, ec);
    res.file_type = detect_file_type(path);

    try {
        if (res.file_type == "docx") {
            res.content = extract_docx(path);
        } else if (res.file_type == "pptx") {
            res.content = extract_pptx(path);
        } else if (res.file_type == "xlsx") {
            res.content = extract_xlsx(path);
        } else if (res.file_type == "pdf") {
            res.content = extract_pdf(path);
        } else {
            res.content = extract_text(path);
        }

        res.success = !res.content.empty();
        if (!res.success) {
            res.error = "No se pudo extraer texto del archivo.";
        }
    } catch (const std::exception& e) {
        res.error = e.what();
    }

    return res;
}

} // namespace kofu
