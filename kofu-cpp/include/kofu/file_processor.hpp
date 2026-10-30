#ifndef KOFU_FILE_PROCESSOR_HPP
#define KOFU_FILE_PROCESSOR_HPP

// =============================================================================
// Kofu C++ Backend — M14: Native High-Performance Document Ingester
// =============================================================================
// Zero-dependency offline document processor in C/C++.
// Uses libzip + pugixml for ultra-fast OpenXML ingestion (DOCX, PPTX, XLSX),
// magic number validation, and text extraction with minimal memory latency.
// =============================================================================

#include <string>
#include <vector>
#include <filesystem>
#include <optional>
#include <nlohmann/json.hpp>

namespace kofu {

struct IngestResult {
    bool success = false;
    std::string filename;
    std::string content;
    std::string error;
    size_t size_bytes = 0;
    std::string file_type;

    nlohmann::json to_json() const;
};

class FileProcessor {
public:
    FileProcessor() = default;

    /// Ingest and extract text content from a local file.
    IngestResult process_file(const std::filesystem::path& path) const;

    /// Validate magic numbers of a file.
    static std::string detect_file_type(const std::filesystem::path& path);

    /// Check if the processor is available.
    bool is_available() const { return true; }

private:
    std::string extract_docx(const std::filesystem::path& path) const;
    std::string extract_pptx(const std::filesystem::path& path) const;
    std::string extract_xlsx(const std::filesystem::path& path) const;
    std::string extract_text(const std::filesystem::path& path) const;
    std::string extract_pdf(const std::filesystem::path& path) const;
};

} // namespace kofu

#endif // KOFU_FILE_PROCESSOR_HPP
