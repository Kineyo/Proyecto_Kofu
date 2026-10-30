// ==========================================================================
// KOFU AI v1.5 // Frontend Controller
// ==========================================================================

const API_BASE = window.location.origin;

let allTemplates = { powerpoint: [], word: [] };
let currentMode = 'local';
let activeTasks = 0;
let selectedFile = null;

let chatModel = localStorage.getItem('kofu_chat_model') || '';
let docModel = localStorage.getItem('kofu_doc_model') || '';
let availableModels = [];

document.addEventListener('DOMContentLoaded', async () => {
    const portBadge = document.getElementById('portBadge');
    if (portBadge) {
        portBadge.textContent = window.location.port ? `:${window.location.port}` : ':8000';
    }

    setupEventListeners();
    await Promise.all([loadTemplates(), loadOllamaModels()]);
    updateTaskCounter();
});

function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const documentType = document.getElementById('documentType');
    const shutdownBtn = document.getElementById('shutdownBtn');
    const localModeBtn = document.getElementById('localModeBtn');
    const onlineModeBtn = document.getElementById('onlineModeBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const fileInput = document.getElementById('fileInput');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const modelSettingsBtn = document.getElementById('modelSettingsBtn');
    const closeModelSettings = document.getElementById('closeModelSettings');
    const refreshModelsBtn = document.getElementById('refreshModelsBtn');

    // Botón de Apagado
    shutdownBtn.addEventListener('click', async () => {
        if (confirm('¿Deseas apagar el servidor Kofu AI?')) {
            try {
                await fetch(`${API_BASE}/system/shutdown`, { method: 'POST' });
            } catch (_) {}
            document.body.innerHTML = `
                <div style="height:100vh;display:flex;align-items:center;justify-content:center;background:#07090e;color:#8a99ad;font-family:sans-serif;text-align:center;">
                    <div>
                        <h1 style="color:#00f5d4;margin-bottom:12px;">⚡ Kofu AI v1.5</h1>
                        <p>El servidor local se ha detenido correctamente.</p>
                        <p style="font-size:12px;margin-top:8px;color:#536275;">Puedes cerrar esta pestaña o ventana.</p>
                    </div>
                </div>
            `;
            setTimeout(() => window.close(), 1000);
        }
    });

    sendBtn.addEventListener('click', handleUserSubmit);

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserSubmit();
        }
    });

    messageInput.addEventListener('input', autoResizeTextarea);
    documentType.addEventListener('change', updateTemplateDropdown);
    localModeBtn.addEventListener('click', () => switchMode('local'));
    onlineModeBtn.addEventListener('click', () => switchMode('online'));

    // Guardar API Key localmente
    const savedApiKey = localStorage.getItem('kofu_api_key');
    if (savedApiKey) apiKeyInput.value = savedApiKey;
    apiKeyInput.addEventListener('input', (e) => {
        localStorage.setItem('kofu_api_key', e.target.value.trim());
    });

    fileInput.addEventListener('change', handleFileSelect);
    removeFileBtn.addEventListener('click', removeSelectedFile);

    // Ajustes de Modelos
    modelSettingsBtn.addEventListener('click', () => {
        document.getElementById('modelSettingsPanel').classList.toggle('open');
    });
    closeModelSettings.addEventListener('click', () => {
        document.getElementById('modelSettingsPanel').classList.remove('open');
    });

    // Centro de Descarga de Plantillas (Hub)
    const templatesHubBtn = document.getElementById('templatesHubBtn');
    const closeTemplatesModal = document.getElementById('closeTemplatesModal');
    const templatesModalBackdrop = document.getElementById('templatesModalBackdrop');

    if (templatesHubBtn) {
        templatesHubBtn.addEventListener('click', openTemplatesHub);
    }
    if (closeTemplatesModal) {
        closeTemplatesModal.addEventListener('click', closeTemplatesHub);
    }
    if (templatesModalBackdrop) {
        templatesModalBackdrop.addEventListener('click', (e) => {
            if (e.target === templatesModalBackdrop) closeTemplatesHub();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && templatesModalBackdrop && templatesModalBackdrop.classList.contains('open')) {
            closeTemplatesHub();
        }
    });

    document.getElementById('chatModelSelect').addEventListener('change', (e) => {
        chatModel = e.target.value;
        localStorage.setItem('kofu_chat_model', chatModel);
        updateActiveModelBadge();
    });
    document.getElementById('docModelSelect').addEventListener('change', (e) => {
        docModel = e.target.value;
        localStorage.setItem('kofu_doc_model', docModel);
    });

    refreshModelsBtn.addEventListener('click', loadOllamaModels);
}

function autoResizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
        selectedFile = e.target.files[0];
        document.getElementById('fileName').textContent = selectedFile.name;
        document.getElementById('filePreview').style.display = 'flex';
        
        const docType = document.getElementById('documentType').value;
        const hint = document.getElementById('fileActionHint');
        if (docType === 'word') {
            hint.textContent = 'Se extraerá el contenido para redactar un documento Word.';
        } else if (docType === 'powerpoint') {
            hint.textContent = 'Se extraerá el contenido para estructurar una presentación.';
        } else {
            hint.textContent = 'Listo para extracción y análisis offline.';
        }
    }
}

function removeSelectedFile() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('filePreview').style.display = 'none';
}

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('localModeBtn').classList.toggle('active', mode === 'local');
    document.getElementById('onlineModeBtn').classList.toggle('active', mode === 'online');
    document.getElementById('apiConfig').style.display = mode === 'online' ? 'block' : 'none';
    
    const engineBadge = document.getElementById('engineBadge');
    if (engineBadge) {
        engineBadge.textContent = mode === 'online' ? 'HYBRID CLOUD' : 'OFFLINE READY';
        engineBadge.style.color = mode === 'online' ? '#00f5d4' : '#00b4d8';
    }
}

function getApiKey() {
    if (currentMode !== 'online') return null;
    return document.getElementById('apiKeyInput').value.trim() || null;
}

function updateTaskCounter() {
    document.getElementById('activeTasks').textContent = activeTasks;
}

function incrementTask() {
    activeTasks++;
    updateTaskCounter();
}

function decrementTask() {
    if (activeTasks > 0) activeTasks--;
    updateTaskCounter();
}

function updateActiveModelBadge() {
    const label = document.getElementById('activeModelLabel');
    if (label) {
        label.textContent = chatModel || 'Auto Ollama';
    }
}

async function loadOllamaModels() {
    const listContainer = document.getElementById('ollamaModelsList');
    listContainer.innerHTML = '<div class="loader-shim">Consultando Ollama...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/ollama/models`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        availableModels = data.models || [];

        if (availableModels.length === 0) {
            listContainer.innerHTML = '<div class="loader-shim">No hay modelos instalados. Ejecuta: ollama pull llama3.2</div>';
        } else {
            listContainer.innerHTML = '';
            availableModels.forEach(m => {
                const tag = document.createElement('div');
                tag.className = 'model-tag';
                tag.textContent = m;
                tag.title = m;
                listContainer.appendChild(tag);
            });

            // Si el modelo guardado no existe, seleccionar el primero disponible
            if (!chatModel || !availableModels.includes(chatModel)) {
                chatModel = availableModels[0];
                localStorage.setItem('kofu_chat_model', chatModel);
            }
            if (!docModel || !availableModels.includes(docModel)) {
                docModel = availableModels[0];
                localStorage.setItem('kofu_doc_model', docModel);
            }
        }

        populateModelSelects();
        updateActiveModelBadge();
    } catch (_) {
        listContainer.innerHTML = '<div class="loader-shim">⚠️ Ollama no disponible localmente.</div>';
        populateModelSelects();
    }
}

function populateModelSelects() {
    const chatSel = document.getElementById('chatModelSelect');
    const docSel = document.getElementById('docModelSelect');
    chatSel.innerHTML = '';
    docSel.innerHTML = '';

    const models = availableModels.length > 0 ? availableModels : ['llama3.2:latest', 'llama3:latest', 'mistral:latest'];
    models.forEach(m => {
        const opt1 = document.createElement('option');
        opt1.value = m;
        opt1.textContent = m;
        if (m === chatModel) opt1.selected = true;
        chatSel.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = m;
        opt2.textContent = m;
        if (m === docModel) opt2.selected = true;
        docSel.appendChild(opt2);
    });
}

async function loadTemplates() {
    try {
        const response = await fetch(`${API_BASE}/templates`);
        if (!response.ok) return;
        allTemplates = await response.json();
        updateTemplateDropdown();
    } catch (_) {}
}

