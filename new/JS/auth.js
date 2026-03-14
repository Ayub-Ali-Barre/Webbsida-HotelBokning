export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}
function updateNavbar() {

  const navButtons = document.getElementById("navButtons");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!navButtons) return;

  if (user) {

    navButtons.innerHTML = `
      <button id="logoutBtn" class="btn btn-outline">Sign Out</button>
    `;

    
    menu.innerHTML = `
  <a href="hotels.html" class="link">Hotels</a>
  <a href="contact.html" class="link">Contact</a>
  <a href="profile.html" class="link">Profile</a>
  `;



    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });

  }

}

document.addEventListener("DOMContentLoaded", updateNavbar);