(function () {
  const donationId = document.body.dataset.donationId;

  setTimeout(function () {
    window.location.href = '/donate/complete?donationId=' + donationId;
  }, 2000);
})();