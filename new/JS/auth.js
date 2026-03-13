export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function logoutUser() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function updateNavbar() {
  const navButtons = document.getElementById("navButtons");
  const menu = document.getElementById("menu");
  const user = getCurrentUser();

  if (!navButtons) return;

  if (user) {
    navButtons.innerHTML = `
      <button id="logoutBtn" class="btn btn-outline">Sign Out</button>
    `;

    if (menu) {
      menu.innerHTML = `
        <a href="hotels.html" class="link">Hotels</a>
        <a href="contact.html" class="link">Contact</a>
        <a href="profile.html" class="link">Profile</a>
      `;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logoutUser);
    }
  } else {
    navButtons.innerHTML = `
      <a href="login.html" class="btn btn-outline">Sign In</a>
      <a href="register.html" class="btn btn-gold">Register</a>
    `;

    if (menu) {
      menu.innerHTML = `
        <a href="hotels.html" class="link">Hotels</a>
        <a href="contact.html" class="link">Contact</a>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", updateNavbar);