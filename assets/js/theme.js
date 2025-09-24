const KEY = 'as_theme';
function apply(t){ document.documentElement.dataset.theme = t; }
const saved = localStorage.getItem(KEY);
if (saved) apply(saved);

document.getElementById('toggleTheme')?.addEventListener('click', () => {
  const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  apply(cur);
  localStorage.setItem(KEY, cur);
});
