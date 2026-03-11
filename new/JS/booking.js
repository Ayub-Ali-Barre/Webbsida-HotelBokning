import { fetchHotels } from "./hotelService.js";

function createHotelDetailsHTML(hotel) {
  return `
    <div class="hotel-details">
      <img src="${hotel.image}" alt="${hotel.name}" class="hotel-image">
      <div class="hotel-info">
        <span class="label">${hotel.category} Collection</span>
        <h1>${hotel.name}</h1>
        <div class="hotel-meta">
          <span>${hotel.location}</span>
          <span>${hotel.rating} ★ (${hotel.reviews} reviews)</span>
        </div>
        <p class="hotel-description">${hotel.description}</p>
        <div class="amenities-list">
          ${hotel.amenities.map(a => `<div class="amenity-item"><span>•</span> <span>${a}</span></div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function createBookingFormHTML(hotel) {
  return `
    <div class="booking-form-card">
      <form id="booking-form" class="booking-form">
        <div class="form-group">
          <label>Check-in</label>
          <input type="date" id="checkin" class="form-input" required>
        </div>
        <div class="form-group">
          <label>Check-out</label>
          <input type="date" id="checkout" class="form-input" required>
        </div>
        <div class="form-group">
          <label>Guests</label>
          <select id="guests" class="form-input">
            <option>1</option>
            <option selected>2</option>
            <option>3</option>
            <option>4</option>
          </select>
        </div>
        <button type="submit" class="btn btn-gold" style="width:100%; margin-top:1rem;">Reserve Now</button>
      </form>
      <p id="bookingMessage" style="margin-top:1rem; font-weight:600;"></p>
    </div>
  `;
}

async function initBooking() {
  const bookingContent = document.getElementById("booking-content");
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get("id");
  const user = JSON.parse(localStorage.getItem("user")); // Hämta inloggad user

  if (!user) {
    bookingContent.innerHTML = `<p style="grid-column:1/-1;text-align:center;">You must be logged in to book. <a href="login.html">Sign in</a></p>`;
    return;
  }

  if (!hotelId) {
    bookingContent.innerHTML = `<p style="grid-column:1/-1;text-align:center;">No hotel selected.</p>`;
    return;
  }

  try {
    const allHotels = await fetchHotels();
    const hotel = allHotels.find(h => h.id === hotelId);

    if (!hotel) {
      bookingContent.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Hotel not found.</p>`;
      return;
    }

    bookingContent.innerHTML = `
      ${createHotelDetailsHTML(hotel)}
      ${createBookingFormHTML(hotel)}
    `;

    const form = document.getElementById("booking-form");
    const msg = document.getElementById("bookingMessage");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const check_in = document.getElementById("checkin").value;
      const check_out = document.getElementById("checkout").value;
      const guests = parseInt(document.getElementById("guests").value);

      try {
        const response = await fetch("http://127.0.0.1:8000/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify({
          user_id: user.id,
          hotel_id: hotel.id,
          hotel_name: hotel.name,
          check_in,
          check_out,
          guests
          })
        });

        const data = await response.json();

        if (response.ok) {
          msg.textContent = `Booking successful! Total: $${data.total_price} for ${data.nights} nights.`;
          setTimeout(() => window.location.href = "profile.html", 2000);
        } else {
          msg.textContent = `Booking failed: ${data.detail}`;
        }

      } catch (err) {
        console.error(err);
        msg.textContent = "Booking failed. Please try again later.";
      }
    });

  } catch (err) {
    console.error(err);
    bookingContent.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Failed to load hotel details.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", initBooking);