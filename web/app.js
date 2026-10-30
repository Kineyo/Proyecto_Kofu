/**
 * Kofu C++ v2.0 // Frontend Controller
 * Interfaz moderna estilo Gemini con soporte completo para:
 * - Generación ofimática nativa Word (.docx) y PowerPoint (.pptx)
 * - Plantillas maestras OpenXML y Hub de Paquetes
 * - Hub oficial de modelos Qwen 2.5 (Ollama, Hugging Face, Fine-Tuning/GGUF)
 * - Ingesta de archivos locales y persistencia en LocalStorage
 */

const API_BASE = window.location.origin;
const STORAGE_KEY = "kofu_cpp_local_workspace_v1";

const DEFAULT_PARAMS = {
  engine: "kofu",
  model: "qwen2.5:7b",
  endpoint: "http://localhost:11434",
  systemPrompt:
    "Eres Kofu C++ v2.0, un redactor académico de alto rendimiento y asistente ofimático profesional. Generas contenidos exhaustivos, estructurados y con excelente sintaxis en español.",
  mode: "local",
  apiKey: "",
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  repeatPenalty: 1.1,
  numCtx: 4096
};

const state = {
  theme: "dark",
  params: { ...DEFAULT_PARAMS },
  conversations: [],
  activeChatId: null,
  attachments: [],
  isGenerating: false,
  abortController: null,
  allTemplates: { word: [], powerpoint: [] },
  cachedPacks: null,
  availableModels: []
};

const dom = {};

document.addEventListener("DOMContentLoaded", async () => {
  cacheDomElements();
  loadStateFromStorage();
  applyTheme(state.theme);
  syncInspectorInputs();
  bindEvents();

  if (state.conversations.length === 0) {
    createNewConversation();
  } else {
    if (!state.activeChatId) {
      state.activeChatId = state.conversations[0].id;
    }
    renderChatList();
    renderActiveConversation();
  }

  await Promise.all([
    checkLocalEngineHealth(true),
    loadTemplates()
  ]);
});

function cacheDomElements() {
  dom.sidebar = document.getElementById("sidebar");
  dom.btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
  dom.btnMobileMenu = document.getElementById("btn-mobile-menu");
  dom.btnNewChat = document.getElementById("btn-new-chat");
  dom.searchChats = document.getElementById("search-chats");
  dom.chatList = document.getElementById("chat-list");
  dom.statusDot = document.getElementById("engine-status-dot");
  dom.statusText = document.getElementById("engine-status-text");
  dom.btnRefreshModels = document.getElementById("btn-refresh-models");
  dom.btnThemeToggle = document.getElementById("btn-theme-toggle");
  dom.btnExportAll = document.getElementById("btn-export-all");
  dom.btnImportJson = document.getElementById("btn-import-json");
  dom.fileImportJson = document.getElementById("file-import-json");
  dom.btnShutdown = document.getElementById("btn-shutdown");

  dom.engineSelect = document.getElementById("engine-select");
  dom.modelSelect = document.getElementById("model-select");
  dom.btnModelsHub = document.getElementById("btn-models-hub");
  dom.btnTemplatesHub = document.getElementById("btn-templates-hub");
  dom.metricTps = document.getElementById("metric-tps");
  dom.metricTokens = document.getElementById("metric-tokens");
  dom.btnExportMd = document.getElementById("btn-export-md");
  dom.btnClearChat = document.getElementById("btn-clear-chat");
  dom.btnToggleInspector = document.getElementById("btn-toggle-inspector");

  dom.chatViewport = document.getElementById("chat-viewport");
  dom.welcomeScreen = document.getElementById("welcome-screen");
  dom.messagesList = document.getElementById("messages-list");

  dom.docTypeSelect = document.getElementById("doc-type-select");
  dom.templateWrapper = document.getElementById("template-wrapper");
  dom.templateSelect = document.getElementById("template-select");

  dom.attachmentBar = document.getElementById("attachment-bar");
  dom.btnAttach = document.getElementById("btn-attach");
  dom.fileInput = document.getElementById("file-input");
  dom.promptInput = document.getElementById("prompt-input");
  dom.charCounter = document.getElementById("char-counter");
  dom.composerModeHint = document.getElementById("composer-mode-hint");
  dom.btnStop = document.getElementById("btn-stop");
  dom.btnSend = document.getElementById("btn-send");

  dom.inspectorPanel = document.getElementById("inspector-panel");
  dom.btnCloseInspector = document.getElementById("btn-close-inspector");
  dom.modeSelect = document.getElementById("mode-select");
  dom.apiKeyGroup = document.getElementById("api-key-group");
  dom.inputApiKey = document.getElementById("input-api-key");
  dom.inputEndpoint = document.getElementById("input-endpoint");
  dom.inputSystemPrompt = document.getElementById("input-system-prompt");
  dom.paramTemp = document.getElementById("param-temp");
  dom.valTemp = document.getElementById("val-temp");
  dom.paramTopP = document.getElementById("param-top-p");
  dom.valTopP = document.getElementById("val-top-p");
  dom.paramTopK = document.getElementById("param-top-k");
  dom.valTopK = document.getElementById("val-top-k");
  dom.paramPenalty = document.getElementById("param-penalty");
  dom.valPenalty = document.getElementById("val-penalty");
  dom.paramCtx = document.getElementById("param-ctx");
  dom.valCtx = document.getElementById("val-ctx");
  dom.btnResetParams = document.getElementById("btn-reset-params");
  dom.btnSaveParams = document.getElementById("btn-save-params");

  // Modales
  dom.templatesModalBackdrop = document.getElementById("templatesModalBackdrop");
  dom.closeTemplatesModal = document.getElementById("closeTemplatesModal");
  dom.templatesGrid = document.getElementById("templatesGrid");
  dom.packsCountBadge = document.getElementById("packsCountBadge");

  dom.modelsModalBackdrop = document.getElementById("modelsModalBackdrop");
  dom.closeModelsModal = document.getElementById("closeModelsModal");
}

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.theme) state.theme = parsed.theme;
    if (parsed.params) state.params = { ...DEFAULT_PARAMS, ...parsed.params };
    if (Array.isArray(parsed.conversations)) state.conversations = parsed.conversations;
    if (parsed.activeChatId) state.activeChatId = parsed.activeChatId;
  } catch (err) {
    console.warn("Error leyendo almacenamiento local:", err);
  }
}

