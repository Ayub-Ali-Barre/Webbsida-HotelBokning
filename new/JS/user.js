async function initProfile() {

  const userJSON = localStorage.getItem("user");
  const bookingsList = document.getElementById("bookings-list");

  if (!userJSON) {
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(userJSON);

  // sätt namn och email
  document.querySelector(".profile-info h1").textContent = user.fullname;
  document.querySelector(".profile-info p").textContent = user.email;

  try {

    const response = await fetch(`http://127.0.0.1:8000/my-bookings/${user.id}`);

    const bookings = await response.json();

    if (bookings.length === 0) {
      bookingsList.innerHTML = `
        <div style="padding:2rem;text-align:center;opacity:0.6;">
          No bookings yet. Time to explore luxury stays.
        </div>
      `;
      return;
    }

  bookingsList.innerHTML = bookings.map(b => `
  <div class="booking-card">

    <div class="booking-info">
      <h3>${b.hotel_name}</h3>

      <div class="booking-meta">
        <span>${b.check_in}</span>
        <span>→</span>
        <span>${b.check_out}</span>
      </div>

      <div class="booking-bottom">
        <span>${b.guests} Guests</span>
        <strong>$${b.total_price}</strong>
      </div>
    </div>

    <button class="cancel-booking" data-id="${b.id}">
      Cancel
    </button>

  </div>
`).join("");


document.querySelectorAll(".cancel-booking").forEach(btn => {
  btn.addEventListener("click", async () => {
    const bookingId = btn.dataset.id;
    const confirmDelete = confirm("Cancel this booking?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/booking/${bookingId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete booking");

      btn.closest(".booking-card").remove();

    } catch (err) {
      alert("Could not cancel booking");
      console.error(err);
    }
  });
});

  } catch (error) {

    console.error(error);

    bookingsList.innerHTML = `
      <div style="padding:2rem;text-align:center;">
        Failed to load bookings
      </div>
    `;
  }
}


function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}


document.getElementById("logout-btn").addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", initProfile);


