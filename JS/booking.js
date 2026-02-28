import { openModal, closeModal } from './modal.js';

document.addEventListener("DOMContentLoaded", function () {
  const bookButton = document.querySelector(".Book-button button");
  const modal = document.getElementById("bookingModal");
  const cancelBtn = document.getElementById("cancelBooking");
  const confirmBtn = document.getElementById("confirmBooking");

  if (!bookButton || !modal) return;

  bookButton.addEventListener("click", function () {
    openModal(modal);
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      closeModal(modal);
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      const ci = document.getElementById("checkinDate")?.value;
      const co = document.getElementById("checkoutDate")?.value;
      const room = document.getElementById("roomSelect")?.value;
      const bookingError = document.getElementById('bookingError');

      if (!ci || !co || !room) {
        if (bookingError) {
          bookingError.style.display = 'block';
          bookingError.textContent = 'Please select check-in, check-out and a room.';
        }
        return;
      }

      // persist minimal booking object
      const booking = {
        id: `b_${Date.now()}`,
        checkin: ci,
        checkout: co,
        room,
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

      // show success modal if present
      const successModal = document.getElementById('successModal');
      const successText = document.getElementById('successText');
      if (successText) successText.textContent = `Booking confirmed — ${ci} to ${co} (${room})`;
      closeModal(modal);
      if (successModal) openModal(successModal);
    });
  }

  // backdrop click handled by modal helper; no extra handler needed here
});