function saveStateToStorage() {
  try {
    const payload = {
      theme: state.theme,
      params: state.params,
      conversations: state.conversations,
      activeChatId: state.activeChatId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("No se pudo guardar en localStorage:", err);
  }
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  saveStateToStorage();
}

function syncInspectorInputs() {
  if (dom.engineSelect) dom.engineSelect.value = state.params.engine || "kofu";
  if (dom.modelSelect) dom.modelSelect.value = state.params.model;
  if (dom.modeSelect) {
    dom.modeSelect.value = state.params.mode || "local";
    dom.apiKeyGroup.classList.toggle("hidden", state.params.mode !== "online");
  }
  if (dom.inputApiKey) dom.inputApiKey.value = state.params.apiKey || "";
  if (dom.inputEndpoint) dom.inputEndpoint.value = state.params.endpoint;
  if (dom.inputSystemPrompt) dom.inputSystemPrompt.value = state.params.systemPrompt;
  if (dom.paramTemp) {
    dom.paramTemp.value = state.params.temperature;
    dom.valTemp.textContent = state.params.temperature;
  }
  if (dom.paramTopP) {
    dom.paramTopP.value = state.params.topP;
    dom.valTopP.textContent = state.params.topP;
  }
  if (dom.paramTopK) {
    dom.paramTopK.value = state.params.topK;
    dom.valTopK.textContent = state.params.topK;
  }
  if (dom.paramPenalty) {
    dom.paramPenalty.value = state.params.repeatPenalty;
    dom.valPenalty.textContent = state.params.repeatPenalty;
  }
  if (dom.paramCtx) {
    dom.paramCtx.value = state.params.numCtx;
    dom.valCtx.textContent = state.params.numCtx;
  }
}

function bindEvents() {
  dom.btnToggleSidebar.addEventListener("click", () => {
    dom.sidebar.classList.toggle("collapsed");
  });

  if (dom.btnMobileMenu) {
    dom.btnMobileMenu.addEventListener("click", () => {
      dom.sidebar.classList.toggle("collapsed");
    });
  }

  dom.btnNewChat.addEventListener("click", () => createNewConversation());

  dom.searchChats.addEventListener("input", (e) => {
    renderChatList(e.target.value.trim().toLowerCase());
  });

  dom.btnThemeToggle.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });

  dom.btnToggleInspector.addEventListener("click", () => {
    dom.inspectorPanel.classList.toggle("collapsed");
  });

  dom.btnCloseInspector.addEventListener("click", () => {
    dom.inspectorPanel.classList.add("collapsed");
  });

  dom.modeSelect.addEventListener("change", (e) => {
    state.params.mode = e.target.value;
    dom.apiKeyGroup.classList.toggle("hidden", state.params.mode !== "online");
    dom.composerModeHint.textContent = state.params.mode === "online" 
      ? "🌐 Modo Híbrido Cloud • Word & PPTX" 
      : "100% Offline • Word & PPTX Nativo";
    saveStateToStorage();
  });

  dom.inputApiKey.addEventListener("input", (e) => {
    state.params.apiKey = e.target.value.trim();
    saveStateToStorage();
  });

  dom.engineSelect.addEventListener("change", (e) => {
    state.params.engine = e.target.value;
    saveStateToStorage();
    checkLocalEngineHealth();
  });

  dom.modelSelect.addEventListener("change", (e) => {
    state.params.model = e.target.value;
    saveStateToStorage();
  });

  dom.btnRefreshModels.addEventListener("click", () => checkLocalEngineHealth(true));

  // Sliders
  dom.paramTemp.addEventListener("input", (e) => (dom.valTemp.textContent = e.target.value));
  dom.paramTopP.addEventListener("input", (e) => (dom.valTopP.textContent = e.target.value));
  dom.paramTopK.addEventListener("input", (e) => (dom.valTopK.textContent = e.target.value));
  dom.paramPenalty.addEventListener("input", (e) => (dom.valPenalty.textContent = e.target.value));
  dom.paramCtx.addEventListener("input", (e) => (dom.valCtx.textContent = e.target.value));

  dom.btnSaveParams.addEventListener("click", () => {
    state.params.endpoint = dom.inputEndpoint.value.trim();
    state.params.systemPrompt = dom.inputSystemPrompt.value.trim();
    state.params.temperature = parseFloat(dom.paramTemp.value);
    state.params.topP = parseFloat(dom.paramTopP.value);
    state.params.topK = parseInt(dom.paramTopK.value, 10);
    state.params.repeatPenalty = parseFloat(dom.paramPenalty.value);
    state.params.numCtx = parseInt(dom.paramCtx.value, 10);
    saveStateToStorage();
    dom.inspectorPanel.classList.add("collapsed");
  });

  dom.btnResetParams.addEventListener("click", () => {
    state.params = { ...DEFAULT_PARAMS };
    syncInspectorInputs();
    saveStateToStorage();
  });

  // Selector de formato ofimático
  dom.docTypeSelect.addEventListener("change", () => {
    const docType = dom.docTypeSelect.value;
    dom.templateWrapper.classList.toggle("hidden", !docType);
    updateTemplateDropdown();
  });

  // Sugerencias de la pantalla de bienvenida
  document.querySelectorAll(".suggestion-card").forEach((card) => {
    card.addEventListener("click", () => {
      const promptText = card.getAttribute("data-prompt");
      const docType = card.getAttribute("data-type") || "";
      const template = card.getAttribute("data-template") || "";

      dom.docTypeSelect.value = docType;
      dom.templateWrapper.classList.toggle("hidden", !docType);
      updateTemplateDropdown();

      if (template && dom.templateSelect) {
        Array.from(dom.templateSelect.options).forEach(opt => {
          if (opt.value.toLowerCase().includes(template.toLowerCase())) {
            opt.selected = true;
          }
        });
      }

      dom.promptInput.value = promptText;
      autoResizeTextarea();
      handleSendMessage();
    });
  });

  // Textarea auto-ajustable y atajos
  dom.promptInput.addEventListener("input", () => {
    autoResizeTextarea();
    dom.charCounter.textContent = `${dom.promptInput.value.length} caracteres`;
  });

  dom.promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (state.isGenerating) stopGeneration();
      closeTemplatesHub();
      closeModelsHub();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      dom.sidebar.classList.toggle("collapsed");
    }
  });

  dom.btnSend.addEventListener("click", () => handleSendMessage());
  dom.btnStop.addEventListener("click", () => stopGeneration());

  // Adjuntar archivos locales
  dom.btnAttach.addEventListener("click", () => dom.fileInput.click());
  dom.fileInput.addEventListener("change", handleFileSelection);

  // Exportar e importar
  dom.btnExportMd.addEventListener("click", exportCurrentChatMarkdown);
  dom.btnClearChat.addEventListener("click", clearCurrentChat);
  dom.btnExportAll.addEventListener("click", exportFullDatabaseJson);
  dom.btnImportJson.addEventListener("click", () => dom.fileImportJson.click());
  dom.fileImportJson.addEventListener("change", importDatabaseJson);

  // Apagar servidor
  dom.btnShutdown.addEventListener("click", async () => {
    if (confirm("¿Deseas apagar el servidor Kofu C++?")) {
      try {
        await fetch(`${API_BASE}/system/shutdown`, { method: "POST" });
      } catch (_) {}
      document.body.innerHTML = `
        <div style="height:100vh;display:flex;align-items:center;justify-content:center;background:#131314;color:#c4c7c5;font-family:sans-serif;text-align:center;">
          <div>
            <h1 style="color:#a8c7fa;margin-bottom:12px;">⚡ Kofu C++ v2.0</h1>
            <p>El servidor local se ha detenido correctamente.</p>
            <p style="font-size:13px;margin-top:8px;color:#8e918f;">Puedes cerrar esta ventana de forma segura.</p>
          </div>
        </div>
      `;
      setTimeout(() => window.close(), 1200);
    }
  });

  // Hubs en Top Bar
  dom.btnTemplatesHub.addEventListener("click", openTemplatesHub);
  dom.closeTemplatesModal.addEventListener("click", closeTemplatesHub);
  dom.templatesModalBackdrop.addEventListener("click", (e) => {
    if (e.target === dom.templatesModalBackdrop) closeTemplatesHub();
  });

  dom.btnModelsHub.addEventListener("click", openModelsHub);
  dom.closeModelsModal.addEventListener("click", closeModelsHub);
  dom.modelsModalBackdrop.addEventListener("click", (e) => {
    if (e.target === dom.modelsModalBackdrop) closeModelsHub();
  });

  // Tabs de Modelos
  document.querySelectorAll(".model-nav-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchModelTab(tabId);
    });
  });

  initCopyButtons();
}

