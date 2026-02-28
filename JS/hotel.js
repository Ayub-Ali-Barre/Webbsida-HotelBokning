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

  document.getElementById("hotelCategory").textContent = hotel.category || "Hotel";
  document.getElementById("hotelName").innerHTML = `The <span>Aurora</span> Experience: ${hotel.name}`;
  document.getElementById("hotelLocation").textContent = hotel.location || "";

  const img = document.getElementById("hotelImage");
  img.src = hotel.image;
  img.alt = hotel.name;

  document.getElementById("hotelPrice").textContent = `$${hotel.pricePerNight} / night`;
  document.getElementById("hotelDescription").textContent = hotel.description || "";

  const list = document.getElementById("amenitiesList");
  list.innerHTML = "";
  (hotel.amenities || []).forEach((a) => {
    const li = document.createElement("li");
    li.textContent = a;
    list.appendChild(li);
  });
}

function showNotFound() {
  document.getElementById("hotelName").textContent = "Hotel not found";
  document.getElementById("hotelLocation").textContent = "Please go back to Hotels and select a valid stay.";
  const mainImg = document.getElementById("hotelImage");
  mainImg.style.display = "none";
  document.getElementById("hotelPrice").textContent = "";
  document.getElementById("hotelDescription").textContent = "";
  document.getElementById("amenitiesList").innerHTML = "";
  document.getElementById("openBooking").disabled = true;
}

function initBookingModal(hotel) {
  const openBtn = document.getElementById("openBooking");
  const modal = document.getElementById("bookingModal");
  const cancelBtn = document.getElementById("cancelBooking");
  const confirmBtn = document.getElementById("confirmBooking");

  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  confirmBtn.addEventListener("click", () => {
    const date = document.getElementById("bookingDate").value;
    const room = document.getElementById("roomSelect").value;

    if (!date || !room) {
      alert("Please select a date and a room.");
      return;
    }

    // sparar i localStorage (frontend-only, tills backend är klar)
    const booking = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      date,
      room,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("latestBooking", JSON.stringify(booking));

    alert(`Booking confirmed!\nHotel: ${hotel.name}\nDate: ${date}\nRoom: ${room}`);
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
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