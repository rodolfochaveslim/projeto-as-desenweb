import { DB, K_ANIMAIS, K_CONTATOS } from './storage.js';

const listAnimais = document.getElementById('listAnimais');
const tbody = document.getElementById('tbodyContatos');
const btnExport = document.getElementById('btnExport');
const btnCsv = document.getElementById('btnCsv');
const btnClear = document.getElementById('btnClear');
const btnClearFav = document.getElementById('btnClearFav');
const btnClearCont = document.getElementById('btnClearCont');
const fileImport = document.getElementById('fileImport');
const filtro = document.getElementById('filtro');
const ordenar = document.getElementById('ordenar');

/* ===== Favoritos (cartões) ===== */
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
  `).join('') : '<p class="text-muted m-0">Sem favoritos.</p>';
}

listAnimais.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-k="animal"]');
  if (!b) return;
  DB.removeAt(K_ANIMAIS, Number(b.dataset.i)); renderAnimais();
  window.dispatchEvent(new Event('as:updated'));
});

/* ===== Contatos (tabela) ===== */
function getContatosFiltradosOrdenados(){
  const q = (filtro.value||'').toLowerCase().trim();
  const ord = ordenar.value;
  let data = DB.get(K_CONTATOS, []);

  if(q){
    data = data.filter(c => (
      (c.nome||'').toLowerCase().includes(q) ||
      (c.email||'').toLowerCase().includes(q) ||
      (c.cidade||'').toLowerCase().includes(q) ||
      (c.uf||'').toLowerCase().includes(q) ||
      (c.cep||'').toLowerCase().includes(q)
    ));
  }

  const cmp = (a,b,prop,dir=1)=> ( (a[prop]||'').localeCompare((b[prop]||'')) ) * dir;

  switch(ord){
    case 'data_asc': data.sort((a,b)=> a.ts - b.ts); break;
    case 'nome_asc': data.sort((a,b)=> cmp(a,b,'nome',+1)); break;
    case 'nome_desc': data.sort((a,b)=> cmp(a,b,'nome',-1)); break;
    case 'cidade_asc': data.sort((a,b)=> cmp(a,b,'cidade',+1)); break;
    case 'cidade_desc': data.sort((a,b)=> cmp(a,b,'cidade',-1)); break;
    default: data.sort((a,b)=> b.ts - a.ts); // data_desc
  }

  return data;
}

function renderContatos(){
  const arr = getContatosFiltradosOrdenados();
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

tbody.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-k="contato"]');
  if (!b) return;
  // o índice mostrado é do array filtrado/ordenado
  const arr = getContatosFiltradosOrdenados();
  const item = arr[Number(b.dataset.i)];
  const all = DB.get(K_CONTATOS, []);
  const idxReal = all.findIndex(x => x.ts === item.ts && x.email === item.email);
  if(idxReal > -1){ all.splice(idxReal,1); DB.set(K_CONTATOS, all); }
  renderContatos();
  window.dispatchEvent(new Event('as:updated'));
});

filtro.addEventListener('input', renderContatos);
ordenar.addEventListener('change', renderContatos);

/* ===== Export / Import ===== */
btnExport.addEventListener('click', () => {
  const data = { animais: DB.get(K_ANIMAIS, []), contatos: DB.get(K_CONTATOS, []) };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'registros-as.json' });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

btnCsv.addEventListener('click', () => {
  const arr = DB.get(K_CONTATOS, []);
  const rows = [
    ['data','nome','email','cep','logradouro','numero','bairro','cidade','uf'],
    ...arr.map(c=>[
      new Date(c.ts).toISOString(),
      c.nome, c.email, c.cep, c.logradouro, c.numero, c.bairro, c.cidade, c.uf
    ])
  ];
  const csv = rows.map(r => r.map(v => `"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'contatos-as.csv' });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

fileImport.addEventListener('change', async (e)=>{
  const f = e.target.files?.[0]; if(!f) return;
  try{
    const text = await f.text();
    const json = JSON.parse(text);

    const ani = Array.isArray(json.animais) ? json.animais : [];
    const con = Array.isArray(json.contatos) ? json.contatos : [];

    // merge simples evitando duplicados por ts/url e ts/email
    const aOld = DB.get(K_ANIMAIS, []);
    const aNew = [...aOld];
    for(const x of ani){ if(!aNew.some(y=>y.url===x.url && y.ts===x.ts)) aNew.push(x); }
    DB.set(K_ANIMAIS, aNew.sort((x,y)=> y.ts-x.ts));

    const cOld = DB.get(K_CONTATOS, []);
    const cNew = [...cOld];
    for(const x of con){ if(!cNew.some(y=>y.ts===x.ts && y.email===x.email)) cNew.push(x); }
    DB.set(K_CONTATOS, cNew.sort((x,y)=> y.ts-x.ts));

    renderAnimais(); renderContatos();
    window.dispatchEvent(new Event('as:updated'));
    alert('Importação concluída!');
  }catch(err){
    console.error(err);
    alert('Arquivo inválido.');
  }finally{
    e.target.value = '';
  }
});

/* ===== Limpar ===== */
btnClear.addEventListener('click', () => {
  if (confirm('Apagar TODOS os registros?')) {
    DB.clearAll(); renderAnimais(); renderContatos();
    window.dispatchEvent(new Event('as:updated'));
  }
});
btnClearFav.addEventListener('click', () => {
  if (confirm('Apagar apenas FAVORITOS?')) {
    DB.set(K_ANIMAIS, []); renderAnimais(); window.dispatchEvent(new Event('as:updated'));
  }
});
btnClearCont.addEventListener('click', () => {
  if (confirm('Apagar apenas CONTATOS?')) {
    DB.set(K_CONTATOS, []); renderContatos(); window.dispatchEvent(new Event('as:updated'));
  }
});

/* ===== Inicial ===== */
renderAnimais();
renderContatos();