function autoResizeTextarea() {
  dom.promptInput.style.height = "auto";
  dom.promptInput.style.height = `${Math.min(dom.promptInput.scrollHeight, 200)}px`;
}

/* ==========================================================================
   GESTIÓN DE CONVERSACIONES
   ========================================================================== */
function getActiveConversation() {
  return state.conversations.find((c) => c.id === state.activeChatId) || null;
}

function createNewConversation() {
  const newChat = {
    id: "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    title: "Nueva sesión",
    createdAt: Date.now(),
    messages: []
  };
  state.conversations.unshift(newChat);
  state.activeChatId = newChat.id;
  saveStateToStorage();
  renderChatList();
  renderActiveConversation();
  dom.promptInput.focus();
}

function deleteConversation(id, event) {
  event.stopPropagation();
  state.conversations = state.conversations.filter((c) => c.id !== id);
  if (state.activeChatId === id) {
    state.activeChatId = state.conversations[0]?.id || null;
  }
  if (!state.activeChatId) {
    createNewConversation();
    return;
  }
  saveStateToStorage();
  renderChatList();
  renderActiveConversation();
}

function renderChatList(filterText = "") {
  dom.chatList.innerHTML = "";
  const filtered = state.conversations.filter((c) =>
    c.title.toLowerCase().includes(filterText)
  );

  filtered.forEach((chat) => {
    const item = document.createElement("div");
    item.className = `chat-item ${chat.id === state.activeChatId ? "active" : ""}`;
    item.innerHTML = `
      <span class="chat-item-title">${escapeHtml(chat.title)}</span>
      <div class="chat-item-actions">
        <button class="chat-action-btn" title="Eliminar sesión">✕</button>
      </div>
    `;
    item.addEventListener("click", () => {
      state.activeChatId = chat.id;
      saveStateToStorage();
      renderChatList(dom.searchChats.value.trim().toLowerCase());
      renderActiveConversation();
    });
    item.querySelector(".chat-action-btn").addEventListener("click", (ev) =>
      deleteConversation(chat.id, ev)
    );
    dom.chatList.appendChild(item);
  });
}

