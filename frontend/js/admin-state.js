window.AdminPending = (function () {
  const changes = {};

  function setChange(id, changeObj) {
    changes[id] = changeObj;
    updateUI();
  }

  function count() {
    return Object.keys(changes).length;
  }

  function clear() {
    Object.keys(changes).forEach((k) => delete changes[k]);
    updateUI();
  }

  function updateUI() {
    const btn = document.getElementById('saveChangesBtn');
    if (!btn) return;
    const n = count();
    btn.textContent = 'Save Changes' + (n > 0 ? ' (' + n + ')' : '');
    btn.disabled = n === 0;
  }

  window.addEventListener('beforeunload', function (e) {
    if (count() > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  return { changes, setChange, count, clear, updateUI };
})();