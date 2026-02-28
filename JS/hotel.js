import { MOCK_HOTELS } from "./constants.js";

function getHotelIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function findHotelById(id) {
  return MOCK_HOTELS.find((h) => String(h.id) === String(id));
}

function renderHotel(hotel) {
  document.title = `${hotel.name} | Aurora Grand Hotels`;

  const categoryEl = document.getElementById("hotelCategory");
  const nameEl = document.getElementById("hotelName");
  const locationEl = document.getElementById("hotelLocation");
  const img = document.getElementById("hotelImage");
  const priceEl = document.getElementById("hotelPrice");
  const descEl = document.getElementById("hotelDescription");
  const list = document.getElementById("amenitiesList");

  if (categoryEl) categoryEl.textContent = hotel.category || "Hotel";
  if (nameEl) nameEl.innerHTML = `The <span>Aurora</span> Experience: ${hotel.name}`;
  if (locationEl) locationEl.textContent = hotel.location || "";

  if (img) {
    img.src = hotel.image;
    img.alt = hotel.name;
  }

  if (priceEl) priceEl.textContent = `$${hotel.pricePerNight} / night`;
  if (descEl) descEl.textContent = hotel.description || "";

  if (list) {
    list.innerHTML = "";
    (hotel.amenities || []).forEach((a) => {
      const li = document.createElement("li");
      li.textContent = a;
      list.appendChild(li);
    });
  }
}

function showNotFound() {
  const nameEl = document.getElementById("hotelName");
  const locationEl = document.getElementById("hotelLocation");
  const mainImg = document.getElementById("hotelImage");
  const priceEl = document.getElementById("hotelPrice");
  const descEl = document.getElementById("hotelDescription");
  const amenities = document.getElementById("amenitiesList");
  const openBtn = document.getElementById("openBooking");

  if (nameEl) nameEl.textContent = "Hotel not found";
  if (locationEl) locationEl.textContent = "Please go back to Hotels and select a valid stay.";
  if (mainImg) mainImg.style.display = "none";
  if (priceEl) priceEl.textContent = "";
  if (descEl) descEl.textContent = "";
  if (amenities) amenities.innerHTML = "";
  if (openBtn) openBtn.disabled = true;
}

function initBookingModal(hotel) {
  const openBtn = document.getElementById("openBooking");
  const modal = document.getElementById("bookingModal");
  const cancelBtn = document.getElementById("cancelBooking");
  const confirmBtn = document.getElementById("confirmBooking");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  if (!confirmBtn) return;

  confirmBtn.addEventListener("click", () => {
    const dateInput = document.getElementById("bookingDate");
    const roomSelect = document.getElementById("roomSelect");
    const date = dateInput ? dateInput.value : "";
    const room = roomSelect ? roomSelect.value : "";

    if (!date || !room) {
      alert("Please select a date and a room.");
      return;
    }

    // Save to localStorage (frontend-only until backend is ready)
    const booking = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      date,
      room,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("latestBooking", JSON.stringify(booking));

    if (modal) modal.style.display = "none";

    const successModal = document.getElementById("successModal");
    const successText = document.getElementById("successText");
    const closeSuccess = document.getElementById("closeSuccess");

    if (successText) {
      successText.innerHTML =
        `Hotel: <b>${hotel.name}</b><br>` +
        `Date: <b>${date}</b><br>` +
        `Room: <b>${room}</b>`;
    }

    if (successModal) successModal.style.display = "flex";

    if (closeSuccess && successModal) {
      closeSuccess.onclick = () => {
        successModal.style.display = "none";
      };
    }

    if (successModal) {
      window.addEventListener("click", (e) => {
        if (e.target === successModal) {
          successModal.style.display = "none";
        }
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getHotelIdFromUrl();
  const hotel = findHotelById(id);

  if (!hotel) {
    showNotFound();
    return;
  }

  renderHotel(hotel);
  initBookingModal(hotel);
});