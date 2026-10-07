/* ============================================
   共享交互 — 滚动进度 / 揭示 / 页面淡出转场
   ============================================ */

function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const ratio = max > 0 ? h.scrollTop / max : 0;
    bar.style.transform = 'scaleX(' + ratio + ')';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
}

function initPageFade() {
  const fade = document.createElement('div');
  fade.className = 'page-fade';
  document.body.appendChild(fade);
  document.querySelectorAll('a[href$=".html"][data-transition]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;
      e.preventDefault();
      fade.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 260);
    });
  });
}

function initKeyboardNav(prevUrl, nextUrl) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && prevUrl) window.location.href = prevUrl;
    if (e.key === 'ArrowRight' && nextUrl) window.location.href = nextUrl;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initScrollReveal();
  initPageFade();
});