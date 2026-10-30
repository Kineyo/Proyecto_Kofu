// =============================================================================
// Kofu C++ Backend — M05: Dynamic Model Router
// =============================================================================

#include "kofu/model_router.hpp"

#include <vector>

namespace kofu {

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------
ModelRouter::ModelRouter(const OllamaClient& client)
    : client_(client)
{}

// ---------------------------------------------------------------------------
// preferred_model — hardcoded task→model mapping from Python backend
// ---------------------------------------------------------------------------
std::string ModelRouter::preferred_model(TaskType task) {
    switch (task) {
        case TaskType::Chat:          return "qwen2.5:3b";
        case TaskType::Document:      return "qwen2.5:7b";
        case TaskType::Presentation:  return "qwen2.5:7b";
        case TaskType::Reasoning:     return "qwen2.5:7b";
        case TaskType::Research:      return "qwen2.5:7b";
        case TaskType::CodeGen:       return "qwen2.5-coder:7b";
        case TaskType::Sanitization:  return "qwen2.5:0.5b";
        default:                      return "qwen2.5:7b";
    }
}

// ---------------------------------------------------------------------------
// task_name — human-readable labels
// ---------------------------------------------------------------------------
std::string ModelRouter::task_name(TaskType task) {
    switch (task) {
        case TaskType::Chat:          return "Chat";
        case TaskType::Document:      return "Documento Word";
        case TaskType::Presentation:  return "Presentación PowerPoint";
        case TaskType::Reasoning:     return "Razonamiento";
        case TaskType::Research:      return "Investigación Web";
        case TaskType::CodeGen:       return "Generación de Código";
        case TaskType::Sanitization:  return "Sanitización";
        default:                      return "General";
    }
}

// ---------------------------------------------------------------------------
// resolve_for_task — with availability validation and fallback chain
// ---------------------------------------------------------------------------
std::string ModelRouter::resolve_for_task(
    TaskType task,
    const std::string& user_requested_model) const
{
    // Build a fallback chain: preferred model for this task, then generics (all Qwen <= 11B)
    std::vector<std::string> fallbacks = {
        preferred_model(task),
        "qwen2.5:7b",
        "qwen2.5:3b",
        "qwen2.5-coder:7b",
        "qwen2.5-coder:1.5b",
        "qwen2.5:1.5b",
        "qwen2.5:0.5b",
        "qwen3:0.6b",
        "hf.co/TobiasLogic/qwen-2.5-coder-Uncensored:Q4_K_M"
    };

    return client_.resolve_model(user_requested_model, fallbacks);
}

} // namespace kofu
