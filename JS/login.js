import { signIn } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.auth-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // simple client-side sign in (no backend)
    const email = form.querySelector('input[type="email"]').value || 'member@example.com';
    // set a minimal user object
    signIn({ email });
    // honor redirect param
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || 'index.html';
    window.location.href = redirect;
  });
});