function renderActiveConversation() {
  const chat = getActiveConversation();
  dom.messagesList.innerHTML = "";

  if (!chat || chat.messages.length === 0) {
    dom.welcomeScreen.classList.remove("hidden");
    updateTokenMetrics(0);
    return;
  }

  dom.welcomeScreen.classList.add("hidden");
  let totalChars = 0;

  chat.messages.forEach((msg, index) => {
    totalChars += (msg.content || "").length;
    appendMessageToDom(msg.role, msg.content, index, false, msg.downloadInfo);
  });

  updateTokenMetrics(Math.ceil(totalChars / 4));
  scrollToBottom();
}

function appendMessageToDom(role, content, msgIndex, isStreaming = false, downloadInfo = null) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  if (role === "user") {
    row.innerHTML = `<div class="user-bubble">${escapeHtml(content)}</div>`;
  } else {
    let downloadCardHtml = "";
    if (downloadInfo && downloadInfo.url) {
      const isWord = downloadInfo.isWord;
      downloadCardHtml = `
        <div class="download-card">
          <div class="download-card-content">
            <div class="download-icon">${isWord ? "📄" : "📊"}</div>
            <div class="download-meta">
              <span class="download-title">${escapeHtml(downloadInfo.filename)}</span>
              <span class="download-subtitle">${isWord ? "Documento Word (.docx)" : "Presentación PowerPoint (.pptx)"}</span>
            </div>
          </div>
          <a href="${downloadInfo.url}" download="${downloadInfo.filename}" class="download-action-btn">
            ⬇️ Descargar
          </a>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="assistant-wrapper">
        <div class="assistant-avatar ${isStreaming ? "assistant-Avatar-pulse" : ""}">✦</div>
        <div class="assistant-content">
          <div class="markdown-body">${renderMarkdown(content)}</div>
          ${downloadCardHtml}
          <div class="message-toolbar">
            <button class="msg-tool-btn btn-copy-msg">Copiar texto</button>
          </div>
        </div>
      </div>
    `;
    const copyBtn = row.querySelector(".btn-copy-msg");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(content);
      copyBtn.textContent = "¡Copiado!";
      setTimeout(() => (copyBtn.textContent = "Copiar texto"), 1400);
    });
    bindCodeBlockCopyButtons(row);
  }

  dom.messagesList.appendChild(row);
  return row;
}

/* ==========================================================================
   ADJUNTOS LOCALES E INGESTA DOCUMENTAL
   ========================================================================== */
