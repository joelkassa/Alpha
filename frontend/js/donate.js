(function () {
  const amountButtons = document.querySelectorAll('.amount-btn');
  const customAmountInput = document.getElementById('customAmount');

  amountButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      amountButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      customAmountInput.value = btn.dataset.amount;
    });
  });

  customAmountInput.addEventListener('input', function () {
    amountButtons.forEach(function (b) { b.classList.remove('active'); });
  });
})();