async function fetchHotels() {
  const res = await fetch("/py/hotels");

  if (!res.ok) {
    throw new Error("Failed to fetch hotels");
  }

  return await res.json();
}

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
          ${hotel.amenities.map(a => `
            <div class="amenity-item">
              <span>•</span>
              <span>${a}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function createBookingFormHTML(hotel) {
  const serviceFee = Math.round(hotel.pricePerNight * 0.1);
  const total = Math.round(hotel.pricePerNight + serviceFee);

  return `
    <div class="booking-form-card">
      <span class="booking-price">$${hotel.pricePerNight} / night</span>

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
            <option value="1">1 Guest</option>
            <option value="2" selected>2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
          </select>
        </div>

        <div class="booking-summary">
          <div class="summary-row">
            <span>Price per night</span>
            <span>$${hotel.pricePerNight}</span>
          </div>
          <div class="summary-row">
            <span>Service fee</span>
            <span>$${serviceFee}</span>
          </div>
          <div class="summary-total">
            <span>Total</span>
            <span>$${total}</span>
          </div>
        </div>

        <button type="submit" class="btn btn-gold" style="width:100%; margin-top:1rem;">
          Reserve Now
        </button>
      </form>

      <p id="bookingMessage" style="margin-top:1rem;font-weight:600;"></p>
    </div>
  `;
}

async function initBooking() {
  const bookingContent = document.getElementById("booking-content");
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get("id");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!bookingContent) return;

  if (!user) {
    bookingContent.innerHTML = `<p style="grid-column:1/-1;text-align:center;">You must be logged in to book.</p>`;
    return;
  }

  if (!hotelId) {
    bookingContent.innerHTML = `<p style="grid-column:1/-1;text-align:center;">No hotel selected.</p>`;
    return;
  }

  try {
    const hotels = await fetchHotels();
    const hotel = hotels.find(h => String(h.id) === String(hotelId));

    if (!hotel) {
      bookingContent.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Hotel not found.</p>`;
      return;
    }

    bookingContent.innerHTML = `
      ${createHotelDetailsHTML(hotel)}
      ${createBookingFormHTML(hotel)}
    `;

    const form = document.getElementById("booking-form");
    const modal = document.getElementById("amenities-modal");
    const closeModalBtn = document.getElementById("close-modal");
    const confirmBookingBtn = document.getElementById("confirm-booking");
    const amenitiesOptions = document.getElementById("amenities-options");
    const msg = document.getElementById("bookingMessage");

    const optionalAmenities = [
      { name: "Airport Transfer", price: 85 },
      { name: "Champagne on Arrival", price: 120 },
      { name: "Private Concierge", price: 250 },
      { name: "Spa Day Pass", price: 150 },
      { name: "Late Check-out", price: 95 }
    ];

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      amenitiesOptions.innerHTML = optionalAmenities.map(a => `
        <label class="amenity-option" style="display:flex;justify-content:space-between;align-items:center;margin:12px 0;cursor:pointer;">
          <span>
            <input type="checkbox" value="${a.name}" data-price="${a.price}">
            ${a.name}
          </span>
          <strong>+$${a.price}</strong>
        </label>
      `).join("");

      modal.classList.add("active");
    });

    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });

    confirmBookingBtn.addEventListener("click", async () => {
      const selected = [...amenitiesOptions.querySelectorAll("input:checked")];
      const amenitiesPrice = selected.reduce((sum, a) => sum + Number(a.dataset.price), 0);

      const check_in = document.getElementById("checkin").value;
      const check_out = document.getElementById("checkout").value;
      const guests = Number(document.getElementById("guests").value);

      try {
        const res = await fetch("/py/book", {
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
            guests,
            amenities_price: amenitiesPrice
          })
        });

        const data = await res.json();

        if (!res.ok) {
          msg.textContent = data.detail || "Booking failed";
          return;
        }

        msg.textContent = `Booking confirmed! Total: $${data.total_price}`;
        modal.classList.remove("active");

        setTimeout(() => {
          window.location.href = "profile.html";
        }, 2000);

      } catch (err) {
        console.error(err);
        msg.textContent = "Server error";
      }
    });

  } catch (err) {
    console.error(err);
    bookingContent.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Failed to load hotel.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", initBooking);