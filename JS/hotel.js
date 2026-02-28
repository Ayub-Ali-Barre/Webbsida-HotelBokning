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
      openModal(modal);
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener("click", () => {
      closeModal(modal);
    });
  }

  if (!confirmBtn) return;

  // helpers
  const parseDate = (v) => (v ? new Date(v + 'T00:00:00') : null);
  const daysBetween = (a, b) => Math.round((b - a) / (1000 * 60 * 60 * 24));
  const fmtCurrency = (n) => `$${n.toFixed(2)}`;

  const checkinInput = document.getElementById('checkinDate');
  const checkoutInput = document.getElementById('checkoutDate');
  const roomSelect = document.getElementById('roomSelect');
  const bookingError = document.getElementById('bookingError');
  const psNight = document.getElementById('psNight');
  const psNights = document.getElementById('psNights');
  const psTotal = document.getElementById('psTotal');

  // room price multipliers
  const ROOM_MULT = {
    single: 1.0,
    double: 1.4,
    suite: 2.2,
  };

  // Focus trap helpers and accessible open/close
  let lastFocused = null;
  let currentOpenModal = null;

  const getFocusable = (root) => {
    if (!root) return [];
    const selectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    return Array.from(root.querySelectorAll(selectors)).filter((el) => el.offsetParent !== null);
  };

  const trapKey = (e) => {
    if (!currentOpenModal) return;
    const focusables = getFocusable(currentOpenModal);
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal(currentOpenModal);
      return;
    }
    if (e.key === 'Tab') {
      if (!focusables.length) {
        e.preventDefault();
        return;
      }
      const idx = focusables.indexOf(document.activeElement);
      if (e.shiftKey) {
        // shift+tab
        if (idx === 0 || document.activeElement === currentOpenModal) {
          e.preventDefault();
          focusables[focusables.length - 1].focus();
        }
      } else {
        // tab
        if (idx === focusables.length - 1) {
          e.preventDefault();
          focusables[0].focus();
        }
      }
    }
  };

  function openModal(el) {
    if (!el) return;
    lastFocused = document.activeElement;
    el.style.display = 'flex';
    el.setAttribute('aria-hidden', 'false');
    currentOpenModal = el;
    const focusables = getFocusable(el);
    if (focusables.length) focusables[0].focus();
    document.addEventListener('keydown', trapKey);
    // close when clicking on backdrop
    el.addEventListener('click', onBackdropClick);
  }

  function closeModal(el) {
    if (!el) return;
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
    currentOpenModal = null;
    document.removeEventListener('keydown', trapKey);
    el.removeEventListener('click', onBackdropClick);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onBackdropClick(e) {
    // if click target is the backdrop (the modal container itself), close
    if (e.target === e.currentTarget) {
      closeModal(e.currentTarget);
    }
  }

  const resetSummary = () => {
    if (psNight) psNight.textContent = '-';
    if (psNights) psNights.textContent = '-';
    if (psTotal) psTotal.textContent = '-';
  };

  const validateAndUpdate = () => {
    if (bookingError) {
      bookingError.style.display = 'none';
      bookingError.textContent = '';
    }

    const ci = checkinInput ? parseDate(checkinInput.value) : null;
    const co = checkoutInput ? parseDate(checkoutInput.value) : null;
    const room = roomSelect ? roomSelect.value : '';

    // basic validations
    if (!ci || !co) {
      resetSummary();
      confirmBtn.disabled = true;
      return false;
    }
    if (co <= ci) {
      if (bookingError) {
        bookingError.style.display = 'block';
        bookingError.textContent = 'Check-out must be after check-in.';
      }
      resetSummary();
      confirmBtn.disabled = true;
      return false;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    if (ci < today) {
      if (bookingError) {
        bookingError.style.display = 'block';
        bookingError.textContent = 'Check-in cannot be in the past.';
      }
      resetSummary();
      confirmBtn.disabled = true;
      return false;
    }

    if (!room) {
      if (bookingError) {
        bookingError.style.display = 'block';
        bookingError.textContent = 'Please select a room type.';
      }
      resetSummary();
      confirmBtn.disabled = true;
      return false;
    }

    // compute nights and totals
    const nights = daysBetween(ci, co);
    const base = hotel.pricePerNight || 0;
    const mult = ROOM_MULT[room] || 1;
    const perNight = base * mult;
    const total = perNight * nights;

    if (psNight) psNight.textContent = fmtCurrency(perNight);
    if (psNights) psNights.textContent = `${nights}`;
    if (psTotal) psTotal.textContent = fmtCurrency(total);

    confirmBtn.disabled = false;
    return {ci, co, room, nights, perNight, total};
  };

  // update summary when inputs change
  [checkinInput, checkoutInput, roomSelect].forEach((el) => {
    if (!el) return;
    el.addEventListener('change', validateAndUpdate);
  });

  // initial disable
  confirmBtn.disabled = true;

  confirmBtn.addEventListener('click', () => {
    const ok = validateAndUpdate();
    if (!ok) return;

    // ok contains booking details
    const {ci, co, room, nights, perNight, total} = ok;

    // build booking object and persist (append to 'bookings')
    const booking = {
      id: `b_${Date.now()}`,
      hotelId: hotel.id,
      hotelName: hotel.name,
      room,
      checkin: ci.toISOString().slice(0,10),
      checkout: co.toISOString().slice(0,10),
      nights,
      perNight,
      total,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
      existing.push(booking);
      localStorage.setItem('bookings', JSON.stringify(existing));
      localStorage.setItem('latestBooking', JSON.stringify(booking));
    } catch (e) {
      console.error('failed saving booking', e);
    }

    // close booking modal and show success modal (premium UI)
    closeModal(modal);

    const successModal = document.getElementById('successModal');
    const successText = document.getElementById('successText');
    const closeSuccess = document.getElementById('closeSuccess');

    if (successText) {
      successText.innerHTML =
        `<strong>${hotel.name}</strong><br>` +
        `Room: <b>${room}</b><br>` +
        `Check-in: <b>${booking.checkin}</b> — Check-out: <b>${booking.checkout}</b><br>` +
        `Nights: <b>${nights}</b><br>` +
        `Total paid: <b>${fmtCurrency(total)}</b>`;
    }

    if (successModal) openModal(successModal);

    if (closeSuccess && successModal) {
      closeSuccess.onclick = () => {
        closeModal(successModal);
      };
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