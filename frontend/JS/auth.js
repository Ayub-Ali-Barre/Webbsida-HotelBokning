function updateNavbar() {
  const userJSON = localStorage.getItem("user");

  const navButtons = document.getElementById("navButtons");
  const menu = document.getElementById("menu");

  if (!navButtons) return;

  if (userJSON) {
    navButtons.innerHTML = `
      <button id="logout-btn" class="btn btn-outline">Sign Out</button>
    `;

    if (menu && !document.getElementById("profile-link")) {
      menu.insertAdjacentHTML(
        "beforeend",
        `<a href="profile.html" class="link" id="profile-link">Profile</a>`
      );
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "index.html";
      });
    }
  } else {
    navButtons.innerHTML = `
      <a href="login.html" class="btn btn-outline">Sign In</a>
      <a href="register.html" class="btn btn-outline">Register</a>
    `;

    const profileLink = document.getElementById("profile-link");
    if (profileLink) {
      profileLink.remove();
    }
  }
}

document.addEventListener("DOMContentLoaded", updateNavbar);