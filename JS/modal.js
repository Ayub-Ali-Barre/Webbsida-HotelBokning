// Small modal helper: openModal / closeModal with focus trap and backdrop click
let lastFocusedEl = null;
let currentOpenModal = null;

const getFocusable = (root) => {
  if (!root) return [];
  const selectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll(selectors)).filter((el) => el.offsetParent !== null);
};

const trapKey = (e) => {
  if (!currentOpenModal) return;
  const focusables = getFocusable(currentOpenModal);
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal(currentOpenModal);
    return;
  }
  if (e.key === 'Tab') {
    if (!focusables.length) {
      e.preventDefault();
      return;
    }
    const idx = focusables.indexOf(document.activeElement);
    if (e.shiftKey) {
      if (idx === 0 || document.activeElement === currentOpenModal) {
        e.preventDefault();
        focusables[focusables.length - 1].focus();
      }
    } else {
      if (idx === focusables.length - 1) {
        e.preventDefault();
        focusables[0].focus();
      }
    }
  }
};

function onBackdropClick(e) {
  if (e.target === e.currentTarget) {
    closeModal(e.currentTarget);
  }
}

export function openModal(el) {
  if (!el) return;
  lastFocusedEl = document.activeElement;
  el.style.display = 'flex';
  el.setAttribute('aria-hidden', 'false');
  currentOpenModal = el;
  const focusables = getFocusable(el);
  if (focusables.length) focusables[0].focus();
  document.addEventListener('keydown', trapKey);
  el.addEventListener('click', onBackdropClick);
}

export function closeModal(el) {
  if (!el) return;
  el.style.display = 'none';
  el.setAttribute('aria-hidden', 'true');
  currentOpenModal = null;
  document.removeEventListener('keydown', trapKey);
  el.removeEventListener('click', onBackdropClick);
  if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus();
}
