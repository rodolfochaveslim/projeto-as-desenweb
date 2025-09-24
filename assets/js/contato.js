import { DB, K_CONTATOS } from './storage.js';

const form = document.getElementById('formContato');
const cep = document.getElementById('cep');
const btnCep = document.getElementById('btnCep');
const erroCep = document.getElementById('erroCep');

const nome = document.getElementById('nome');
const email = document.getElementById('email');
const logradouro = document.getElementById('logradouro');
const bairro = document.getElementById('bairro');
const cidade = document.getElementById('cidade');
const uf = document.getElementById('uf');
const numero = document.getElementById('numero');

function somenteNumeros(s){ return (s || '').replace(/\D/g,''); }
function formataCEP(s){ const n = somenteNumeros(s).slice(0,8); return n.length > 5 ? n.slice(0,5)+'-'+n.slice(5) : n; }

async function buscarCEP(){
  try{
    erroCep.textContent = '';
    const puro = somenteNumeros(cep.value);
    if (puro.length !== 8){ erroCep.textContent = 'Digite um CEP com 8 dígitos.'; cep.classList.add('is-invalid'); return; }
    cep.classList.remove('is-invalid');

    const r = await fetch(`https://viacep.com.br/ws/${puro}/json/`);
    if (!r.ok) throw new Error('Falha na consulta');
    const data = await r.json();
    if (data.erro){ erroCep.textContent = 'CEP não encontrado.'; return; }

    logradouro.value = data.logradouro || '';
    bairro.value = data.bairro || '';
    cidade.value = data.localidade || '';
    uf.value = (data.uf || '').toUpperCase();
  }catch(e){
    console.error(e);
    erroCep.textContent = 'Não foi possível consultar o CEP agora.';
  }
}

cep.addEventListener('input', () => { cep.value = formataCEP(cep.value); });
cep.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); btnCep.click(); }});
btnCep.addEventListener('click', buscarCEP);
uf.addEventListener('input', ()=> uf.value = uf.value.toUpperCase().slice(0,2));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()){
    e.stopPropagation();
    form.classList.add('was-validated');
    return;
  }
  DB.push(K_CONTATOS, {
    ts: Date.now(),
    nome: nome.value.trim(),
    email: email.value.trim(),
    cep: cep.value,
    logradouro: logradouro.value.trim(),
    numero: numero.value.trim(),
    bairro: bairro.value.trim(),
    cidade: cidade.value.trim(),
    uf: uf.value.trim().toUpperCase()
  });

  alert('Formulário enviado e salvo localmente!');
  form.reset();
  form.classList.remove('was-validated');
});
