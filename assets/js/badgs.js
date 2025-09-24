import { DB, K_ANIMAIS, K_CONTATOS } from './storage.js';
const el = document.getElementById('navTotals');
if (el) {
  const fav = DB.get(K_ANIMAIS, []).length;
  const forms = DB.get(K_CONTATOS, []).length;
  el.textContent = String(fav + forms);
}
