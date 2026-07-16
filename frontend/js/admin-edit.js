(function () {
  const toggleBtn = document.getElementById('toggleEditMode');
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  const undoBtn = document.getElementById('undoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusEl = document.getElementById('adminSaveStatus');

  let editMode = false;

  function setEditMode(on) {
    editMode = on;
    window.adminEditModeOn = on;
    document.body.classList.toggle('admin-edit-mode', on);
    toggleBtn.textContent = 'Edit Mode: ' + (on ? 'ON' : 'OFF');
    document.querySelectorAll('[data-editable-key], [data-list-field]').forEach(function (el) {
      el.contentEditable = on;
      el.classList.toggle('admin-editable-active', on);
    });
  }

  toggleBtn.addEventListener('click', function () {
    setEditMode(!editMode);
  });

  document.querySelectorAll('[data-editable-key]').forEach(function (el) {
    el.addEventListener('blur', function () {
      if (!editMode) return;
      const key = el.dataset.editableKey;
      const lang = el.dataset.editableLang;
      const value = el.innerText.trim();
      const changeId = 'content:' + key + ':' + lang;

      window.AdminPending.setChange(changeId, { type: 'content', key, lang, value });
      el.classList.add('pending-edit');
    });
  });

  saveChangesBtn.addEventListener('click', async function () {
    const entries = Object.values(window.AdminPending.changes);
    if (entries.length === 0) return;

    statusEl.textContent = 'Saving ' + entries.length + ' change(s)...';

    try {
      for (const change of entries) {
        if (change.type === 'content') {
          await fetch('/admin/api/content-blocks/' + encodeURIComponent(change.key), {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': window.getCsrfToken(),
            },
            body: JSON.stringify({ value: change.value, lang: change.lang }),
          });
        } else if (change.type === 'list') {
          await fetch('/admin/api/lists/' + change.table + '/' + change.recordId, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': window.getCsrfToken(),
            },
            body: JSON.stringify({ [change.field]: change.value }),
          });
        }
      }

      window.AdminPending.clear();
      statusEl.textContent = 'All changes saved';
      setTimeout(function () { window.location.reload(); }, 800);
    } catch (err) {
      statusEl.textContent = 'Error saving changes';
    }
  });

  undoBtn.addEventListener('click', async function () {
    statusEl.textContent = 'Undoing...';
    try {
      const res = await fetch('/admin/api/undo', {
        method: 'POST',
        headers: { 'X-CSRF-Token': window.getCsrfToken() },
      });
      const data = await res.json();
      if (data.success) {
        statusEl.textContent = 'Undone — reload to see change';
        setTimeout(function () { window.location.reload(); }, 800);
      } else {
        statusEl.textContent = data.error || 'Nothing to undo';
      }
    } catch (err) {
      statusEl.textContent = 'Error undoing';
    }
  });

  // ── Reset to Default (custom modal) ──
  const resetModalOverlay = document.getElementById('resetModalOverlay');
  const resetConfirmInput = document.getElementById('resetConfirmInput');
  const resetCancelBtn = document.getElementById('resetCancelBtn');
  const resetConfirmBtn = document.getElementById('resetConfirmBtn');

  resetBtn.addEventListener('click', function () {
    resetConfirmInput.value = '';
    resetModalOverlay.hidden = false;
    resetConfirmInput.focus();
  });

  resetCancelBtn.addEventListener('click', function () {
    resetModalOverlay.hidden = true;
  });

  resetModalOverlay.addEventListener('click', function (e) {
    if (e.target === resetModalOverlay) resetModalOverlay.hidden = true;
  });

  resetConfirmBtn.addEventListener('click', async function () {
    const confirmText = resetConfirmInput.value;
    if (confirmText !== 'RESET') {
      resetConfirmInput.focus();
      return;
    }

    resetModalOverlay.hidden = true;
    statusEl.textContent = 'Resetting...';

    try {
      const res = await fetch('/admin/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': window.getCsrfToken(),
        },
        body: JSON.stringify({ confirmText }),
      });
      const data = await res.json();
      if (data.success) {
        window.AdminPending.clear();
        statusEl.textContent = 'Reset complete';
        setTimeout(function () { window.location.reload(); }, 800);
      } else {
        statusEl.textContent = data.error || 'Reset failed';
      }
    } catch (err) {
      statusEl.textContent = 'Error resetting';
    }
  });
})();