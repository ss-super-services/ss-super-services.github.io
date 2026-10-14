(() => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  if (slides.length < 2) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
  }
  function restart() {
    clearInterval(timer);
    if (!reduced.matches && !document.hidden) timer = setInterval(() => show(current + 1), 4000);
  }
  document.querySelector('.hero-prev')?.addEventListener('click', () => { show(current - 1); restart(); });
  document.querySelector('.hero-next')?.addEventListener('click', () => { show(current + 1); restart(); });
  document.addEventListener('visibilitychange', restart);
  reduced.addEventListener('change', restart);
  restart();
})();
