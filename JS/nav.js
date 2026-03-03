import { currentUser, isSignedIn, signOut, onAuthChange } from './auth.js';

function ensureMenu(container) {
  let menu = container.querySelector('.menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.className = 'menu';
    container.insertBefore(menu, container.querySelector('.nav_buttons'));
  }
  return menu;
}

function createMyBookingsLink() {
  const a = document.createElement('a');
  a.href = 'bookings.html';
  a.className = 'link';
  a.textContent = 'My Bookings';
  // add a small badge showing number of saved bookings (if any)
  const span = document.createElement('span');
  span.className = 'nav-badge';
  span.style.marginLeft = '0.5rem';
  span.style.padding = '0.1rem 0.45rem';
  span.style.borderRadius = '999px';
  span.style.background = 'rgba(237,190,102,0.15)';
  span.style.color = 'var(--secondary)';
  span.style.fontSize = '0.8rem';
  span.textContent = getBookingsCount();
  a.appendChild(span);
  return a;
}

function getBookingsCount() {
  try {
    const arr = JSON.parse(localStorage.getItem('bookings') || '[]');
    return Array.isArray(arr) ? String(arr.length) : '0';
  } catch (e) { return '0'; }
}

function renderNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const menu = ensureMenu(nav);

  // remove any stray My Bookings links first
  const existing = menu.querySelectorAll('a').forEach(el => {
    if (el.getAttribute('href') === 'bookings.html') el.remove();
  });

  const signed = isSignedIn();
  if (signed) {
    // add My Bookings link if missing
    if (!menu.querySelector('a[href="bookings.html"]')) {
      menu.appendChild(createMyBookingsLink());
    }
    // replace auth buttons with sign out and greeting
    const navButtons = nav.querySelector('.nav_buttons');
    if (navButtons) {
      navButtons.innerHTML = '';
      const user = currentUser();
      const span = document.createElement('span');
      span.textContent = user && user.email ? user.email : 'Member';
      span.style.marginRight = '0.8rem';
      span.style.color = 'var(--secondary)';
      navButtons.appendChild(span);

      const out = document.createElement('button');
      out.className = 'btn btn-outline';
      out.textContent = 'Sign Out';
      out.addEventListener('click', (e) => { signOut(); renderNav(); });
      navButtons.appendChild(out);
    }
  } else {
    // not signed in: ensure My Bookings not present
    const mb = menu.querySelector('a[href="bookings.html"]');
    if (mb) mb.remove();
    // restore auth buttons if missing
    const navButtons = nav.querySelector('.nav_buttons');
    if (navButtons) {
      navButtons.innerHTML = '';
      const a1 = document.createElement('a');
      a1.href = 'login.html';
      a1.className = 'btn btn-outline';
      a1.textContent = 'Sign In';
      const a2 = document.createElement('a');
      a2.href = 'register.html';
      a2.className = 'btn btn-outline';
      a2.textContent = 'Register';
      navButtons.appendChild(a1);
      navButtons.appendChild(a2);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  onAuthChange(() => renderNav());
});
