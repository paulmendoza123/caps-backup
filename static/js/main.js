// SPARK — main.js


document.addEventListener('DOMContentLoaded', () => {
  // Card kebab menus (class cards, etc.)
  document.querySelectorAll('.card-menu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = btn.nextElementSibling;
      const isOpen = dropdown.classList.contains('open');
      document.querySelectorAll('.card-menu-dropdown.open').forEach(d => d.classList.remove('open'));
      if (!isOpen) dropdown.classList.add('open');
    });
  });
  document.querySelectorAll('.card-menu-dropdown').forEach(dropdown => {
    dropdown.addEventListener('click', (e) => e.stopPropagation());
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.card-menu-dropdown.open').forEach(d => d.classList.remove('open'));
  });

  // Auto-dismiss alerts after 4s
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.4s';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 400);
    }, 4000);
  });

  // Tab switching — scoped to sibling tab-contents only
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const tabBtns = tabGroup.querySelectorAll('.tab-btn');

    // Collect the matching tab-content siblings that follow this .tabs element
    // They live as direct siblings in the same parent
    const parent = tabGroup.parentElement;
    const tabContents = parent ? Array.from(parent.querySelectorAll(':scope > .tab-content')) : [];

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        // Update active button within this tab group
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show/hide only the sibling tab-contents
        tabContents.forEach(tc => {
          if (tc.dataset.tab === target) {
            tc.classList.add('active');
          } else {
            tc.classList.remove('active');
          }
        });

        // Update URL hash without scrolling
        history.replaceState(null, '', '#' + target);
      });
    });

    // Restore active tab from URL hash on page load
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const matchBtn = Array.from(tabBtns).find(b => b.dataset.tab === hash);
      if (matchBtn) matchBtn.click();
    }
  });

  // Choice selection highlight
  document.querySelectorAll('.choice-item').forEach(item => {
    item.addEventListener('click', () => {
      const radio = item.querySelector('input[type=radio]');
      if (radio) {
        const name = radio.name;
        document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
          r.closest('.choice-item')?.classList.remove('selected');
        });
        radio.checked = true;
        item.classList.add('selected');
      }
    });
  });

  // Modal helpers
  window.openModal = id => document.getElementById(id)?.classList.add('open');
  window.closeModal = id => {
    const modal = document.getElementById(id);
    if (!modal) return;
    // Closing a modal (via ✕, Cancel, or clicking outside) should discard any
    // unsaved edits rather than leave them sitting in the form for next time.
    modal.querySelectorAll('form').forEach(form => {
      form.reset();
      form.querySelectorAll('.mc-choice-grid').forEach(grid => {
        // form.reset() restores each choice's text, but not the row's
        // show/hide state (that's a manual style, not a form value) —
        // clear it so mcInitGrid can recompute it from the restored text.
        grid.querySelectorAll('.mc-choice-row').forEach(row => row.style.removeProperty('display'));
        if (typeof window.mcInitGrid === 'function') window.mcInitGrid(grid);
      });
    });
    modal.classList.remove('open');
  };
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Show/hide password toggle buttons
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      btn.classList.toggle('is-visible', !isVisible);
      btn.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
    });
  });

  // Live password-requirements checklist (length + character variety)
  document.querySelectorAll('.pw-requirements').forEach(box => {
    const input = document.getElementById(box.dataset.target);
    if (!input) return;
    const lengthItem = box.querySelector('[data-rule="length"]');
    const varietyItem = box.querySelector('[data-rule="variety"]');
    const subLower = box.querySelector('[data-rule="lower"]');
    const subUpper = box.querySelector('[data-rule="upper"]');
    const subNumber = box.querySelector('[data-rule="number"]');
    const subSpecial = box.querySelector('[data-rule="special"]');

    const check = () => {
      const val = input.value;
      const hasLower = /[a-z]/.test(val);
      const hasUpper = /[A-Z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasSpecial = /[^A-Za-z0-9]/.test(val);
      const classesMet = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

      lengthItem?.classList.toggle('met', val.length >= 8);
      subLower?.classList.toggle('met', hasLower);
      subUpper?.classList.toggle('met', hasUpper);
      subNumber?.classList.toggle('met', hasNumber);
      subSpecial?.classList.toggle('met', hasSpecial);
      varietyItem?.classList.toggle('met', classesMet >= 3);
    };

    input.addEventListener('input', check);
    check(); // initial state, e.g. browser autofill
  });

  // Live password confirmation match check
  document.querySelectorAll('[data-confirm-target]').forEach(confirmInput => {
    const original = document.getElementById(confirmInput.dataset.confirmTarget);
    const msg = confirmInput.closest('.form-group')?.querySelector('.password-mismatch-msg');
    const form = confirmInput.closest('form');
    if (!original) return;

    const check = () => {
      const mismatch = confirmInput.value.length > 0 && confirmInput.value !== original.value;
      confirmInput.setCustomValidity(mismatch ? 'Passwords do not match' : '');
      if (msg) msg.classList.toggle('is-visible', mismatch);
      return !mismatch;
    };

    confirmInput.addEventListener('input', check);
    original.addEventListener('input', check);
    if (form) {
      form.addEventListener('submit', e => {
        if (!check()) {
          e.preventDefault();
          confirmInput.reportValidity();
        }
      });
    }
  });
});
