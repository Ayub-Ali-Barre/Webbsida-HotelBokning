document.addEventListener("DOMContentLoaded", function () {
  const bookButton = document.querySelector(".Book-button button");
  const modal = document.getElementById("bookingModal");
  const cancelBtn = document.getElementById("cancelBooking");
  const confirmBtn = document.getElementById("confirmBooking");

  bookButton.addEventListener("click", function () {
    modal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  confirmBtn.addEventListener("click", function () {
    const date = document.getElementById("bookingDate").value;
    const room = document.getElementById("roomSelect").value;

    if (!date || !room) {
      alert("Please select a date and a room.");
      return;
    }

    alert(`Booking confirmed!\nDate: ${date}\nRoom: ${room}`);
    modal.style.display = "none";
  });

  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
