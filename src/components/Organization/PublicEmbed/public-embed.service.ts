import { Injectable } from '@nestjs/common';

@Injectable()
export class PublicEmbedService {
  getEmbedScript(): string {
    // The script determines its own base URL from the script src
    // and injects a floating button + iframe to open the chat widget.
    return `(() => {
  const script = document.currentScript;
  if (!script) return;

  const org = script.getAttribute('data-org');
  const token = script.getAttribute('data-token');
  const color = script.getAttribute('data-color') || '#5A3E95';
  const position = script.getAttribute('data-position') || 'bottom-right';
  const agent = script.getAttribute('data-agent') || '';
  if (!org || !token) {
    console.warn('[MAIA] Missing data-org or data-token');
    return;
  }

  const base = new URL(script.src).origin;
  const iframeUrl = new URL(base + '/public/embed/chat');
  iframeUrl.searchParams.set('org', org);
  iframeUrl.searchParams.set('token', token);
  if (agent) iframeUrl.searchParams.set('agent', agent);
  if (color) iframeUrl.searchParams.set('color', color);

  const container = document.createElement('div');
  container.id = 'splitai-container';
  container.style.position = 'fixed';
  container.style.zIndex = '2147483647';
  const [posY, posX] = position.split('-');
  const spacing = '20px';
  if (posY === 'bottom') container.style.bottom = spacing; else container.style.top = spacing;
  if (posX === 'right') container.style.right = spacing; else container.style.left = spacing;

  const button = document.createElement('button');
  button.id = 'splitai-button';
  button.setAttribute('aria-label', 'Abrir chat');
  button.textContent = 'Chat';
  button.style.background = color;
  button.style.color = '#ffffff';
  button.style.border = 'none';
  button.style.borderRadius = '9999px';
  button.style.padding = '12px 16px';
  button.style.minWidth = '56px';
  button.style.minHeight = '44px';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';

  const iframe = document.createElement('iframe');
  iframe.id = 'splitai-iframe';
  iframe.src = iframeUrl.toString();
  iframe.style.position = 'fixed';
  iframe.style.width = '380px';
  iframe.style.height = '560px';
  iframe.style.border = '0';
  iframe.style.borderRadius = '12px';
  iframe.style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)';
  iframe.style.display = 'none';
  iframe.style.zIndex = '2147483647';
  if (posY === 'bottom') iframe.style.bottom = spacing; else iframe.style.top = spacing;
  if (posX === 'right') iframe.style.right = spacing; else iframe.style.left = spacing;

  // Close button (shown when chat is open)
  const closeBtn = document.createElement('button');
  closeBtn.id = 'splitai-close';
  closeBtn.setAttribute('aria-label', 'Fechar chat');
  closeBtn.textContent = '✕';
  closeBtn.style.background = color;
  closeBtn.style.color = '#ffffff';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '9999px';
  closeBtn.style.width = '44px';
  closeBtn.style.height = '44px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
  closeBtn.style.display = 'none';
  closeBtn.style.zIndex = '2147483648';

  // Responsive styles via injected <style>
  const styleEl = document.createElement('style');
  styleEl.textContent = "#splitai-iframe { max-width: calc(100vw - 32px); max-height: calc(100dvh - 32px); }\n" +
    "@media (max-width: 480px), (max-height: 700px) {\n" +
    "  #splitai-iframe {\n" +
    "    width: 100vw !important;\n" +
    "    height: 100dvh !important;\n" +
    "    top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important;\n" +
    "    border-radius: 0 !important;\n" +
    "    box-shadow: none !important;\n" +
    "  }\n" +
    "  #splitai-button, #splitai-close {\n" +
    "    padding: 14px 16px !important;\n" +
    "    min-width: 56px !important;\n" +
    "    min-height: 56px !important;\n" +
    "  }\n" +
    "}\n";
  document.head.appendChild(styleEl);

  button.addEventListener('click', () => {
    const isOpen = iframe.style.display !== 'none';
    iframe.style.display = isOpen ? 'none' : 'block';
    button.style.display = isOpen ? 'inline-block' : 'none';
    closeBtn.style.display = isOpen ? 'none' : 'inline-flex';
  });

  closeBtn.addEventListener('click', () => {
    iframe.style.display = 'none';
    closeBtn.style.display = 'none';
    button.style.display = 'inline-block';
  });

  container.appendChild(button);
  container.appendChild(closeBtn);
  document.body.appendChild(container);
  document.body.appendChild(iframe);
})();`;
  }

