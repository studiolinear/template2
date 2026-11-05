let timer;
export function toast(message) {
  const el = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = message;
  el.classList.remove('translate-y-20', 'opacity-0');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.add('translate-y-20', 'opacity-0'), 3000);
}
