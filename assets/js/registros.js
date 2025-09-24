import { DB, K_ANIMAIS, K_CONTATOS } from './storage.js';

const listAnimais = document.getElementById('listAnimais');
const tbody = document.getElementById('tbodyContatos');
const btnExport = document.getElementById('btnExport');
const btnClear = document.getElementById('btnClear');

function renderAnimais(){
  const arr = DB.get(K_ANIMAIS, []);
  listAnimais.innerHTML = arr.length ? arr.map((a, i) => `
    <div class="col-6 col-md-3">
      <div class="card h-100 shadow-sm">
        <img src="${a.url}" class="card-img-top" alt="favorito ${i+1}">
        <div class="card-body p-2 d-flex justify-content-between align-items-center">
          <small class="text-muted">${new Date(a.ts).toLocaleString()}</small>
          <button class="btn btn-sm btn-outline-danger" data-i="${i}" data-k="animal">Excluir</button>
        </div>
      </div>
    </div>
  `).join('') : '<p class="text-muted">Sem favoritos.</p>';
}

function renderContatos(){
  const arr = DB.get(K_CONTATOS, []);
  tbody.innerHTML = arr.length ? arr.map((c, i) => `
    <tr>
      <td>${new Date(c.ts).toLocaleString()}</td>
      <td>${c.nome}</td>
      <td>${c.email}</td>
      <td>${c.cep}</td>
      <td>${c.logradouro}, ${c.numero} — ${c.bairro} — ${c.cidade}/${c.uf}</td>
      <td><button class="btn btn-sm btn-outline-danger" data-i="${i}" data-k="contato">Excluir</button></td>
    </tr>
  `).join('') : '<tr><td colspan="6" class="text-muted">Sem envios.</td></tr>';
}

listAnimais.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-k="animal"]');
  if (!b) return;
  DB.removeAt(K_ANIMAIS, Number(b.dataset.i)); renderAnimais();
});

tbody.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-k="contato"]');
  if (!b) return;
  DB.removeAt(K_CONTATOS, Number(b.dataset.i)); renderContatos();
});

btnClear.addEventListener('click', () => {
  if (confirm('Apagar todos os registros?')) { DB.clearAll(); renderAnimais(); renderContatos(); }
});

btnExport.addEventListener('click', () => {
  const data = {
    animais: DB.get(K_ANIMAIS, []),
    contatos: DB.get(K_CONTATOS, [])
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'registros-as.json' });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

renderAnimais(); renderContatos();
