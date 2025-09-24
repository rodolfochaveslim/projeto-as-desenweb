import { DB, K_ANIMAIS } from './storage.js';

const img = document.getElementById('dogImg');
const imgModal = document.getElementById('dogImgModal');
const btnDog = document.getElementById('btnDog');
const btnModal = document.getElementById('btnModal');
const btnFav = document.getElementById('btnFav');
const spinner = document.getElementById('spinner');
const erro = document.getElementById('erro');
const thumbs = document.getElementById('thumbs');

let currentUrl = '';

const modal = new bootstrap.Modal('#imgModal');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const showToast = (msg)=>{ toastMsg.textContent = msg; new bootstrap.Toast(toastEl).show(); };

async function carregarDog() {
  try {
    erro.textContent = '';
    btnDog.disabled = true; btnFav.disabled = true; btnModal.disabled = true;
    spinner.classList.remove('d-none'); img.src = '';

    const r = await fetch('https://dog.ceo/api/breeds/image/random', { cache: 'no-store' });
    if (!r.ok) throw new Error('Falha ao buscar imagem');
    const data = await r.json();

    currentUrl = data.message;
    img.src = currentUrl;
    img.alt = 'Cachorro fofinho';
    btnModal.disabled = false; btnFav.disabled = false;
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
btnModal?.addEventListener('click', () => { imgModal.src = img.src; modal.show(); });
btnFav?.addEventListener('click', () => {
  if (!currentUrl) return;
  const arr = DB.get(K_ANIMAIS, []);
  if (arr.some(x => x.url === currentUrl)) {
    showToast('Essa imagem já está nos favoritos.');
    return;
  }
  DB.set(K_ANIMAIS, [{ url: currentUrl, ts: Date.now() }, ...arr]);
  renderThumbs();
  showToast('Favorito salvo!');
});

renderThumbs();
carregarDog();