function handleFileSelection(e) {
  const files = Array.from(e.target.files || []);
  files.forEach((file) => {
    const isDoc = /\.(pdf|docx|pptx|xlsx|xls|png|jpg|jpeg|webp)$/i.test(file.name);
    if (isDoc) {
      // Ingesta offline o lectura binaria
      state.attachments.push({
        name: file.name,
        file: file,
        content: `[Archivo adjunto para ingesta offline: ${file.name}]`
      });
      renderAttachmentChips();
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        state.attachments.push({
          name: file.name,
          content: ev.target.result
        });
        renderAttachmentChips();
      };
      reader.readAsText(file);
    }
  });
  dom.fileInput.value = "";
}

function renderAttachmentChips() {
  if (state.attachments.length === 0) {
    dom.attachmentBar.classList.add("hidden");
    dom.attachmentBar.innerHTML = "";
    return;
  }

  dom.attachmentBar.classList.remove("hidden");
  dom.attachmentBar.innerHTML = "";

  state.attachments.forEach((item, idx) => {
    const chip = document.createElement("div");
    chip.className = "attachment-chip";
    chip.innerHTML = `
      <span>📎 ${escapeHtml(item.name)}</span>
      <button class="attachment-remove" title="Quitar">✕</button>
    `;
    chip.querySelector(".attachment-remove").addEventListener("click", () => {
      state.attachments.splice(idx, 1);
      renderAttachmentChips();
    });
    dom.attachmentBar.appendChild(chip);
  });
}

/* ==========================================================================
   ENVÍO, INFERENCIA Y GENERACIÓN OFIMÁTICA
   ========================================================================== */
async function handleSendMessage() {
  if (state.isGenerating) return;

  const rawText = dom.promptInput.value.trim();
  if (!rawText && state.attachments.length === 0) return;

  const chat = getActiveConversation();
  if (!chat) return;

  const docType = dom.docTypeSelect.value;
  const selectedTemplate = dom.templateSelect.value;

  let attachedText = "";
  if (state.attachments.length > 0) {
    attachedText = state.attachments
      .map((a) => `[Archivo: ${a.name}]\n${a.content}`)
      .join("\n\n");
    state.attachments = [];
    renderAttachmentChips();
  }

  let composedPrompt = rawText;
  if (attachedText) {
    composedPrompt = `${rawText}\n\n${attachedText}`.trim();
  }

  if (chat.messages.length === 0) {
    const prefix = docType === "word" ? "Doc: " : docType === "powerpoint" ? "PPT: " : "";
    chat.title = (prefix + (rawText || "Documento sin título")).slice(0, 36);
    renderChatList();
  }

  chat.messages.push({ role: "user", content: composedPrompt });
  dom.promptInput.value = "";
  dom.charCounter.textContent = "0 caracteres";
  autoResizeTextarea();
  dom.welcomeScreen.classList.add("hidden");

  appendMessageToDom("user", composedPrompt, chat.messages.length - 1);

  // Iniciar respuesta
  setGeneratingState(true);
  scrollToBottom();

  if (docType === "word" || docType === "powerpoint") {
    await handleOfficeGeneration(docType, rawText, selectedTemplate, attachedText, chat);
  } else {
    await handleChatGeneration(composedPrompt, chat);
  }
}

async function handleOfficeGeneration(docType, topic, template, sourceContent, chat) {
  const isWord = docType === "word";
  const endpoint = isWord ? "/office/word/download" : "/office/powerpoint/download";
  const cleanTopic = topic || (isWord ? "Documento_Kofu" : "Presentacion_Kofu");
  const safeName = cleanTopic.substring(0, 28).replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = isWord ? `Kofu_${safeName}.docx` : `Kofu_${safeName}.pptx`;

  const assistantMsg = { 
    role: "assistant", 
    content: `Generando ${isWord ? "Documento Word (.docx)" : "Presentación PowerPoint (.pptx)"} con Kofu...\n*Modelo:* \`${state.params.model}\` ${template ? `• *Plantilla:* \`${template}\`` : ""}` 
  };
  chat.messages.push(assistantMsg);
  const assistantRow = appendMessageToDom("assistant", assistantMsg.content, chat.messages.length - 1, true);
  const markdownContainer = assistantRow.querySelector(".markdown-body");
  const avatarEl = assistantRow.querySelector(".assistant-avatar");

  try {
    const body = {
      topic: cleanTopic,
      filename,
      template: template || undefined,
      style: isWord ? "professional" : undefined,
      theme: isWord ? undefined : "professional",
      modo: state.params.mode || "local",
      model: state.params.model,
      api_key: state.params.mode === "online" ? state.params.apiKey : undefined,
      source_content: sourceContent || undefined
    };

    const resp = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || "Fallo en la generación ofimática.");
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const backupSaved = resp.headers.get("X-Backup-Saved") === "true";

    assistantMsg.content = `✅ **${isWord ? "Documento Word (.docx)" : "Presentación PowerPoint (.pptx)"} generado con éxito.**\n\n` +
      `- **Tema:** ${cleanTopic}\n` +
      (template ? `- **Plantilla aplicada:** \`${template.replace(/\.[^.]+$/, "")}\`\n` : "") +
      (backupSaved ? `- **Copia de seguridad:** Guardada en la carpeta \`/archivos\`\n` : "");

    assistantMsg.downloadInfo = { url, filename, isWord };
    markdownContainer.innerHTML = renderMarkdown(assistantMsg.content);

    // Agregar tarjeta de descarga
    const downloadCardHtml = `
      <div class="download-card">
        <div class="download-card-content">
          <div class="download-icon">${isWord ? "📄" : "📊"}</div>
          <div class="download-meta">
            <span class="download-title">${escapeHtml(filename)}</span>
            <span class="download-subtitle">${isWord ? "Documento Word OpenXML" : "Presentación PowerPoint OpenXML"}</span>
          </div>
        </div>
        <a href="${url}" download="${filename}" class="download-action-btn">
          ⬇️ Descargar
        </a>
      </div>
    `;
    markdownContainer.insertAdjacentHTML("afterend", downloadCardHtml);

  } catch (err) {
    assistantMsg.content = `❌ **Error al generar el documento:** ${err.message}\n\nVerifica que Ollama esté iniciado o prueba con otro modelo en el selector superior.`;
    markdownContainer.innerHTML = renderMarkdown(assistantMsg.content);
  } finally {
    avatarEl.classList.remove("assistant-Avatar-pulse");
    setGeneratingState(false);
    saveStateToStorage();
    scrollToBottom();
  }
}

