// chaves
const K_ANIMAIS = 'as_animais';
const K_CONTATOS = 'as_contatos';

export const DB = {
  get(key, def = []) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; }
    catch { return def; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  push(key, item) { const arr = DB.get(key, []); arr.unshift(item); DB.set(key, arr); return arr; },
  removeAt(key, idx) { const arr = DB.get(key, []); arr.splice(idx, 1); DB.set(key, arr); return arr; },
  clearAll() { localStorage.removeItem(K_ANIMAIS); localStorage.removeItem(K_CONTATOS); }
};
export { K_ANIMAIS, K_CONTATOS };
