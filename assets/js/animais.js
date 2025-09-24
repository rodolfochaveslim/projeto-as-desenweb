import { DB, K_ANIMAIS } from './storage.js';

const img = document.getElementById('dogImg');
const imgModal = document.getElementById('dogImgModal');
const btnDog = document.getElementById('btnDog');
const btnModal = document.getElementById('btnModal');
const btnFav = document.getElementById('btnFav');
const btnDownload = document.getElementById('btnDownload');
const btnShare = document.getElementById('btnShare');
const spinner = document.getElementById('spinner');
const erro = document.getElementById('erro');
const thumbs = document.getElementById('thumbs');
const breedSel = document.getElementById('breedSel');

let currentUrl = '';
const modal = new bootstrap.Modal('#imgModal');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const showToast = (msg)=>{ if(!toastEl) return alert(msg); toastMsg.textContent = msg; new bootstrap.Toast(toastEl).show(); };

async function carregarRacas(){
  try{
    const r = await fetch('https://dog.ceo/api/breeds/list/all');
    const data = await r.json();
    const opts = Object.keys(data.message || {}).sort().map(b => `<option value="${b}">${b}</option>`).join('');
    breedSel.insertAdjacentHTML('beforeend', opts);
  }catch{ /* silencioso */ }
}

function apiUrl(){
  const b = breedSel.value.trim();
  return b ? `https://dog.ceo/api/breed/${b}/images/random` : 'https://dog.ceo/api/breeds/image/random';
}

async function carregarDog() {
  try {
    erro.textContent = '';
    [btnDog, btnFav, btnModal, btnDownload, btnShare].forEach(b=>b.disabled = true);
    spinner.classList.remove('d-none'); img.src = '';

    const r = await fetch(apiUrl(), { cache: 'no-store' });
    if (!r.ok) throw new Error('Falha ao buscar imagem');
    const data = await r.json();

    currentUrl = data.message;
    img.src = currentUrl;
    img.alt = 'Cachorro fofinho';
    [btnFav, btnModal, btnDownload, btnShare].forEach(b=>b.disabled = false);
  } catch (e) {
    console.error(e);
    erro.textContent = 'Não foi possível carregar a imagem agora. Tente novamente.';
  } finally {
    spinner.classList.add('d-none');
    btnDog.disabled = false;
  }
}

function renderThumbs() {
  const arr = DB.get(K_ANIMAIS, []);
  thumbs.innerHTML = arr.slice(0, 8).map((a, i) => `
    <a href="registros.html" class="thumb" title="${new Date(a.ts).toLocaleString()}">
      <img src="${a.url}" alt="favorito ${i+1}">
    </a>
  `).join('') || '<p class="text-muted small">Nenhum favorito ainda.</p>';
}

btnDog?.addEventListener('click', carregarDog);
breedSel?.addEventListener('change', carregarDog);
btnModal?.addEventListener('click', () => { imgModal.src = img.src; modal.show(); });

btnFav?.addEventListener('click', () => {
  if (!currentUrl) return;
  const arr = DB.get(K_ANIMAIS, []);
  if (arr.some(x => x.url === currentUrl)) { showToast('Essa imagem já está nos favoritos.'); return; }
  DB.set(K_ANIMAIS, [{ url: currentUrl, ts: Date.now() }, ...arr]);
  renderThumbs();
  showToast('Favorito salvo!');
  window.dispatchEvent(new Event('as:updated'));    // atualiza badge
});

btnDownload?.addEventListener('click', async ()=>{
  if(!currentUrl) return;
  const a = document.createElement('a');
  a.href = currentUrl;
  a.download = `dog-${Date.now()}.jpg`;
  document.body.appendChild(a); a.click(); a.remove();
});

btnShare?.addEventListener('click', async ()=>{
  if(!currentUrl) return;
  try{
    if(navigator.share){
      await navigator.share({ title:'Dog fofo', text:'Olha esse doguinho 🐶', url: currentUrl });
    }else{
      await navigator.clipboard.writeText(currentUrl);
      showToast('Link copiado para a área de transferência!');
    }
  }catch(e){ /* usuário cancelou */ }
});

// atalhos: N, F, Espaço
document.addEventListener('keydown', (e)=>{
  const tag = (e.target.tagName||'').toLowerCase();
  if (tag === 'input' || tag === 'textarea') return;
  if (e.key.toLowerCase() === 'n') btnDog?.click();
  if (e.key.toLowerCase() === 'f') btnFav?.click();
  if (e.key === ' ') { e.preventDefault(); btnModal?.click(); }
});

renderThumbs();
await carregarRacas();
carregarDog();