async function handleChatGeneration(prompt, chat) {
  const assistantMsg = { role: "assistant", content: "" };
  chat.messages.push(assistantMsg);
  const assistantRow = appendMessageToDom("assistant", "Pensando...", chat.messages.length - 1, true);
  const markdownContainer = assistantRow.querySelector(".markdown-body");
  const avatarEl = assistantRow.querySelector(".assistant-avatar");

  const startTime = performance.now();
  let generatedTokens = 0;

  try {
    if (state.params.engine === "simulator") {
      await streamOfflineSimulator(prompt, (chunk) => {
        assistantMsg.content += chunk;
        generatedTokens++;
        updateLiveStreamUI(markdownContainer, assistantMsg.content, startTime, generatedTokens);
      });
    } else {
      // Backend Kofu /chat
      const resp = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          model: state.params.model,
          modo: state.params.mode || "local",
          api_key: state.params.mode === "online" ? state.params.apiKey : undefined,
          show_thinking: false
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || "Error al comunicarse con el motor local.");
      }

      const data = await resp.json();
      assistantMsg.content = data.response;
      markdownContainer.innerHTML = renderMarkdown(assistantMsg.content);
      const elapsedSec = Math.max((performance.now() - startTime) / 1000, 0.1);
      const tokEst = Math.ceil(assistantMsg.content.length / 4);
      dom.metricTps.textContent = `${(tokEst / elapsedSec).toFixed(1)} tok/s`;
      dom.metricTokens.textContent = `${tokEst} tokens`;
    }
  } catch (err) {
    if (err.name === "AbortError") {
      assistantMsg.content += "\n\n*[Generación detenida por el usuario]*";
    } else {
      assistantMsg.content += `\n\n> ⚠️ **Aviso de conexión:** No se pudo completar la inferencia con el modelo \`${state.params.model}\`. Verifica que Ollama esté iniciado (\`ollama serve\`) o selecciona otro modelo en **🧠 Modelos Qwen**.`;
    }
    markdownContainer.innerHTML = renderMarkdown(assistantMsg.content);
  } finally {
    avatarEl.classList.remove("assistant-Avatar-pulse");
    bindCodeBlockCopyButtons(assistantRow);
    setGeneratingState(false);
    saveStateToStorage();
    scrollToBottom();
  }
}

function updateLiveStreamUI(container, fullText, startTime, tokenCount) {
  container.innerHTML = renderMarkdown(fullText);
  const elapsedSec = Math.max((performance.now() - startTime) / 1000, 0.1);
  const tps = (tokenCount / elapsedSec).toFixed(1);
  dom.metricTps.textContent = `${tps} tok/s`;
  scrollToBottom();
}

async function streamOfflineSimulator(userPrompt, onChunk) {
  state.abortController = new AbortController();
  const signal = state.abortController.signal;

  const sampleResponse = [
    "### Kofu AI // Modo Offline Activo\n\n",
    "He procesado tu instrucción localmente con el motor simulado.\n\n",
    "```bash\n",
    "# Comandos rápidos para ejecutar modelos Qwen recomendados:\n",
    "ollama run qwen2.5:7b       # Recomendado principal\n",
    "ollama run qwen2.5-coder:7b # Especializado en código y ofimática\n",
    "```\n\n",
    "- **Estado:** 100% Offline y seguro.\n",
    "- **Generador Ofimático:** Selecciona *Documento Word* o *Presentación* en la barra inferior para compilar archivos nativos OpenXML."
  ].join("");

  const tokens = sampleResponse.match(/.{1,4}/gs) || [];
  for (const tok of tokens) {
    if (signal.aborted) throw new Error("AbortError");
    await new Promise((r) => setTimeout(r, 16));
    onChunk(tok);
  }
}

