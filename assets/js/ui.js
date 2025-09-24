// UI helpers: toast e copiar texto
const ctrId = 'as-toasts';
function ensureCtr(){
  let c = document.getElementById(ctrId);
  if(!c){
    c = Object.assign(document.createElement('div'), { id: ctrId });
    c.style.position='fixed'; c.style.zIndex='1080'; c.style.right='16px'; c.style.bottom='16px';
    c.style.display='flex'; c.style.flexDirection='column'; c.style.gap='10px';
    document.body.appendChild(c);
  }
  return c;
}

export function toast(msg, type='info', ms=2400){
  const c = ensureCtr();
  const el = document.createElement('div');
  el.role = 'status';
  el.style.padding='10px 14px';
  el.style.borderRadius='12px';
  el.style.boxShadow='0 10px 30px rgba(2,6,23,.15)';
  el.style.backdropFilter='blur(6px)';
  el.style.color = type==='danger' ? '#8b0000' : (type==='success' ? '#065f46' : '#0f172a');
  el.style.background = type==='danger' ? '#fee2e2' : (type==='success' ? '#d1fae5' : '#e5edff');
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .25s'; }, ms-250);
  setTimeout(()=> el.remove(), ms);
}

export async function copyText(text){
  try{ await navigator.clipboard.writeText(text); toast('Copiado para a área de transferência!','success'); }
  catch{ toast('Não foi possível copiar.','danger'); }
}
