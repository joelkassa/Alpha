(function () {
  const toolbar = document.getElementById('admin-toolbar');
  const toggleBtn = document.getElementById('toggleEditMode');
  const undoBtn = document.getElementById('undoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusEl = document.getElementById('adminSaveStatus');

  let editMode = false;

  function setEditMode(on) {
    editMode = on;
    toggleBtn.textContent = 'Edit Mode: ' + (on ? 'ON' : 'OFF');
    document.querySelectorAll('[data-editable-key]').forEach(function (el) {
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
      saveField(el);
    });
  });

  async function saveField(el) {
    const key = el.dataset.editableKey;
    const lang = el.dataset.editableLang;
    const value = el.innerText.trim();

    statusEl.textContent = 'Saving...';

    try {
      const res = await fetch('/admin/api/content-blocks/' + encodeURIComponent(key), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, lang }),
      });
      const data = await res.json();

      if (data.success) {
        statusEl.textContent = 'Saved';
      } else {
        statusEl.textContent = 'Error: ' + (data.error || 'unknown');
      }
    } catch (err) {
      statusEl.textContent = 'Error saving';
    }

    setTimeout(function () { statusEl.textContent = ''; }, 2000);
  }

  undoBtn.addEventListener('click', async function () {
    statusEl.textContent = 'Undoing...';
    try {
      const res = await fetch('/admin/api/undo', { method: 'POST' });
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

  resetBtn.addEventListener('click', async function () {
    const confirmText = prompt('This will erase all edits and restore the original default content. Type RESET to confirm:');
    if (confirmText !== 'RESET') return;

    statusEl.textContent = 'Resetting...';
    try {
      const res = await fetch('/admin/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmText }),
      });
      const data = await res.json();
      if (data.success) {
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