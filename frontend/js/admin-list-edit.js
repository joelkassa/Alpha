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
          const res = await window.adminFetch('/admin/api/lists/' + table + '/' + id, {
            method: 'DELETE',
            headers: { 'X-CSRF-Token': window.getCsrfToken() },
          });
          const data = await res.json();
          if (data.success) window.location.reload();
        } catch (err) {
          if (err.message !== 'Session expired') {
            alert('Failed to delete');
          }
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
          const res = await window.adminFetch('/admin/api/lists/' + table, {
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
          if (err.message !== 'Session expired') {
            alert('Failed to add item');
          }
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
          const uploadRes = await window.adminFetch('/admin/api/upload', {
            method: 'POST',
            headers: { 'X-CSRF-Token': window.getCsrfToken() },
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (!uploadData.success) throw new Error('Upload failed');

          const patchRes = await window.adminFetch('/admin/api/lists/' + table + '/' + id, {
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
          if (statusEl && err.message !== 'Session expired') {
            statusEl.textContent = 'Upload failed';
          }
        }
      });
    });
  }

  // ── Program-link dropdown on gallery items ──
  function wireProgramSelects() {
    document.querySelectorAll('[data-list-program-select]').forEach(function (select) {
      select.addEventListener('change', async function () {
        const container = select.closest('[data-list-table]');
        const table = container.dataset.listTable;
        const id = container.dataset.listId;
        const value = select.value === '' ? null : select.value;

        const statusEl = document.getElementById('adminSaveStatus');
        if (statusEl) statusEl.textContent = 'Saving...';

        try {
          const res = await window.adminFetch('/admin/api/lists/' + table + '/' + id, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': window.getCsrfToken(),
            },
            body: JSON.stringify({ program_id: value }),
          });
          const data = await res.json();
          if (statusEl) statusEl.textContent = data.success ? 'Saved' : 'Error';
        } catch (err) {
          if (statusEl && err.message !== 'Session expired') statusEl.textContent = 'Error saving';
        }
        setTimeout(function () { if (statusEl) statusEl.textContent = ''; }, 2000);
      });
    });
  }

  // ── Drag-and-drop reordering ──
  function getDragAfterElement(container, table, y) {
    const elements = Array.from(
      container.querySelectorAll('[data-list-table="' + table + '"]:not(.dragging)')
    );
    return elements.reduce(
      function (closest, child) {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  function setDraggable(on) {
    document.querySelectorAll('[data-list-table]').forEach(function (el) {
      el.setAttribute('draggable', on ? 'true' : 'false');
    });
  }

  function addOrRemoveDragHints(on) {
    const seenTables = {};
    document.querySelectorAll('[data-list-table]').forEach(function (el) {
      const table = el.dataset.listTable;
      if (seenTables[table]) return;
      seenTables[table] = true;

      const container = el.parentElement;
      const wrapper = container.parentElement;
      let hint = wrapper.querySelector('.list-drag-hint[data-hint-table="' + table + '"]');

      if (on && !hint) {
        hint = document.createElement('p');
        hint.className = 'list-drag-hint';
        hint.setAttribute('data-hint-table', table);
        hint.textContent = 'Drag items to reorder them.';
        wrapper.insertBefore(hint, container);
      } else if (!on && hint) {
        hint.remove();
      }
    });
  }

  function wireDragReorder() {
    const groups = {};
    document.querySelectorAll('[data-list-table]').forEach(function (el) {
      const table = el.dataset.listTable;
      if (!groups[table]) groups[table] = [];
      groups[table].push(el);
    });

    Object.keys(groups).forEach(function (table) {
      const items = groups[table];
      if (items.length < 2) return;
      const container = items[0].parentElement;

      items.forEach(function (item) {
        item.addEventListener('dragstart', function () {
          if (!window.adminEditModeOn) return;
          item.classList.add('dragging');
        });
        item.addEventListener('dragend', function () {
          item.classList.remove('dragging');
        });
      });

      container.addEventListener('dragover', function (e) {
        if (!window.adminEditModeOn) return;
        e.preventDefault();
        const dragging = container.querySelector('.dragging');
        if (!dragging) return;
        const afterElement = getDragAfterElement(container, table, e.clientY);
        if (afterElement == null) {
          container.appendChild(dragging);
        } else {
          container.insertBefore(dragging, afterElement);
        }
      });

      container.addEventListener('drop', async function (e) {
        if (!window.adminEditModeOn) return;
        e.preventDefault();

        const orderedIds = Array.from(
          container.querySelectorAll('[data-list-table="' + table + '"]')
        ).map(function (el) {
          return el.dataset.listId;
        });

        const statusEl = document.getElementById('adminSaveStatus');
        if (statusEl) statusEl.textContent = 'Saving order...';

        try {
          const res = await window.adminFetch('/admin/api/lists/' + table + '/reorder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': window.getCsrfToken(),
            },
            body: JSON.stringify({ orderedIds: orderedIds }),
          });
          const data = await res.json();
          if (statusEl) statusEl.textContent = data.success ? 'Order saved' : 'Error saving order';
        } catch (err) {
          if (statusEl && err.message !== 'Session expired') statusEl.textContent = 'Error saving order';
        }
        setTimeout(function () { if (statusEl) statusEl.textContent = ''; }, 2000);
      });
    });
  }

  document.addEventListener('adminEditModeChanged', function (e) {
    setDraggable(e.detail.on);
    addOrRemoveDragHints(e.detail.on);
  });

  wireListFields();
  wireDeleteButtons();
  wireAddButtons();
  wireImageUploads();
  wireProgramSelects();
  wireDragReorder();
})();