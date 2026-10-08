/* ============================================
   共享交互 — 图片多源加载 / 滚动进度 / 揭示 / 页面淡出转场
   ============================================ */

/* 图片加速：GitHub Pages（github.io）在国内访问经常被限速或中途断流，
   单张图可能几十秒才出来、甚至直接超时变成破图。
   这里把图片放到 GitHub 加速镜像上取，并做「多源 + 超时 + 重试」：
   镜像A → 镜像B → 本站相对路径 → 原始 JPG。
   任何一个源先返回就用它，某个源卡住超过 IMG_TIMEOUT 就自动换下一个。 */
const IMG_MIRRORS = [
  'https://gh-proxy.com/https://raw.githubusercontent.com/Xiachao-COMMMITS/photography/main/',
  'https://ghproxy.net/https://raw.githubusercontent.com/Xiachao-COMMMITS/photography/main/'
];
const IMG_TIMEOUT = 9000;

function imageChain(webpPath, jpgName) {
  const chain = IMG_MIRRORS.map(function (m) { return m + webpPath; });
  chain.push(webpPath);
  if (jpgName) chain.push(jpgName);
  return chain;
}

function loadImageWithFallback(img, chain) {
  let i = 0;
  function tryNext() {
    if (i >= chain.length) return;
    const url = chain[i++];
    let settled = false;
    const timer = setTimeout(function () {
      if (settled) return;
      settled = true;
      tryNext();
    }, IMG_TIMEOUT);
    img.addEventListener('load', function () {
      settled = true;
      clearTimeout(timer);
    }, { once: true });
    img.addEventListener('error', function () {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      tryNext();
    }, { once: true });
    img.src = url;
  }
  tryNext();
}

/* 把 <img data-src="缩略图|原图"> 变成带多源回退的真实图片 */
function hydrateImages(scope) {
  (scope || document).querySelectorAll('img[data-src]').forEach(function (img) {
    const parts = img.getAttribute('data-src').split('|');
    loadImageWithFallback(img, imageChain(parts[0], parts[1]));
  });
}

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