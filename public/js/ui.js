// =========================================
// HOSTELCARE — SHARED UI HELPERS
// Toasts, confirm modal, small animation
// utilities used across every page.
// =========================================

function ensureToastStack() {
  let stack = document.getElementById('toastStack');

  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toastStack';
    document.body.appendChild(stack);
  }

  return stack;
}

const TOAST_ICONS = {
  success: '✓',
  error: '⚠',
  info: 'ℹ'
};

function showToast(message, type = 'info', duration = 4000) {
  const stack = ensureToastStack();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = TOAST_ICONS[type] || TOAST_ICONS.info;

  const text = document.createElement('span');
  text.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.type = 'button';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Dismiss');

  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(closeBtn);

  stack.appendChild(toast);

  function remove() {
    if (!toast.isConnected) return;
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 220);
  }

  closeBtn.addEventListener('click', remove);

  if (duration > 0) {
    setTimeout(remove, duration);
  }

  return toast;
}

function confirmModal(message, options = {}) {
  const {
    title = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = true
  } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-card">
        <h3></h3>
        <p></p>
        <div class="modal-actions">
          <button type="button" class="modal-cancel"></button>
          <button type="button" class="modal-confirm ${danger ? '' : 'neutral'}"></button>
        </div>
      </div>
    `;

    overlay.querySelector('h3').textContent = title;
    overlay.querySelector('p').textContent = message;
    overlay.querySelector('.modal-cancel').textContent = cancelText;
    overlay.querySelector('.modal-confirm').textContent = confirmText;

    function close(result) {
      overlay.remove();
      resolve(result);
    }

    overlay.querySelector('.modal-cancel')
      .addEventListener('click', () => close(false));

    overlay.querySelector('.modal-confirm')
      .addEventListener('click', () => close(true));

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', escHandler);
        close(false);
      }
    });

    document.body.appendChild(overlay);
  });
}

// Applies a staggered fade-in-up animation to a NodeList/array of
// elements, so lists (complaint cards etc.) animate in one by one
// instead of popping in all at once.
function staggerIn(elements, baseDelay = 0.05) {
  Array.from(elements).forEach((el, index) => {
    el.classList.add('fade-in-up');
    el.style.animationDelay = `${index * baseDelay}s`;
  });
}

// Toggles a button between its normal state and a loading state
// (disabled + spinner + custom label) without losing the original
// label, so callers don't need to track it themselves.
function setButtonLoading(button, isLoading, loadingLabel) {
  if (isLoading) {
    button.dataset.originalLabel = button.innerHTML;
    button.disabled = true;
    button.innerHTML =
      `<span class="btn-loading"><span class="spinner"></span>${loadingLabel}</span>`;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalLabel || button.innerHTML;
  }
}
