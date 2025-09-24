import { toast } from './ui.js';

let deferredPrompt = null;
const btn = document.getElementById('btnInstall');
if (btn) btn.classList.add('d-none');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btn?.classList.remove('d-none');
});

btn?.addEventListener('click', async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  toast(outcome === 'accepted' ? 'App instalado!' : 'Instalação cancelada.');
  deferredPrompt = null;
  btn.classList.add('d-none');
});

// avisa quando o SW atualizou
navigator.serviceWorker?.addEventListener('controllerchange', () =>
  toast('App atualizado. Recarregue para aplicar.', 'info', 3500)
);