function updateTemplateDropdown() {
    const docType = document.getElementById('documentType').value;
    const templateSelect = document.getElementById('templateSelect');
    templateSelect.innerHTML = '<option value="">Plantilla por defecto</option>';

    if (docType && allTemplates[docType]) {
        allTemplates[docType].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t.replace(/\.[^.]+$/, '');
            templateSelect.appendChild(opt);
        });
    }
}

// --------------------------------------------------------------------------
// Centro de Descarga de Plantillas (Hub de Paquetes)
// --------------------------------------------------------------------------
let cachedPacks = null;

async function openTemplatesHub() {
    const modalBackdrop = document.getElementById('templatesModalBackdrop');
    if (!modalBackdrop) return;
    modalBackdrop.classList.add('open');

    const grid = document.getElementById('templatesGrid');
    if (grid && !cachedPacks) {
        grid.innerHTML = '<div class="loader-shim" style="grid-column: 1/-1;">Cargando catálogo oficial de plantillas...</div>';
        try {
            const res = await fetch(`${API_BASE}/templates/packages`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    cachedPacks = data;
                }
            }
        } catch (_) {}

        if (!cachedPacks || cachedPacks.length === 0) {
            try {
                const res2 = await fetch('templates/packages/templates_catalog.json');
                if (res2.ok) {
                    const data2 = await res2.json();
                    if (Array.isArray(data2) && data2.length > 0) cachedPacks = data2;
                }
            } catch (_) {}
        }
    }

    if (cachedPacks && cachedPacks.length > 0) {
        renderTemplatesGrid(cachedPacks);
    }
}

