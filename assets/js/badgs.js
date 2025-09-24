import { DB, K_ANIMAIS, K_CONTATOS } from './storage.js';

function readCounts(){
  const sf = document.getElementById('statFav');
  const sc = document.getElementById('statForms');
  const fav   = sf ? (parseInt(sf.textContent,10) || 0) : DB.get(K_ANIMAIS, []).length;
  const forms = sc ? (parseInt(sc.textContent,10) || 0) : DB.get(K_CONTATOS, []).length;
  return { fav, forms };
}

function updateBadge(){
  const el = document.getElementById('navTotals');
  if (!el) return;
  const { fav, forms } = readCounts();
  el.textContent = String(fav + forms);
}

// inicial
updateBadge();

// atualiza se outro script avisar ou outra aba mudar
window.addEventListener('as:updated', updateBadge);
window.addEventListener('storage', updateBadge);
