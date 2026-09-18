/**
 * AYUSH-IPR GUARDIAN — Testing Studio Client Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Feather Icons
  if (window.feather) feather.replace();

  // --- STATE ---
  const state = {
    baseUrl: 'https://least-tall-continent-display.trycloudflare.com',
    bypassLocaltunnel: true,
    isConnected: false,
    ragDbRecords: [],
    history: [],
    mediaRecorder: null,
    audioChunks: [],
    recordInterval: null,
    recordSeconds: 0,
  };

  // --- DOM ELEMENTS ---
  const serverUrlInput = document.getElementById('serverUrlInput');
  const btnCheckHealth = document.getElementById('btnCheckHealth');
  const chkLocaltunnelBypass = document.getElementById('chkLocaltunnelBypass');
  const globalStatusDot = document.getElementById('globalStatusDot');

  // Telemetry
  const gpu0Allocated = document.getElementById('gpu0Allocated');
  const gpu0Meter = document.getElementById('gpu0Meter');
  const gpu0ModelName = document.getElementById('gpu0ModelName');
  const gpu0Free = document.getElementById('gpu0Free');
  const gpu1Allocated = document.getElementById('gpu1Allocated');
  const gpu1Meter = document.getElementById('gpu1Meter');
  const gpu1Free = document.getElementById('gpu1Free');
  const ragRecordCount = document.getElementById('ragRecordCount');
  const lastLatencyMetric = document.getElementById('lastLatencyMetric');

  // Navigation
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Chat
  const promptInput = document.getElementById('promptInput');
  const btnSendPrompt = document.getElementById('btnSendPrompt');
  const sliderTopK = document.getElementById('sliderTopK');
  const valTopK = document.getElementById('valTopK');
  const responseStreamArea = document.getElementById('responseStreamArea');
  const chatWelcomeCard = document.getElementById('chatWelcomeCard');
  const chatThread = document.getElementById('chatThread');
  const btnClearThread = document.getElementById('btnClearThread');
  const presetChips = document.querySelectorAll('.preset-chip[data-query]');
  const retrievedSourcesList = document.getElementById('retrievedSourcesList');
  const sourcesCount = document.getElementById('sourcesCount');

  // Latency metrics sidebar
  const metricTotalTime = document.getElementById('metricTotalTime');
  const metricSearchTime = document.getElementById('metricSearchTime');
  const metricGenTime = document.getElementById('metricGenTime');
  const metricModelName = document.getElementById('metricModelName');
  const barRetrieval = document.getElementById('barRetrieval');
  const barGeneration = document.getElementById('barGeneration');

  // Classifier
  const tagInputBox = document.getElementById('tagInputBox');
  const tagsContainer = document.getElementById('tagsContainer');
  const ingredientInput = document.getElementById('ingredientInput');
  const btnAddIngredient = document.getElementById('btnAddIngredient');
  const selectDosageForm = document.getElementById('selectDosageForm');
  const btnRunClassify = document.getElementById('btnRunClassify');
  const classifyOutputBody = document.getElementById('classifyOutputBody');
  const classifyStatusBadge = document.getElementById('classifyStatusBadge');

  // Voice
  const btnToggleRecord = document.getElementById('btnToggleRecord');
  const recordPulseRing = document.getElementById('recordPulseRing');
  const recordMicIcon = document.getElementById('recordMicIcon');
  const recordTimer = document.getElementById('recordTimer');
  const recordStatusLabel = document.getElementById('recordStatusLabel');
  const audioDropZone = document.getElementById('audioDropZone');
  const audioFileInput = document.getElementById('audioFileInput');
  const chosenAudioName = document.getElementById('chosenAudioName');
  const btnTranscribeUpload = document.getElementById('btnTranscribeUpload');
  const transcriptionText = document.getElementById('transcriptionText');
  const btnSendAsrToChat = document.getElementById('btnSendAsrToChat');
  const btnCopyTranscription = document.getElementById('btnCopyTranscription');
  const asrMetricsRow = document.getElementById('asrMetricsRow');
  const asrDetectedLang = document.getElementById('asrDetectedLang');
  const asrProb = document.getElementById('asrProb');
  const asrDuration = document.getElementById('asrDuration');
  const asrLangSelect = document.getElementById('asrLangSelect');

  // PDF Viewer
  const docLinkBtns = document.querySelectorAll('.doc-link-btn');
  const pdfViewerTitle = document.getElementById('pdfViewerTitle');
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');
  const btnOpenPdfNewTab = document.getElementById('btnOpenPdfNewTab');
  const pdfIframe = document.getElementById('pdfIframe');
  const pdfFrameWrapper = document.getElementById('pdfFrameWrapper');
  const ragDbExplorerWrapper = document.getElementById('ragDbExplorerWrapper');
  const dbSearchInput = document.getElementById('dbSearchInput');
  const dbMatchCount = document.getElementById('dbMatchCount');
  const dbRecordsGrid = document.getElementById('dbRecordsGrid');

  // Benchmark
  const btnRunAllBenchmarks = document.getElementById('btnRunAllBenchmarks');
  const benchmarkTableBody = document.getElementById('benchmarkTableBody');
  const benchmarkSummaryBar = document.getElementById('benchmarkSummaryBar');
  const benchPassedCount = document.getElementById('benchPassedCount');
  const benchFailedCount = document.getElementById('benchFailedCount');
  const benchAvgLatency = document.getElementById('benchAvgLatency');
  const benchTotalTime = document.getElementById('benchTotalTime');

  // History & Modal
  const historyListContainer = document.getElementById('historyListContainer');
  const historyBadgeCount = document.getElementById('historyBadgeCount');
  const btnExportHistoryJson = document.getElementById('btnExportHistoryJson');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const jsonModal = document.getElementById('jsonModal');
  const jsonModalBody = document.getElementById('jsonModalBody');
  const btnCloseJsonModal = document.getElementById('btnCloseJsonModal');
  const btnDoneModal = document.getElementById('btnDoneModal');
  const btnCopyModalJson = document.getElementById('btnCopyModalJson');

  // --- API HELPER ---
  function getHeaders(isMultipart = false) {
    const headers = {};
    if (state.bypassLocaltunnel) {
      headers['Bypass-Tunnel-Reminder'] = 'true';
    }
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  function cleanUrl(url) {
    return url.replace(/\/+$/, '');
  }

  // --- 1. HEALTH & TELEMETRY ---
  async function checkServerHealth() {
    state.baseUrl = cleanUrl(serverUrlInput.value.trim());
    state.bypassLocaltunnel = chkLocaltunnelBypass.checked;

    globalStatusDot.className = 'status-dot connecting';
    btnCheckHealth.innerHTML = '<i data-feather="loader"></i><span>Checking...</span>';
    if (window.feather) feather.replace();

    try {
      const t0 = performance.now();
      const res = await fetch(`${state.baseUrl}/api/health`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const latency = Math.round(performance.now() - t0);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      state.isConnected = true;
      globalStatusDot.className = 'status-dot online';
      lastLatencyMetric.textContent = `${latency} ms`;

      // Update GPU 0
      if (data.gpu && data.gpu.gpu_0) {
        const g0 = data.gpu.gpu_0;
        gpu0Allocated.textContent = `${g0.allocated_gb} / ${g0.total_gb} GB`;
        const pct0 = Math.round((g0.allocated_gb / g0.total_gb) * 100);
        gpu0Meter.style.width = `${pct0}%`;
        gpu0Free.textContent = `${g0.free_gb} GB Free`;
      }

      // Update GPU 1
      if (data.gpu && data.gpu.gpu_1) {
        const g1 = data.gpu.gpu_1;
        gpu1Allocated.textContent = `${g1.allocated_gb} / ${g1.total_gb} GB`;
        const pct1 = Math.round((g1.allocated_gb / g1.total_gb) * 100);
        gpu1Meter.style.width = `${pct1}%`;
        gpu1Free.textContent = `${g1.free_gb} GB Free`;
      }

      // Model metadata
      if (data.models && data.models.llm) {
        gpu0ModelName.textContent = data.models.llm.name || 'Qwen2.5-7B (4-bit)';
        metricModelName.textContent = data.models.llm.name || 'Qwen2.5-7B';
      }
      if (data.models && data.models.rag_db) {
        ragRecordCount.textContent = data.models.rag_db.records || 362;
      }

    } catch (err) {
      console.error('Health check error:', err);
      state.isConnected = false;
      globalStatusDot.className = 'status-dot offline';
      lastLatencyMetric.textContent = 'Timeout / Offline';
    } finally {
      btnCheckHealth.innerHTML = '<i data-feather="activity"></i><span>Ping</span>';
      if (window.feather) feather.replace();
    }
  }

  btnCheckHealth.addEventListener('click', checkServerHealth);
  serverUrlInput.addEventListener('change', checkServerHealth);

  // --- 2. NAVIGATION TABS ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(btn.dataset.tab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Slider Top-K
  sliderTopK.addEventListener('input', (e) => {
    valTopK.textContent = e.target.value;
  });

  // Clear thread
  btnClearThread.addEventListener('click', () => {
    chatThread.innerHTML = '';
    chatThread.style.display = 'none';
    chatWelcomeCard.style.display = 'block';
    retrievedSourcesList.innerHTML = `
      <div class="empty-sources-msg">
        <i data-feather="file-minus"></i>
        <p>Retrieved statutory citations and relevance scores will appear here after sending a prompt.</p>
      </div>`;
    sourcesCount.textContent = '0';
    if (window.feather) feather.replace();
  });

  // Preset Chips
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      promptInput.value = chip.dataset.query;
      promptInput.focus();
    });
  });

  // --- 3. RAG CHAT QUERY EXECUTION (STREAMING ENABLED) ---
  async function executeChatQuery(query) {
    if (!query || !query.trim()) return;
    query = query.trim();

    state.baseUrl = cleanUrl(serverUrlInput.value.trim());
    state.bypassLocaltunnel = chkLocaltunnelBypass.checked;

    // Show thread, hide welcome
    chatWelcomeCard.style.display = 'none';
    chatThread.style.display = 'flex';

    // Append User Bubble
    appendChatBubble('user', query);
    promptInput.value = '';

    // Append Assistant Loading Bubble
    const assistantBubble = appendChatBubble('assistant', 'Searching 362 statutory records & generating legal analysis...');
    const contentCard = assistantBubble.querySelector('.markdown-body');
    const turnaroundPill = assistantBubble.querySelector('.turnaround-pill');

    // UI Loading state
    btnSendPrompt.disabled = true;
    btnSendPrompt.innerHTML = '<i data-feather="loader"></i><span>Streaming...</span>';
    if (window.feather) feather.replace();

    const t0 = performance.now();
    let accumulatedText = '';
    let sources = [];
    let searchTimeMs = 0;

    try {
      const topK = parseInt(sliderTopK.value, 10) || 7;
      
      // Attempt SSE Streaming endpoint first
      const res = await fetch(`${state.baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ query, top_k: topK }),
      });

      if (!res.ok) {
        // Fallback to regular chat endpoint if stream not ready
        console.warn('Streaming endpoint returned error, falling back to /api/chat');
        const fallbackRes = await fetch(`${state.baseUrl}/api/chat`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ query, top_k: topK }),
        });
        if (!fallbackRes.ok) {
          throw new Error(`Server returned HTTP ${fallbackRes.status}: ${await fallbackRes.text()}`);
        }
        const data = await fallbackRes.json();
        accumulatedText = data.answer || 'No answer generated.';
        sources = data.sources || [];
        const totalElapsedMs = Math.round(performance.now() - t0);
        contentCard.innerHTML = marked.parse(accumulatedText);
        turnaroundPill.textContent = `${(totalElapsedMs / 1000).toFixed(2)}s`;
        renderRetrievedSources(sources);
        addBubbleActions(assistantBubble, accumulatedText, data);
        addToHistory(query, accumulatedText, totalElapsedMs, sources.length, data);
        return;
      }

      // Check if response is JSON (e.g. instant greeting response)
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        accumulatedText = data.answer || 'No answer generated.';
        sources = data.sources || [];
        const totalElapsedMs = Math.round(performance.now() - t0);
        contentCard.innerHTML = marked.parse(accumulatedText);
        turnaroundPill.textContent = `${(totalElapsedMs / 1000).toFixed(2)}s`;
        renderRetrievedSources(sources);
        addBubbleActions(assistantBubble, accumulatedText, data);
        addToHistory(query, accumulatedText, totalElapsedMs, sources.length, data);
        metricTotalTime.textContent = `${(totalElapsedMs / 1000).toFixed(2)} s`;
        lastLatencyMetric.textContent = `${totalElapsedMs} ms`;
        metricGenTime.textContent = `${totalElapsedMs} ms`;
        return;
      }

      // Stream reader for text/event-stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      contentCard.innerHTML = '<span class="streaming-cursor">▍</span>';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep partial line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (!dataStr) continue;

          try {
            const msg = JSON.parse(dataStr);
            if (msg.type === 'sources') {
              sources = msg.sources || [];
              searchTimeMs = msg.search_time_ms || 0;
              renderRetrievedSources(sources);
              metricSearchTime.textContent = `${searchTimeMs} ms`;
            } else if (msg.type === 'token') {
              accumulatedText += msg.token;
              contentCard.innerHTML = marked.parse(accumulatedText) + '<span class="streaming-cursor">▍</span>';
              const curElapsedSec = ((performance.now() - t0) / 1000).toFixed(1);
              turnaroundPill.textContent = `${curElapsedSec}s`;

              if (document.getElementById('chkAutoScroll').checked) {
                responseStreamArea.scrollTop = responseStreamArea.scrollHeight;
              }
            } else if (msg.type === 'done') {
              // Generation completed
            }
          } catch (e) {
            console.error('SSE parse error:', e, dataStr);
          }
        }
      }

      // Final Render
      const totalElapsedMs = Math.round(performance.now() - t0);
      const totalElapsedSec = (totalElapsedMs / 1000).toFixed(2);
      contentCard.innerHTML = marked.parse(accumulatedText || 'No answer generated.');
      turnaroundPill.textContent = `${totalElapsedSec}s`;

      const fullJson = {
        query,
        answer: accumulatedText,
        sources,
        metadata: {
          total_time_ms: totalElapsedMs,
          search_time_ms: searchTimeMs,
          generation_time_ms: Math.max(0, totalElapsedMs - searchTimeMs)
        }
      };

      addBubbleActions(assistantBubble, accumulatedText, fullJson);

      // Update Sidebar Metrics
      metricTotalTime.textContent = `${totalElapsedSec} s`;
      lastLatencyMetric.textContent = `${totalElapsedMs} ms`;
      const genMs = Math.max(0, totalElapsedMs - searchTimeMs);
      metricGenTime.textContent = `${genMs} ms`;

      // Update split bar
      const searchPct = Math.max(5, Math.min(95, Math.round((searchTimeMs / totalElapsedMs) * 100)));
      barRetrieval.style.width = `${searchPct}%`;
      barGeneration.style.width = `${100 - searchPct}%`;

      // Add to Session History
      addToHistory(query, accumulatedText, totalElapsedMs, sources.length, fullJson);

    } catch (err) {
      console.error('Chat query error:', err);
      contentCard.innerHTML = `<div class="badge danger">Error: ${err.message}</div><p style="margin-top: 8px; color: var(--text-muted);">Ensure Kaggle server is running and the tunnel URL matches above.</p>`;
      turnaroundPill.textContent = 'Error';
    } finally {
      btnSendPrompt.disabled = false;
      btnSendPrompt.innerHTML = '<i data-feather="send"></i><span>Send Prompt</span>';
      if (window.feather) feather.replace();

      if (document.getElementById('chkAutoScroll').checked) {
        responseStreamArea.scrollTop = responseStreamArea.scrollHeight;
      }
    }
  }

  function appendChatBubble(role, rawContent) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;

    const avatar = role === 'user' ? 'U' : '<i data-feather="shield"></i>';
    const sender = role === 'user' ? 'You (Legal Analyst)' : 'AYUSH-IPR GUARDIAN';

    bubble.innerHTML = `
      <div class="chat-avatar">${avatar}</div>
      <div class="chat-content-card">
        <div class="chat-content-header">
          <span class="sender-name">${sender}</span>
          <span class="turnaround-pill">...</span>
        </div>
        <div class="markdown-body">${marked.parse(rawContent)}</div>
      </div>
    `;

    chatThread.appendChild(bubble);
    if (window.feather) feather.replace();
    return bubble;
  }

  function addBubbleActions(bubble, answerText, fullJson) {
    const contentCard = bubble.querySelector('.chat-content-card');
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'bubble-actions';

    actionsDiv.innerHTML = `
      <button class="btn btn-ghost btn-sm btn-copy-ans"><i data-feather="copy"></i> Copy</button>
      <button class="btn btn-ghost btn-sm btn-inspect-json"><i data-feather="code"></i> Raw JSON</button>
    `;

    actionsDiv.querySelector('.btn-copy-ans').addEventListener('click', () => {
      navigator.clipboard.writeText(answerText);
      alert('Answer copied to clipboard!');
    });

    actionsDiv.querySelector('.btn-inspect-json').addEventListener('click', () => {
      openJsonModal(fullJson);
    });

    contentCard.appendChild(actionsDiv);
    if (window.feather) feather.replace();
  }

  function renderRetrievedSources(sources) {
    sourcesCount.textContent = sources.length;
    if (!sources || sources.length === 0) {
      retrievedSourcesList.innerHTML = `
        <div class="empty-sources-msg">
          <i data-feather="file-minus"></i>
          <p>No statutory documents retrieved for this query.</p>
        </div>`;
      if (window.feather) feather.replace();
      return;
    }

    retrievedSourcesList.innerHTML = sources.map((s, idx) => {
      const score = s.score !== undefined ? s.score : 0;
      const scoreCls = score > 0.5 ? 'high' : 'med';
      const scoreLabel = score.toFixed(4);
      const title = s.title || s.doc_id || `Source Document #${idx + 1}`;
      const citation = s.citation || s.doc_id || '';
      const snippet = s.text || s.content_plain || s.content || 'Statutory text chunk';

      return `
        <div class="source-card">
          <div class="source-card-header">
            <span class="source-title" title="${title}">[${idx + 1}] ${title}</span>
            <span class="score-badge ${scoreCls}">Score: ${scoreLabel}</span>
          </div>
          ${citation ? `<div class="source-citation-line">${citation}</div>` : ''}
          <div class="source-snippet">${snippet}</div>
        </div>
      `;
    }).join('');

    if (window.feather) feather.replace();
  }

  btnSendPrompt.addEventListener('click', () => executeChatQuery(promptInput.value));
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeChatQuery(promptInput.value);
    }
  });

  // --- 4. FORMULATION CLASSIFIER ---
  const currentTags = ['Withania somnifera (Ashwagandha)', 'Bacopa monnieri (Brahmi)'];

  function renderTags() {
    tagsContainer.innerHTML = currentTags.map((tag, i) => `
      <span class="tag-chip">
        ${tag}
        <span class="tag-chip-remove" data-index="${i}">&times;</span>
      </span>
    `).join('');

    document.querySelectorAll('.tag-chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        currentTags.splice(idx, 1);
        renderTags();
      });
    });
  }
  renderTags();

  function addCurrentIngredient() {
    const val = ingredientInput.value.trim();
    if (val && !currentTags.includes(val)) {
      currentTags.push(val);
      renderTags();
      ingredientInput.value = '';
    }
  }

  btnAddIngredient.addEventListener('click', addCurrentIngredient);
  ingredientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCurrentIngredient();
    }
  });

  // Preset formulation buttons
  document.getElementById('presetChyawanprash').addEventListener('click', () => {
    currentTags.length = 0;
    currentTags.push('Emblica officinalis (Amalaki)', 'Dashamula (Ten Roots)', 'Ashtavarga', 'Pippali', 'Ghee', 'Honey');
    selectDosageForm.value = 'Churna (Powder)';
    document.getElementById('referenceText').value = 'Charaka Samhita (Chikitsa Sthana)';
    renderTags();
  });

  document.getElementById('presetAshwagandhaSyrup').addEventListener('click', () => {
    currentTags.length = 0;
    currentTags.push('Withania somnifera (Ashwagandha)', 'Bacopa monnieri (Brahmi)', 'Convolvulus pluricaulis (Shankhpushpi)');
    selectDosageForm.value = 'Syrup / Liquid Oral';
    document.getElementById('referenceText').value = '';
    renderTags();
  });

  document.getElementById('presetCurcuminExtract').addEventListener('click', () => {
    currentTags.length = 0;
    currentTags.push('Curcuma longa 95% Nanoparticle Extract', 'Piperine Bio-enhancer Complex', 'Liposomal Phosphatidylcholine Carrier');
    selectDosageForm.value = 'Capsule / Novel Delivery';
    document.getElementById('referenceText').value = '';
    renderTags();
  });

  btnRunClassify.addEventListener('click', async () => {
    if (currentTags.length === 0) {
      alert('Please enter at least one ingredient.');
      return;
    }

    state.baseUrl = cleanUrl(serverUrlInput.value.trim());
    state.bypassLocaltunnel = chkLocaltunnelBypass.checked;

    classifyStatusBadge.className = 'badge';
    classifyStatusBadge.textContent = 'Classifying...';
    classifyOutputBody.innerHTML = `
      <div class="placeholder-box">
        <i data-feather="loader"></i>
        <p>Running statutory classification against Drugs & Cosmetics Act Chapter IV-A, First Schedule, and Section 3(d)/3(p) Patent filters...</p>
      </div>`;
    if (window.feather) feather.replace();

    try {
      const res = await fetch(`${state.baseUrl}/api/classify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ingredients: currentTags,
          dosage_form: selectDosageForm.value,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();

      classifyStatusBadge.className = 'badge success';
      classifyStatusBadge.textContent = 'Analysis Complete';
      classifyOutputBody.innerHTML = marked.parse(data.answer || 'No guidance returned.');

    } catch (err) {
      console.error('Classification error:', err);
      classifyStatusBadge.className = 'badge danger';
      classifyStatusBadge.textContent = 'Error';
      classifyOutputBody.innerHTML = `<div class="badge danger">Error: ${err.message}</div>`;
    }
  });

  // --- 5. VOICE / ASR TESTING ---
  let recordStartTime = 0;

  btnToggleRecord.addEventListener('click', async () => {
    if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
      // STOP RECORDING
      state.mediaRecorder.stop();
      clearInterval(state.recordInterval);
      btnToggleRecord.classList.remove('recording');
      recordPulseRing.classList.remove('active');
      recordStatusLabel.textContent = 'Processing recorded audio...';
      return;
    }

    // START RECORDING
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.audioChunks = [];
      state.mediaRecorder = new MediaRecorder(stream);

      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) state.audioChunks.push(e.data);
      };

      state.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(state.audioChunks, { type: 'audio/wav' });
        recordStatusLabel.textContent = `Recording saved (${(audioBlob.size / 1024).toFixed(1)} KB)`;
        transcribeAudioBlob(audioBlob, 'recorded_audio.wav');
        stream.getTracks().forEach(track => track.stop());
      };

      state.mediaRecorder.start();
      btnToggleRecord.classList.add('recording');
      recordPulseRing.classList.add('active');
      recordStatusLabel.textContent = 'Recording live microphone audio... Click to Stop';

      recordStartTime = Date.now();
      state.recordSeconds = 0;
      state.recordInterval = setInterval(() => {
        state.recordSeconds++;
        const m = String(Math.floor(state.recordSeconds / 60)).padStart(2, '0');
        const s = String(state.recordSeconds % 60).padStart(2, '0');
        recordTimer.textContent = `${m}:${s}`;
      }, 1000);

    } catch (err) {
      alert(`Microphone access error: ${err.message}`);
    }
  });

  // Audio file upload
  audioDropZone.addEventListener('click', () => audioFileInput.click());
  audioFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      chosenAudioName.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      btnTranscribeUpload.disabled = false;
    }
  });

  btnTranscribeUpload.addEventListener('click', () => {
    if (audioFileInput.files.length > 0) {
      transcribeAudioBlob(audioFileInput.files[0], audioFileInput.files[0].name);
    }
  });

  async function transcribeAudioBlob(blob, filename) {
    state.baseUrl = cleanUrl(serverUrlInput.value.trim());
    transcriptionText.value = 'Transcribing with faster-whisper on Kaggle GPU 0...';

    const formData = new FormData();
    formData.append('audio', blob, filename);
    const lang = asrLangSelect.value;
    if (lang) formData.append('language', lang);

    try {
      const res = await fetch(`${state.baseUrl}/api/transcribe`, {
        method: 'POST',
        headers: state.bypassLocaltunnel ? { 'Bypass-Tunnel-Reminder': 'true' } : {},
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();

      transcriptionText.value = data.text || 'No transcription speech detected.';
      asrMetricsRow.style.display = 'flex';
      asrDetectedLang.textContent = data.language || 'auto';
      asrProb.textContent = data.language_probability ? `${(data.language_probability * 100).toFixed(1)}%` : '--';
      asrDuration.textContent = data.duration ? `${data.duration}s` : '--';

    } catch (err) {
      transcriptionText.value = `ASR Error: ${err.message}`;
    }
  }

  btnSendAsrToChat.addEventListener('click', () => {
    const text = transcriptionText.value.trim();
    if (text) {
      document.getElementById('tabChat').click();
      promptInput.value = text;
      executeChatQuery(text);
    }
  });

  btnCopyTranscription.addEventListener('click', () => {
    navigator.clipboard.writeText(transcriptionText.value);
    alert('Transcription text copied to clipboard!');
  });

  // --- 6. PDF & KNOWLEDGE VIEWER ---
  docLinkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      docLinkBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const doc = btn.dataset.doc;
      const title = btn.dataset.title;
      pdfViewerTitle.textContent = title;

      if (doc === 'rag-db') {
        pdfFrameWrapper.style.display = 'none';
        ragDbExplorerWrapper.style.display = 'flex';
        btnDownloadPdf.style.display = 'none';
        btnOpenPdfNewTab.style.display = 'none';
        loadClientRagDatabase();
      } else {
        pdfFrameWrapper.style.display = 'block';
        ragDbExplorerWrapper.style.display = 'none';
        btnDownloadPdf.style.display = 'inline-flex';
        btnOpenPdfNewTab.style.display = 'inline-flex';

        pdfIframe.src = doc;
        btnDownloadPdf.href = doc;
        btnOpenPdfNewTab.href = doc;
      }
    });
  });

  async function loadClientRagDatabase() {
    if (state.ragDbRecords.length > 0) {
      renderDbRecords(state.ragDbRecords);
      return;
    }

    dbRecordsGrid.innerHTML = '<div class="placeholder-box"><i data-feather="loader"></i><p>Loading 362 Master UDO Records...</p></div>';
    if (window.feather) feather.replace();

    try {
      const res = await fetch('rag_database_master.json');
      if (!res.ok) throw new Error('Local rag_database_master.json not found');
      state.ragDbRecords = await res.json();
      dbMatchCount.textContent = `Loaded ${state.ragDbRecords.length} Records`;
      renderDbRecords(state.ragDbRecords);
    } catch (err) {
      dbRecordsGrid.innerHTML = `<div class="badge danger">Could not load local JSON: ${err.message}</div>`;
    }
  }

  function renderDbRecords(records) {
    dbMatchCount.textContent = `Showing ${records.length} Records`;
    if (records.length === 0) {
      dbRecordsGrid.innerHTML = '<div class="empty-sources-msg"><p>No records matched your search query.</p></div>';
      return;
    }

    dbRecordsGrid.innerHTML = records.slice(0, 50).map(r => {
      const title = r.title || r.doc_id;
      const docId = r.doc_id || '';
      const text = r.content_plain || r.content || '';
      const source = r.source_act || r.rag_config?.citation_format || '';

      return `
        <div class="db-record-card">
          <div class="db-record-top">
            <span class="db-record-id">${docId}</span>
            <span class="meta-pill">${source}</span>
          </div>
          <div class="db-record-title">${title}</div>
          <div class="db-record-text">${text}</div>
        </div>
      `;
    }).join('');
  }

  dbSearchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderDbRecords(state.ragDbRecords);
      return;
    }
    const filtered = state.ragDbRecords.filter(r => {
      const t = (r.title || '').toLowerCase();
      const id = (r.doc_id || '').toLowerCase();
      const c = (r.content_plain || r.content || '').toLowerCase();
      return t.includes(q) || id.includes(q) || c.includes(q);
    });
    renderDbRecords(filtered);
  });

  // --- 7. BENCHMARK SUITE ---
  const CANONICAL_TESTS = [
    {
      id: 1,
      name: 'Ashwagandha S.3(p) Patentability Bar',
      query: 'Can I patent a traditional Ashwagandha formulation that is documented in Charaka Samhita?',
      expectedCitation: 'Section 3',
    },
    {
      id: 2,
      name: 'Spurious AYUSH Drugs Definition',
      query: 'What is considered a spurious AYUSH drug under Section 33EEA of the Drugs and Cosmetics Act?',
      expectedCitation: '33EEA',
    },
    {
      id: 3,
      name: 'Ayurvedic Churna Shelf Life',
      query: 'What is the statutory shelf life of Churna (powder) preparations in Ayurveda under Rule 161B?',
      expectedCitation: '161B',
    },
    {
      id: 4,
      name: 'Schedule T GMP Compliance',
      query: 'What are the GMP requirements under Schedule T for manufacturing Ayurvedic medicines?',
      expectedCitation: 'Schedule T',
    },
    {
      id: 5,
      name: 'First Schedule Authoritative Books',
      query: 'List the authoritative books recognized for the Ayurvedic system in the First Schedule.',
      expectedCitation: 'First Schedule',
    },
  ];

  function renderBenchmarkTable() {
    benchmarkTableBody.innerHTML = CANONICAL_TESTS.map((t, idx) => `
      <tr id="benchRow${t.id}">
        <td>${idx + 1}</td>
        <td><strong>${t.name}</strong><br><small style="color: var(--text-muted);">${t.query}</small></td>
        <td><code>${t.expectedCitation}</code></td>
        <td><span class="badge" id="benchStatus${t.id}">Ready</span></td>
        <td id="benchLatency${t.id}">--</td>
        <td id="benchCitVerify${t.id}">--</td>
        <td id="benchDiscVerify${t.id}">--</td>
        <td>
          <button class="btn btn-secondary btn-sm btn-run-single-bench" data-id="${t.id}">Run</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.btn-run-single-bench').forEach(b => {
      b.addEventListener('click', () => runSingleBenchmark(parseInt(b.dataset.id, 10)));
    });
  }
  renderBenchmarkTable();

  async function runSingleBenchmark(testId) {
    const test = CANONICAL_TESTS.find(t => t.id === testId);
    if (!test) return;

    state.baseUrl = cleanUrl(serverUrlInput.value.trim());
    state.bypassLocaltunnel = chkLocaltunnelBypass.checked;

    const statusBadge = document.getElementById(`benchStatus${test.id}`);
    const latencyCell = document.getElementById(`benchLatency${test.id}`);
    const citCell = document.getElementById(`benchCitVerify${test.id}`);
    const discCell = document.getElementById(`benchDiscVerify${test.id}`);

    statusBadge.className = 'badge';
    statusBadge.textContent = 'Running...';

    const t0 = performance.now();
    try {
      const res = await fetch(`${state.baseUrl}/api/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ query: test.query, top_k: 5 }),
      });

      const elapsed = Math.round(performance.now() - t0);
      latencyCell.textContent = `${(elapsed / 1000).toFixed(2)}s`;

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const ans = (data.answer || '').toLowerCase();

      const hasCitation = ans.includes(test.expectedCitation.toLowerCase());
      const hasDisclaimer = ans.includes('not legal advice') || ans.includes('disclaimer');

      citCell.innerHTML = hasCitation ? '<span class="badge success">✓ Found</span>' : '<span class="badge danger">✗ Missing</span>';
      discCell.innerHTML = hasDisclaimer ? '<span class="badge success">✓ Found</span>' : '<span class="badge danger">✗ Missing</span>';

      if (hasCitation && hasDisclaimer && ans.length > 50) {
        statusBadge.className = 'badge success';
        statusBadge.textContent = 'PASS';
        return { pass: true, latency: elapsed };
      } else {
        statusBadge.className = 'badge danger';
        statusBadge.textContent = 'FAIL';
        return { pass: false, latency: elapsed };
      }

    } catch (err) {
      statusBadge.className = 'badge danger';
      statusBadge.textContent = 'ERROR';
      citCell.textContent = err.message;
      return { pass: false, latency: 0 };
    }
  }

  btnRunAllBenchmarks.addEventListener('click', async () => {
    btnRunAllBenchmarks.disabled = true;
    btnRunAllBenchmarks.innerHTML = '<i data-feather="loader"></i><span>Running Benchmarks...</span>';
    benchmarkSummaryBar.style.display = 'grid';

    let passed = 0;
    let failed = 0;
    let totalLatency = 0;

    for (const test of CANONICAL_TESTS) {
      const result = await runSingleBenchmark(test.id);
      if (result.pass) passed++;
      else failed++;
      totalLatency += result.latency;
    }

    benchPassedCount.textContent = passed;
    benchFailedCount.textContent = failed;
    benchAvgLatency.textContent = `${(totalLatency / (CANONICAL_TESTS.length * 1000)).toFixed(2)}s`;
    benchTotalTime.textContent = `${(totalLatency / 1000).toFixed(1)}s`;

    btnRunAllBenchmarks.disabled = false;
    btnRunAllBenchmarks.innerHTML = '<i data-feather="play"></i><span>Run All 5 Canonical Benchmarks</span>';
    if (window.feather) feather.replace();
  });

  // --- 8. HISTORY & MODALS ---
  function addToHistory(query, answer, latencyMs, sourcesCount, fullJson) {
    const item = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      query,
      answer,
      latencyMs,
      sourcesCount,
      fullJson,
    };
    state.history.unshift(item);
    historyBadgeCount.textContent = state.history.length;
    renderHistory();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      historyListContainer.innerHTML = `
        <div class="empty-history-state">
          <i data-feather="inbox"></i>
          <p>No queries executed in this session yet.</p>
        </div>`;
      if (window.feather) feather.replace();
      return;
    }

    historyListContainer.innerHTML = state.history.map(item => `
      <div class="history-item-card">
        <div class="history-top">
          <span class="history-query">${item.query}</span>
          <div class="history-meta">
            <span>${item.time}</span>
            <span class="meta-pill highlight">${(item.latencyMs / 1000).toFixed(2)}s</span>
            <span class="meta-pill">${item.sourcesCount} Sources</span>
          </div>
        </div>
        <div class="history-snippet">${item.answer.slice(0, 200)}...</div>
      </div>
    `).join('');
  }

  btnClearHistory.addEventListener('click', () => {
    state.history = [];
    historyBadgeCount.textContent = '0';
    renderHistory();
  });

  btnExportHistoryJson.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state.history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ayush_ipr_test_history_${Date.now()}.json`;
    a.click();
  });

  function openJsonModal(jsonObj) {
    jsonModalBody.textContent = JSON.stringify(jsonObj, null, 2);
    jsonModal.classList.add('active');
  }

  function closeJsonModal() {
    jsonModal.classList.remove('active');
  }

  btnCloseJsonModal.addEventListener('click', closeJsonModal);
  btnDoneModal.addEventListener('click', closeJsonModal);
  btnCopyModalJson.addEventListener('click', () => {
    navigator.clipboard.writeText(jsonModalBody.textContent);
    alert('JSON payload copied to clipboard!');
  });

  // --- INITIAL CHECK ---
  checkServerHealth();
});