function stopGeneration() {
  if (state.abortController) {
    state.abortController.abort();
  }
  setGeneratingState(false);
}

function setGeneratingState(active) {
  state.isGenerating = active;
  dom.btnSend.classList.toggle("hidden", active);
  dom.btnStop.classList.toggle("hidden", !active);
}

/* ==========================================================================
   SINCRONIZACIÓN CON BACKEND (Modelos, Salud y Plantillas)
   ========================================================================== */
function findPreferredModel(models) {
  if (!models || models.length === 0) return "qwen2.5:7b";
  const qwen = models.find(m => m.toLowerCase().includes("qwen2.5:7b"))
    || models.find(m => m.toLowerCase().includes("qwen2.5-coder:7b"))
    || models.find(m => m.toLowerCase().includes("qwen2.5-coder"))
    || models.find(m => m.toLowerCase().includes("qwen2.5:14b"))
    || models.find(m => m.toLowerCase().includes("qwen2.5:3b"))
    || models.find(m => m.toLowerCase().includes("qwen2.5"))
    || models.find(m => m.toLowerCase().includes("qwen"));
  return qwen || models[0];
}

async function checkLocalEngineHealth(populateModels = false) {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      dom.statusDot.className = "status-dot online";
      dom.statusText.textContent = `Kofu v${data.version || "2.0"} Online`;

      // Cargar modelos desde /ollama/models
      const mRes = await fetch(`${API_BASE}/ollama/models`).catch(() => null);
      if (mRes && mRes.ok) {
        const mData = await mRes.json();
        state.availableModels = mData.models || [];
        if (populateModels && state.availableModels.length > 0) {
          dom.modelSelect.innerHTML = "";
          state.availableModels.forEach((m) => {
            const opt = document.createElement("option");
            opt.value = m;
            opt.textContent = m.toLowerCase().includes("qwen") ? `⭐ ${m} (Recomendado)` : m;
            dom.modelSelect.appendChild(opt);
          });

          if (!state.params.model || !state.availableModels.includes(state.params.model)) {
            state.params.model = findPreferredModel(state.availableModels);
          }
          dom.modelSelect.value = state.params.model;
          saveStateToStorage();
        }
      }
      return;
    }
  } catch (_) {}

  // Fallback directo a Ollama
  try {
    const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      dom.statusDot.className = "status-dot online";
      dom.statusText.textContent = "Ollama Directo";
      if (populateModels && Array.isArray(data.models) && data.models.length > 0) {
        dom.modelSelect.innerHTML = "";
        data.models.forEach((m) => {
          const opt = document.createElement("option");
          opt.value = m.name;
          opt.textContent = m.name.toLowerCase().includes("qwen") ? `⭐ ${m.name} (Recomendado)` : m.name;
          dom.modelSelect.appendChild(opt);
        });
        state.params.model = findPreferredModel(data.models.map(m => m.name));
        dom.modelSelect.value = state.params.model;
        saveStateToStorage();
      }
      return;
    }
  } catch (_) {}

  dom.statusDot.className = "status-dot";
  dom.statusText.textContent = "Servidor no detectado";
}

async function loadTemplates() {
  try {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) return;
    state.allTemplates = await res.json();
    updateTemplateDropdown();
  } catch (_) {}
}

function updateTemplateDropdown() {
  const docType = dom.docTypeSelect.value;
  dom.templateSelect.innerHTML = '<option value="">Plantilla por defecto</option>';

  if (docType && state.allTemplates[docType]) {
    state.allTemplates[docType].forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t.replace(/\.[^.]+$/, "");
      dom.templateSelect.appendChild(opt);
    });
  }
}

/* ==========================================================================
   HUBS: PLANTILLAS Y MODELOS QWEN
   ========================================================================== */
async function openTemplatesHub() {
  dom.templatesModalBackdrop.classList.add("open");
  if (!state.cachedPacks) {
    dom.templatesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 20px; color: var(--text-muted);">Cargando catálogo oficial de plantillas...</div>';
    try {
      const res = await fetch(`${API_BASE}/templates/packages`);
      if (res.ok) {
        state.cachedPacks = await res.json();
        renderTemplatePacks(state.cachedPacks);
      }
    } catch (_) {
      dom.templatesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color: var(--accent-danger);">No se pudo conectar al catálogo de plantillas.</div>';
    }
  }
}

function closeTemplatesHub() {
  dom.templatesModalBackdrop.classList.remove("open");
}

