async function initProfile() {
  const userJSON = localStorage.getItem("user");
  const bookingsList = document.getElementById("bookings-list");

  if (!userJSON) {
    window.location.href = "login.html";
    return;
  }

  let user = JSON.parse(userJSON);

  const nameEl = document.querySelector(".profile-info h1");

  if (user.is_verified) {
    nameEl.innerHTML = `${user.fullname} <span class="verified">✔</span>`;
    } else {
  nameEl.textContent = user.fullname;
}


  document.querySelector(".profile-info p").textContent = user.email;

  const verifySection = document.getElementById("verify-section");
  const verifyBtn = document.getElementById("verify-btn");

  try {
    const res = await fetch(`http://127.0.0.1:8000/user-status/${user.id}`);
    if (res.ok) {
      const data = await res.json();
      user.is_verified = data.is_verified; 
      localStorage.setItem("user", JSON.stringify(user));
    }
  } catch (err) {
    console.error("Could not fetch verification status:", err);
  }

  if (!user.is_verified) {
    verifySection.style.display = "block";
    verifyBtn.style.display = "block";

    verifyBtn.addEventListener("click", async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/send-verification/${user.id}`, { method: "POST" });
        if (!res.ok) throw new Error();

        alert("Verification email sent! Check your inbox.");

        verifyBtn.style.display = "none";

      } catch (err) {
        alert("Could not send verification email");
        console.error(err);
      }
    });
  } else {
    verifySection.style.display = "none";
    verifyBtn.style.display = "none";
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/my-bookings/${user.id}`);
    const bookings = await response.json();

    if (bookings.length === 0) {
      bookingsList.innerHTML = `<div style="padding:2rem;text-align:center;opacity:0.6;">No bookings yet. Time to explore luxury stays.</div>`;
      return;
    }

    bookingsList.innerHTML = bookings.map(b => `
      <div class="booking-card">
        <div class="booking-info">
          <h3>${b.hotel_name}</h3>
          <div class="booking-meta">
            <span>${b.check_in}</span> → <span>${b.check_out}</span>
          </div>
          <div class="booking-bottom">
            <span>${b.guests} Guests</span>
            <strong>$${b.total_price}</strong>
          </div>
        </div>
        <button class="cancel-booking" data-id="${b.id}">Cancel</button>
      </div>
    `).join("");

  document.querySelectorAll(".cancel-booking").forEach(btn => {

  btn.addEventListener("click", async () => {

    const bookingId = btn.dataset.id;

    if (!confirm("Cancel this booking?")) return;

    try {

      const res = await fetch(
        `http://127.0.0.1:8000/booking/${bookingId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      console.log("DELETE RESPONSE:", data);

      if (!res.ok) throw new Error(data.detail);

      btn.closest(".booking-card").remove();

    }

    catch (err) {

      console.error("DELETE ERROR:", err);

      alert("Could not cancel booking");

    }

  });

});
  } catch (error) {
    console.error(error);
    bookingsList.innerHTML = `<div style="padding:2rem;text-align:center;">Failed to load bookings</div>`;
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

document.getElementById("logout-btn").addEventListener("click", logout);
document.addEventListener("DOMContentLoaded", initProfile);