function fmtCurrency(n) { return `$${Number(n).toFixed(2)}`; }

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
  } catch (e) {
    console.error('failed parsing bookings', e);
    return [];
  }
}

function saveBookings(arr) {
  localStorage.setItem('bookings', JSON.stringify(arr));
}

function createCard(b) {
  const el = document.createElement('article');
  el.className = 'booking-card card';

  const top = document.createElement('div');
  top.className = 'booking-row';
  top.innerHTML = `<div>
      <div style="font-weight:600">${b.hotelName || 'Unknown Hotel'}</div>
      <div class="booking-meta">${b.checkin} → ${b.checkout} • ${b.nights} nights</div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:700">${fmtCurrency(b.total)}</div>
      <div class="booking-meta">${b.room}</div>
    </div>`;

  const actions = document.createElement('div');
  actions.style.marginTop = '0.75rem';

  const viewBtn = document.createElement('button');
  viewBtn.className = 'btn small-btn';
  viewBtn.textContent = 'View';

  const detailsLink = document.createElement('a');
  detailsLink.className = 'btn small-btn';
  detailsLink.style.marginLeft = '0.6rem';
  detailsLink.textContent = 'Open';
  detailsLink.href = `booking.html?id=${encodeURIComponent(b.id)}`;
  detailsLink.setAttribute('role', 'link');

  const delBtn = document.createElement('button');
  delBtn.className = 'btn small-btn';
  delBtn.style.marginLeft = '0.6rem';
  delBtn.textContent = 'Delete';

  const details = document.createElement('div');
  details.style.display = 'none';
  details.style.marginTop = '0.65rem';
  details.innerHTML = `<div class="booking-meta">ID: ${b.id}</div>
    <div class="booking-meta">Per night: ${fmtCurrency(b.perNight || 0)}</div>
    <div class="booking-meta">Saved: ${new Date(b.createdAt).toLocaleString()}</div>`;

  viewBtn.addEventListener('click', () => {
    details.style.display = details.style.display === 'none' ? 'block' : 'none';
    viewBtn.textContent = details.style.display === 'none' ? 'View' : 'Hide';
  });

  delBtn.addEventListener('click', () => {
    // delete with undo
    removeBookingWithUndo(b.id);
  });

  actions.appendChild(viewBtn);
  actions.appendChild(detailsLink);
  actions.appendChild(delBtn);

  el.appendChild(top);
  el.appendChild(actions);
  el.appendChild(details);

  return el;
}

let lastDeleted = null;
let undoTimer = null;

function showSnack(text, undoCallback) {
  const snack = document.getElementById('snackbar');
  const txt = document.getElementById('snackText');
  const undo = document.getElementById('snackUndo');
  if (!snack || !txt || !undo) return;
  txt.textContent = text;
  snack.style.display = 'flex';
  undo.onclick = () => {
    if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }
    snack.style.display = 'none';
    if (typeof undoCallback === 'function') undoCallback();
  };
  // auto-hide after 6s and finalize
  undoTimer = setTimeout(() => {
    snack.style.display = 'none';
    undoTimer = null;
    lastDeleted = null; // finalize deletion
  }, 6000);
}

function removeBookingWithUndo(id) {
  const bookings = loadBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return;
  lastDeleted = bookings.splice(idx,1)[0];
  saveBookings(bookings);
  renderList();
  showSnack('Booking deleted', () => {
    // undo
    const cur = loadBookings();
    cur.push(lastDeleted);
    // sort by createdAt
    cur.sort((a,b) => (new Date(b.createdAt) - new Date(a.createdAt)));
    saveBookings(cur);
    lastDeleted = null;
    renderList();
  });
}

function renderList() {
  const list = document.getElementById('bookingsList');
  const empty = document.getElementById('emptyMessage');
  if (!list) return;
  const bookings = loadBookings();
  list.innerHTML = '';
  if (!bookings.length) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  // sort newest first
  bookings.sort((a,b) => (new Date(b.createdAt) - new Date(a.createdAt)));
  bookings.forEach(b => {
    const card = createCard(b);
    list.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderList();
});

// export for testing if needed
export { loadBookings, saveBookings, removeBookingWithUndo };
