import { DB, K_ANIMAIS, K_CONTATOS } from './storage.js';

const statFav = document.getElementById('statFav');
const statForms = document.getElementById('statForms');
const thumbs = document.getElementById('thumbs');

function render(){
  const fav = DB.get(K_ANIMAIS, []);
  const forms = DB.get(K_CONTATOS, []);
  statFav.textContent = fav.length;
  statForms.textContent = forms.length;

  thumbs.innerHTML = fav.length
    ? fav.slice(0,6).map((a,i)=>`
        <a class="thumb" href="registros.html" title="${new Date(a.ts).toLocaleString()}">
          <img src="${a.url}" alt="favorito ${i+1}">
        </a>`).join('')
    : '<p class="text-muted small m-0">Nenhum favorito ainda. Abra <a href="animais.html">Animais</a> e clique em <b>Favoritar</b>.</p>';
}

render();