  getEmbedChatHtml(): string {
    return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>MAIA Chat</title>
  <style>
    :root {
      --primary: #5A3E95;
      --primary-600: #4E357F;
      --primary-300: #8E64CF;
      --secondary: #F0F0F0;
      --bg: #0b1020;
      --surface: #11162a;
      --text: #ffffff;
    }
    html, body { margin: 0; padding: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; overscroll-behavior: contain; }
    .root { display: flex; flex-direction: column; min-height: 100dvh; background: linear-gradient(180deg, #0b1020 0%, #141433 100%); color: var(--text); -webkit-font-smoothing: antialiased; touch-action: manipulation; }
    .header { position: sticky; top: 0; padding: calc(12px + env(safe-area-inset-top)) 14px 12px; background: var(--primary); border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; letter-spacing: 0.2px; z-index: 1; }
    .messages { flex: 1; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .input { position: sticky; bottom: 0; display: flex; gap: 8px; padding: 12px; padding-bottom: calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid rgba(255,255,255,0.08); background: var(--bg); }
    .input input { flex: 1; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: #0f1530; color: var(--text); outline: none; }
    .input input:focus { border-color: var(--primary-300); box-shadow: 0 0 0 3px rgba(138, 99, 208, 0.2); }
    .input button { padding: 10px 12px; border-radius: 10px; border: 0; background: var(--primary); color: #fff; font-weight: 600; cursor: pointer; transition: background 0.2s ease; min-height: 44px; }
    .input button:hover { background: var(--primary-600); }
    .input button:disabled { opacity: 0.7; cursor: not-allowed; }
    .msg { max-width: 85%; background: rgba(255,255,255,0.06); padding: 10px 12px; border-radius: 12px; font-size: 14px; line-height: 1.4; }
    .msg.assistant { margin-right: auto; border-top-left-radius: 6px; }
    .msg.user { margin-left: auto; background: var(--primary-600); color: #fff; border-top-right-radius: 6px; }
    .typing { display: inline-flex; align-items: center; gap: 4px; padding: 8px 10px; }
    .typing .dot { width: 6px; height: 6px; background: #ffffff; opacity: 0.7; border-radius: 50%; display: inline-block; animation: typingBlink 1.4s infinite both; }
    .typing .dot:nth-child(1) { animation-delay: 0s; }
    .typing .dot:nth-child(2) { animation-delay: 0.2s; }
    .typing .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingBlink { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  </style>
</head>
<body>
  <div class="root">
    <div class="header">Assistente MAIA</div>
    <div id="messages" class="messages"></div>
    <div class="input">
      <input id="q" placeholder="Digite sua mensagem..." />
      <button id="send">Enviar</button>
    </div>
  </div>
  <script>
    const params = new URLSearchParams(location.search);
    const org = params.get('org');
    const token = params.get('token');
    const agent = params.get('agent') || '';
    const color = params.get('color') || '#5A3E95';
    document.documentElement.style.setProperty('--primary', color);
    const messagesEl = document.getElementById('messages');
    const inputEl = document.getElementById('q');
    const sendBtn = document.getElementById('send');
    const key = 'splitai:session:' + org + ':' + token + ':' + (agent || '_');
    let sessionId = localStorage.getItem(key) || '';

    // Typing indicator element
    const typingEl = document.createElement('div');
    typingEl.className = 'msg assistant typing';
    typingEl.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    typingEl.style.display = 'none';
    messagesEl.appendChild(typingEl);

    function setTyping(on) {
      typingEl.style.display = on ? 'inline-flex' : 'none';
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setSending(on) {
      sendBtn.disabled = on;
      inputEl.disabled = on;
      sendBtn.textContent = on ? 'Enviando...' : 'Enviar';
    }

    async function ensureSession() {
      if (sessionId) return sessionId;
      const res = await fetch('/public/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org, token, agentId: agent || undefined }),
      });
      if (!res.ok) throw new Error('Falha ao criar sessão');
      const js = await res.json();
      sessionId = js.session_id;
      localStorage.setItem(key, sessionId);
      return sessionId;
    }

    function addMsg(role, text) {
      const el = document.createElement('div');
      el.className = 'msg ' + (role === 'user' ? 'user' : 'assistant');
      el.textContent = text;
      messagesEl.insertBefore(el, typingEl); // keep typing indicator at the end
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    addMsg('assistant', 'Olá! Como posso ajudar?');

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendBtn.click();
      }
    });

    // Improve mobile keyboard behavior
    inputEl.addEventListener('focus', () => {
      setTimeout(() => { messagesEl.scrollTop = messagesEl.scrollHeight; }, 250);
    });
    window.addEventListener('resize', () => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });

    sendBtn.addEventListener('click', async () => {
      const val = inputEl.value.trim();
      if (!val) return;
      addMsg('user', val);
      inputEl.value = '';
      try {
        setSending(true);
        setTyping(true);
        const sid = await ensureSession();
        const res = await fetch('/public/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ org, token, session_id: sid, question: val, agentId: agent || undefined }),
        });
        const js = await res.json();
        if (res.ok && js && js.response) {
          const text = typeof js.response === 'string' ? js.response : JSON.stringify(js.response);
          addMsg('assistant', text);
        } else {
          addMsg('assistant', 'Desculpe, ocorreu um erro.');
        }
      } catch (e) {
        addMsg('assistant', 'Desculpe, não consegui enviar sua mensagem.');
      } finally {
        setTyping(false);
        setSending(false);
      }
    });
  </script>
</body>
</html>`;
  }
}
