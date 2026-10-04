import { Injectable } from '@nestjs/common';

@Injectable()
export class GetEmbedScriptService {
  execute(): string {
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
}
