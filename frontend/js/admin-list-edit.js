(function () {
  function wireListFields() {
    document.querySelectorAll('[data-list-field]').forEach(function (el) {
      el.addEventListener('blur', function () {
        if (!window.adminEditModeOn) return;

        const container = el.closest('[data-list-table]');
        const table = container.dataset.listTable;
        const recordId = container.dataset.listId;
        const field = el.dataset.listField;
        const value = el.innerText.trim();
        const changeId = 'list:' + table + ':' + recordId + ':' + field;

        window.AdminPending.setChange(changeId, { type: 'list', table, recordId, field, value });
        el.classList.add('pending-edit');
      });
    });
  }

  function wireDeleteButtons() {
    document.querySelectorAll('[data-list-delete]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        const container = btn.closest('[data-list-table]');
        const table = container.dataset.listTable;
        const id = container.dataset.listId;
        if (!confirm('Delete this item? This happens immediately and is not part of Save Changes.')) return;

        try {
          const res = await fetch('/admin/api/lists/' + table + '/' + id, {
            method: 'DELETE',
            headers: { 'X-CSRF-Token': window.getCsrfToken() },
          });
          const data = await res.json();
          if (data.success) window.location.reload();
        } catch (err) {
          alert('Failed to delete');
        }
      });
    });
  }

  function wireAddButtons() {
    document.querySelectorAll('[data-list-add]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        const table = btn.dataset.listAdd;
        const defaults = JSON.parse(btn.dataset.listDefaults || '{}');

        try {
          const res = await fetch('/admin/api/lists/' + table, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': window.getCsrfToken(),
            },
            body: JSON.stringify(defaults),
          });
          const data = await res.json();
          if (data.success) window.location.reload();
        } catch (err) {
          alert('Failed to add item');
        }
      });
    });
  }

  function wireImageUploads() {
    document.querySelectorAll('[data-list-image-input]').forEach(function (input) {
      input.addEventListener('change', async function () {
        if (!input.files || !input.files[0]) return;
        const container = input.closest('[data-list-table]');
        const table = container.dataset.listTable;
        const id = container.dataset.listId;
        const field = input.dataset.listImageInput;

        const formData = new FormData();
        formData.append('image', input.files[0]);

        const statusEl = document.getElementById('adminSaveStatus');
        if (statusEl) statusEl.textContent = 'Uploading...';

        try {
          const uploadRes = await fetch('/admin/api/upload', {
            method: 'POST',
            headers: { 'X-CSRF-Token': window.getCsrfToken() },
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (!uploadData.success) throw new Error('Upload failed');

          const patchRes = await fetch('/admin/api/lists/' + table + '/' + id, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': window.getCsrfToken(),
            },
            body: JSON.stringify({ [field]: uploadData.url }),
          });
          const patchData = await patchRes.json();
          if (patchData.success) window.location.reload();
        } catch (err) {
          if (statusEl) statusEl.textContent = 'Upload failed';
        }
      });
    });
  }

  wireListFields();
  wireDeleteButtons();
  wireAddButtons();
  wireImageUploads();
})();