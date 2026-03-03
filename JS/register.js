document.getElementById('registerForm')?.addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value;
  const fullname = document.getElementById('fullname').value;

  // Attempt to call backend if present; otherwise simulate success.
  fetch('http://127.0.0.1:8000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username, fullname })
  })
  .then(res => {
    if (!res.ok) throw new Error('server');
    return res.json();
  })
  .then(() => {
    // Auto sign-in for demo: store minimal user and go to index
    localStorage.setItem('site_user', JSON.stringify({ email, username, fullname }));
    window.location.href = 'index.html';
  })
  .catch(() => {
    // If backend missing, still auto-create local user for demo purposes
    localStorage.setItem('site_user', JSON.stringify({ email, username, fullname }));
    window.location.href = 'index.html';
  });
});
