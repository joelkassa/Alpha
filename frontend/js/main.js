(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 0) {
      header.classList.remove('nav-hidden');
    } else if (currentScrollY > lastScrollY) {
      header.classList.add('nav-hidden'); // scrolling down
    } else {
      header.classList.remove('nav-hidden'); // scrolling up
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  });
})();