function renderTemplatePacks(packs) {
  dom.templatesGrid.innerHTML = "";
  if (!Array.isArray(packs) || packs.length === 0) {
    dom.templatesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">No hay paquetes disponibles.</div>';
    return;
  }

  dom.packsCountBadge.textContent = `${packs.length} Paquetes Disponibles`;

  packs.forEach((p) => {
    const card = document.createElement("div");
    card.className = "template-pack-card";
    card.innerHTML = `
      <div class="pack-card-header">
        <span class="pack-card-icon">${escapeHtml(p.icon || "📦")}</span>
        <span class="pack-card-badge">${escapeHtml(p.templates_count || 6)} Plantillas</span>
      </div>
      <div class="pack-card-title">${escapeHtml(p.title || p.name)}</div>
      <p class="pack-card-desc">${escapeHtml(p.description || "")}</p>
      <a href="${API_BASE}/templates/packages/download/${encodeURIComponent(p.filename)}" class="template-download-btn">
        Descargar Paquete (.zip) ⬇
      </a>
    `;
    dom.templatesGrid.appendChild(card);
  });
}

function openModelsHub() {
  dom.modelsModalBackdrop.classList.add("open");
}

function closeModelsHub() {
  dom.modelsModalBackdrop.classList.remove("open");
}

function switchModelTab(tabId) {
  document.querySelectorAll(".model-nav-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
  });
  document.querySelectorAll(".model-tab-pane").forEach((pane) => {
    pane.classList.toggle("active", pane.id === tabId);
  });
}

function initCopyButtons() {
  document.querySelectorAll(".copy-cmd-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute("data-copy");
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = btn.textContent;
        btn.textContent = "✓ Copiado";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove("copied");
        }, 2000);
      } catch (_) {
        btn.textContent = "Error";
        setTimeout(() => { btn.textContent = "📋"; }, 2000);
      }
    });
  });
}

/* ==========================================================================
   PARSER MARKDOWN NATIVO
   ========================================================================== */
function renderMarkdown(rawText) {
  if (!rawText) return "";

  const codeBlocks = [];
  let text = rawText.replace(/```([\w+-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || "code";
    const placeholder = `@@CODEBLOCK_${codeBlocks.length}@@`;
    codeBlocks.push(`
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span>${escapeHtml(language)}</span>
          <button class="copy-code-btn">Copiar código</button>
        </div>
        <pre><code>${escapeHtml(code.replace(/\n$/, ""))}</code></pre>
      </div>
    `);
    return placeholder;
  });

  text = escapeHtml(text);

  text = text.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  text = text.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  text = text.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
  text = text.replace(/^- (.*)$/gm, "<li>$1</li>");
  text = text.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");

  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => {
      if (
        block.startsWith("<h") ||
        block.startsWith("<ul") ||
        block.startsWith("@@CODEBLOCK_")
      ) {
        return block;
      }
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  return paragraphs.replace(/@@CODEBLOCK_(\d+)@@/g, (_, idx) => codeBlocks[Number(idx)]);
}

function bindCodeBlockCopyButtons(container) {
  container.querySelectorAll(".copy-code-btn").forEach((btn) => {
    btn.onclick = () => {
      const codeEl = btn.closest(".code-block-wrapper").querySelector("code");
      navigator.clipboard.writeText(codeEl.textContent);
      btn.textContent = "¡Copiado!";
      setTimeout(() => (btn.textContent = "Copiar código"), 1400);
    };
  });
}

/* ==========================================================================
   UTILIDADES Y EXPORTACIÓN
   ========================================================================== */
function updateTokenMetrics(count) {
  dom.metricTokens.textContent = `${count} tokens`;
}

function clearCurrentChat() {
  const chat = getActiveConversation();
  if (!chat) return;
  chat.messages = [];
  saveStateToStorage();
  renderActiveConversation();
}

function exportCurrentChatMarkdown() {
  const chat = getActiveConversation();
  if (!chat || chat.messages.length === 0) return;

  const mdLines = [`# ${chat.title}\n`];
  chat.messages.forEach((m) => {
    const title = m.role === "user" ? "## Usuario" : `## Kofu AI (${state.params.model})`;
    mdLines.push(`${title}\n\n${m.content}\n`);
  });

  downloadBlob(mdLines.join("\n"), `${chat.title.replace(/\s+/g, "_")}.md`, "text/markdown");
}

function exportFullDatabaseJson() {
  const data = JSON.stringify(state, null, 2);
  downloadBlob(data, `kofu_cpp_backup_${Date.now()}.json`, "application/json");
}

function importDatabaseJson(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (Array.isArray(imported.conversations)) {
        state.conversations = imported.conversations;
        state.activeChatId = state.conversations[0]?.id || null;
        saveStateToStorage();
        renderChatList();
        renderActiveConversation();
      }
    } catch (_) {
      alert("El archivo JSON no tiene un formato válido.");
    }
  };
  reader.readAsText(file);
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function scrollToBottom() {
  dom.chatViewport.scrollTop = dom.chatViewport.scrollHeight;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
