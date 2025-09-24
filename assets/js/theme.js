const KEY = 'as_theme';                 // 'light' | 'dark'
const root = document.documentElement;
const btn  = document.getElementById('toggleTheme');
const ico  = btn?.querySelector('i');

function apply(theme){
  if (theme === 'light') root.dataset.theme = 'light';
  else if (theme === 'dark') root.dataset.theme = 'dark';
  else delete root.dataset.theme; // auto (sistema)

  if (ico) ico.className = (root.dataset.theme === 'dark') ? 'bi bi-sun' : 'bi bi-moon';
}

let saved = localStorage.getItem(KEY);  // pode ser null (auto)
apply(saved);

btn?.addEventListener('click', () => {
  const next = (root.dataset.theme === 'dark') ? 'light' : 'dark';
  localStorage.setItem(KEY, next);
  apply(next);
});
