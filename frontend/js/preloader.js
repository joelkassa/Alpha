(function () {
  var preloader = document.getElementById('preloader');
  if (!preloader) return;

  var mainContent = document.querySelectorAll('header, main, footer');

  var alreadySeen = sessionStorage.getItem('alphaPreloaderSeen') === '1';

  if (alreadySeen) {
    preloader.classList.add('instant-hide');
    return;
  }

  document.body.classList.add('preloader-active');
  mainContent.forEach(function (el) { el.setAttribute('aria-hidden', 'true'); });

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MIN_DISPLAY_MS = prefersReducedMotion ? 400 : 1900;
  var FADE_MS = 500;

  window.setTimeout(function () {
    preloader.classList.add('fade-out');
    document.body.classList.remove('preloader-active');
    mainContent.forEach(function (el) { el.removeAttribute('aria-hidden'); });
    sessionStorage.setItem('alphaPreloaderSeen', '1');

    setTimeout(function () {
      preloader.style.display = 'none';
    }, FADE_MS);
  }, MIN_DISPLAY_MS);
})();