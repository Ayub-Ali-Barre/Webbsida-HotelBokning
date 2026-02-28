function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function loadBookings() {
  try { return JSON.parse(localStorage.getItem('bookings') || '[]'); }
  catch (e) { console.error(e); return []; }
}

function saveBookings(arr) { localStorage.setItem('bookings', JSON.stringify(arr)); }

document.addEventListener('DOMContentLoaded', () => {
  const id = qs('id');
  const all = loadBookings();
  const found = all.find(b => b.id === id);
  const notFound = document.getElementById('notFound');
  const detail = document.getElementById('detailContent');
  if (!found) {
    if (notFound) notFound.style.display = 'block';
    return;
  }
  if (detail) detail.style.display = 'block';
  document.getElementById('dHotel').textContent = found.hotelName || 'Booking';
  document.getElementById('dCheckin').textContent = found.checkin;
  document.getElementById('dCheckout').textContent = found.checkout;
  document.getElementById('dNights').textContent = found.nights;
  document.getElementById('dRoom').textContent = `Room: ${found.room} • Total: $${Number(found.total).toFixed(2)}`;

  const cancelBtn = document.getElementById('cancelBookingBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const idx = all.findIndex(b => b.id === id);
      if (idx === -1) return;
      all.splice(idx,1);
      saveBookings(all);
      // redirect back to bookings list
      window.location.href = 'bookings.html';
    });
  }
});
