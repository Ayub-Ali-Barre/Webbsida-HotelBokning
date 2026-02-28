document.addEventListener("DOMContentLoaded", function () {
  const bookButton = document.querySelector(".Book-button button");
  const modal = document.getElementById("bookingModal");
  const cancelBtn = document.getElementById("cancelBooking");
  const confirmBtn = document.getElementById("confirmBooking");

  if (!bookButton || !modal) return;

  bookButton.addEventListener("click", function () {
    modal.style.display = "flex";
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      modal.style.display = "none";
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
      if (modal) modal.style.display = 'none';
      if (successModal) successModal.style.display = 'flex';
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