function closeTemplatesHub() {
    const modalBackdrop = document.getElementById('templatesModalBackdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('open');
}

function renderTemplatesGrid(packs) {
    const grid = document.getElementById('templatesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const countBadge = document.getElementById('packsCountBadge');
    if (countBadge) countBadge.textContent = `${packs.length} Paquetes Disponibles`;

    packs.forEach(pack => {
        const card = document.createElement('div');
        card.className = 'template-card';

        const downloadUrl = `${API_BASE}/templates/packages/download/${encodeURIComponent(pack.filename)}`;

        let itemsHtml = '';
        if (pack.items && pack.items.length > 0) {
            itemsHtml = `
                <div class="template-card-details">
                    ${pack.items.map(it => `
                        <div class="template-card-item">
                            <span class="kind-badge ${it.type}">${it.type === 'word' ? 'DOCX' : 'PPTX'}</span>
                            <span title="${it.title}">${it.title}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="template-card-header">
                <div class="template-card-icon">${pack.icon || '📦'}</div>
                <div class="template-card-meta">
                    <div class="template-card-title">${pack.title}</div>
                    <div class="template-card-stats">${pack.template_count || 6} plantillas · ${pack.size_kb || 186} KB</div>
                </div>
            </div>
            <p class="template-card-desc">${pack.description}</p>
            ${itemsHtml}
            <a href="${downloadUrl}" download="${pack.filename}" class="template-download-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Descargar Paquete (.zip)</span>
            </a>
        `;
        grid.appendChild(card);
    });
}

function addMessage(text, role, isError = false, downloadInfo = null) {
    const chatContainer = document.getElementById('chatContainer');
    const welcome = chatContainer.querySelector('.welcome-hero');
    if (welcome) welcome.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${role}-avatar`;
    avatar.textContent = role === 'user' ? 'TÚ' : 'KF';

    const content = document.createElement('div');
    content.className = 'message-content';

    const roleLabel = document.createElement('div');
    roleLabel.className = 'message-role';
    roleLabel.textContent = role === 'user' ? 'USUARIO' : 'KOFU NEURAL';

    const messageText = document.createElement('div');
    messageText.className = 'message-text' + (isError ? ' error-message' : '');
    messageText.textContent = text;

    content.appendChild(roleLabel);
    content.appendChild(messageText);

    if (downloadInfo) {
        const card = document.createElement('div');
        card.className = 'download-card';
        card.innerHTML = `
            <div class="download-info">
                <span class="download-icon">${downloadInfo.isWord ? '📄' : '📊'}</span>
                <span class="download-filename">${downloadInfo.filename}</span>
            </div>
            <a href="${downloadInfo.url}" download="${downloadInfo.filename}" class="download-btn">
                Descargar Archivo
            </a>
        `;
        content.appendChild(card);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
    removeTypingIndicator();
    const chatContainer = document.getElementById('chatContainer');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typingIndicator';

    typingDiv.innerHTML = `
        <div class="message-avatar ai-avatar">KF</div>
        <div class="message-content">
            <div class="message-role">KOFU NEURAL</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingIndicator() {
    const ind = document.getElementById('typingIndicator');
    if (ind) ind.remove();
}

async function handleUserSubmit() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    const docType = document.getElementById('documentType').value;
    const template = document.getElementById('templateSelect').value;

    if (!message && !selectedFile) return;

    if (currentMode === 'online') {
        const key = getApiKey();
        if (!key) {
            addMessage('Por favor ingresa tu API Key en la barra lateral para utilizar el modo Online.', 'ai', true);
            return;
        }
    }

    // Mostrar mensaje del usuario
    if (message) {
        addMessage(message, 'user');
    } else if (selectedFile) {
        addMessage(`📄 Archivo adjuntado: ${selectedFile.name}`, 'user');
    }

    input.value = '';
    autoResizeTextarea();

    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    incrementTask();
    showTypingIndicator();

    try {
        if (selectedFile) {
            // Pipeline real de archivo:
            // 1. Extraer contenido mediante el ingester offline
            const fileData = await uploadAndIngestFile(selectedFile);
            
            if (docType) {
                // 2. Si se solicitó Word o PowerPoint, generar documento usando el contenido extraído
                const topic = message || selectedFile.name.replace(/\.[^.]+$/, '');
                await generateOfficeDocument(topic, docType, template, fileData.text_content);
            } else {
                // 3. Si era solo chat, responder con resumen o análisis del archivo
                removeTypingIndicator();
                let summary = `✅ **Archivo "${fileData.filename}" analizado exitosamente.**\n\n`;
                summary += `Tipo: ${fileData.file_type.toUpperCase()} | Longitud: ${fileData.text_content.length} caracteres.\n\n`;
                summary += `Contenido extraído:\n\n${fileData.text_content.substring(0, 1500)}`;
                if (fileData.text_content.length > 1500) {
                    summary += "\n\n... [Texto truncado para vista previa]";
                }
                addMessage(summary, 'ai');
            }
            removeSelectedFile();
        } else if (docType) {
            // Generación de documento directa desde texto
            await generateOfficeDocument(message, docType, template, null);
        } else {
            // Conversación normal
            const responseText = await sendChatMessage(message);
            removeTypingIndicator();
            addMessage(responseText, 'ai');
        }
    } catch (err) {
        removeTypingIndicator();
        addMessage(`Error: ${err.message || 'Fallo de comunicación con el motor Kofu.'}`, 'ai', true);
    } finally {
        sendBtn.disabled = false;
        decrementTask();
    }
}

async function uploadAndIngestFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    if (getApiKey()) formData.append('api_key', getApiKey());

    const resp = await fetch(`${API_BASE}/files/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al procesar el archivo cargado.');
    }

    return await resp.json();
}

async function generateOfficeDocument(topic, docType, template, sourceContent) {
    const isWord = docType === 'word';
    const endpoint = isWord ? '/office/word/download' : '/office/powerpoint/download';
    const cleanTopic = topic || (isWord ? 'Documento_Kofu' : 'Presentacion_Kofu');
    const safeTopicName = cleanTopic.substring(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = isWord ? `Kofu_${safeTopicName}.docx` : `Kofu_${safeTopicName}.pptx`;

    const body = {
        topic: cleanTopic,
        filename,
        template: template || undefined,
        style: isWord ? 'professional' : undefined,
        theme: isWord ? undefined : 'professional',
        modo: currentMode,
        model: docModel || chatModel,
        api_key: getApiKey(),
        source_content: sourceContent || undefined,
    };

    const resp = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Fallo al generar el archivo ofimático.');
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const backupSaved = resp.headers.get('X-Backup-Saved') === 'true';

    removeTypingIndicator();
    let msg = `✅ ${isWord ? 'Documento Word (.docx)' : 'Presentación PowerPoint (.pptx)'} generado con éxito.`;
    if (template) msg += `\n🎨 Plantilla aplicada: ${template.replace(/\.[^.]+$/, '')}`;
    if (backupSaved) msg += `\n💾 Copia de respaldo guardada en la carpeta /archivos.`;

    addMessage(msg, 'ai', false, { url, filename, isWord });
}

async function sendChatMessage(message) {
    const resp = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            show_thinking: false,
            model: chatModel,
            modo: currentMode,
            api_key: getApiKey(),
        }),
    });

    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al comunicarse con Ollama.');
    }

    const data = await resp.json();
    return data.response;
}
