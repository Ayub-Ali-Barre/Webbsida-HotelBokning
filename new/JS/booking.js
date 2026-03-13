import { getCurrentUser } from "./auth.js";
import { getHotelById } from "./hotelService.js";

function getHotelIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function createBookingFormHTML(hotel) {
  return `
    <div class="booking-form-card">
      <span class="booking-price">$${hotel.pricePerNight} <small>/ night</small></span>

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
            <option value="1">1</option>
            <option value="2" selected>2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        <div class="extras-section">
          <h3 class="extras-title">Room Extras</h3>

          <label class="extra-item">
            <div>
              <span>Welcome Water</span>
              <small>$5</small>
            </div>
            <input type="checkbox" class="extra-checkbox" data-name="Welcome Water" data-price="5">
          </label>

          <label class="extra-item">
            <div>
              <span>Soft Drinks</span>
              <small>$8</small>
            </div>
            <input type="checkbox" class="extra-checkbox" data-name="Soft Drinks" data-price="8">
          </label>

          <label class="extra-item">
            <div>
              <span>Snacks Tray</span>
              <small>$12</small>
            </div>
            <input type="checkbox" class="extra-checkbox" data-name="Snacks Tray" data-price="12">
          </label>

          <label class="extra-item">
            <div>
              <span>Breakfast to Room</span>
              <small>$25</small>
            </div>
            <input type="checkbox" class="extra-checkbox" data-name="Breakfast to Room" data-price="25">
          </label>
        </div>

        <div class="booking-summary" id="booking-summary">
          <div class="summary-row">
            <span>Room total</span>
            <span id="room-total">$0.00</span>
          </div>

          <div class="summary-row">
            <span>Extras</span>
            <span id="extras-total">$0.00</span>
          </div>

          <div class="summary-total">
            <span>Grand Total</span>
            <span id="grand-total">$0.00</span>
          </div>
        </div>

        <button type="submit" class="btn btn-gold" style="width:100%; margin-top:1rem;">
          Reserve Now
        </button>
      </form>

      <p id="bookingMessage" style="margin-top:1rem; font-weight:600;"></p>
    </div>
  `;
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const diffMs = checkOutDate - checkInDate;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays > 0 ? diffDays : 0;
}

function initBooking() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const hotelId = getHotelIdFromUrl();
  const hotel = getHotelById(hotelId);

  const bookingContainer = document.getElementById("booking-container");
  const hotelInfoContainer = document.getElementById("booking-hotel-info");

  if (!hotel) {
    bookingContainer.innerHTML = "<p>Hotel not found.</p>";
    return;
  }

  hotelInfoContainer.innerHTML = `
    <div class="booking-hotel-card">
      <img src="${hotel.image}" alt="${hotel.name}" class="booking-hotel-image">
      <div class="booking-hotel-text">
        <span class="label">${hotel.location}</span>
        <h1>${hotel.name}</h1>
        <p>${hotel.description}</p>
      </div>
    </div>
  `;

  bookingContainer.innerHTML = createBookingFormHTML(hotel);

  const form = document.getElementById("booking-form");
  const msg = document.getElementById("bookingMessage");

  const checkinInput = document.getElementById("checkin");
  const checkoutInput = document.getElementById("checkout");
  const guestsInput = document.getElementById("guests");
  const extraCheckboxes = document.querySelectorAll(".extra-checkbox");

  function calculateTotals() {
    const checkInValue = checkinInput.value;
    const checkOutValue = checkoutInput.value;

    const nights = calculateNights(checkInValue, checkOutValue);
    const roomTotal = nights * Number(hotel.pricePerNight || 0);

    let extrasTotal = 0;
    extraCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        extrasTotal += Number(checkbox.dataset.price);
      }
    });

    const grandTotal = roomTotal + extrasTotal;

    document.getElementById("room-total").textContent = `$${roomTotal.toFixed(2)}`;
    document.getElementById("extras-total").textContent = `$${extrasTotal.toFixed(2)}`;
    document.getElementById("grand-total").textContent = `$${grandTotal.toFixed(2)}`;

    return { nights, roomTotal, extrasTotal, grandTotal };
  }

  checkinInput.addEventListener("change", calculateTotals);
  checkoutInput.addEventListener("change", calculateTotals);
  guestsInput.addEventListener("change", calculateTotals);

  extraCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", calculateTotals);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.textContent = "";
    msg.style.color = "";

    const check_in = checkinInput.value;
    const check_out = checkoutInput.value;
    const guests = parseInt(guestsInput.value);

    if (!check_in || !check_out) {
      msg.textContent = "Please select check-in and check-out dates.";
      msg.style.color = "tomato";
      return;
    }

    const nights = calculateNights(check_in, check_out);
    if (nights <= 0) {
      msg.textContent = "Check-out must be after check-in.";
      msg.style.color = "tomato";
      return;
    }

    const selectedExtras = [];
    document.querySelectorAll(".extra-checkbox").forEach((checkbox) => {
      if (checkbox.checked) {
        selectedExtras.push({
          name: checkbox.dataset.name,
          price: Number(checkbox.dataset.price)
        });
      }
    });

    const totals = calculateTotals();

    try {
      const res = await fetch("http://127.0.0.1:8000/book", {
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
          extras: selectedExtras,
          extras_total: totals.extrasTotal,
          grand_total: totals.grandTotal
        })
      });

      const data = await res.json();

      if (!res.ok) {
        msg.textContent = data.detail || "Booking failed.";
        msg.style.color = "tomato";
        return;
      }

      msg.textContent =
        `Booking successful! Room total: $${data.total_price}. ` +
        `Extras: $${totals.extrasTotal.toFixed(2)}. ` +
        `Grand total: $${totals.grandTotal.toFixed(2)} for ${data.nights} nights.`;

      msg.style.color = "lightgreen";
      form.reset();
      calculateTotals();
    } catch (error) {
      msg.textContent = "Server error. Please try again.";
      msg.style.color = "tomato";
    }
  });

  calculateTotals();
}

document.addEventListener("DOMContentLoaded", initBooking);