(() => {
  const section = document.querySelector('.service-statistics');
  if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const counters = [...section.querySelectorAll('[data-counter-value]')];
  const formatter = new Intl.NumberFormat('th-TH');
  const duration = 800;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    const started = performance.now();
    const targets = counters.map(counter => Number(counter.dataset.counterValue));
    const render = now => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - progress) ** 2;
      counters.forEach((counter, index) => {
        counter.textContent = formatter.format(Math.round(targets[index] * eased));
      });
      if (progress < 1) requestAnimationFrame(render);
      else section.dataset.counterComplete = 'true';
    };
    counters.forEach(counter => { counter.textContent = '0'; });
    requestAnimationFrame(render);
  }, { threshold: .35 });
  observer.observe(section);
})();
