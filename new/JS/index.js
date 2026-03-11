import { fetchHotels } from "./hotelService.js";

function createHotelCardHTML(hotel) {
  return `
    <article class="card">
      <img src="${hotel.image}" alt="${hotel.name}" class="card-img" loading="lazy">
      <div class="card-body">
        <span class="label">${hotel.location}</span>
        <div class="card-row">
          <h3 class="card-name">${hotel.name}</h3>
          <span class="card-price">$${hotel.pricePerNight}</span>
        </div>
        <p class="card-text">${hotel.description}</p>
        <button class="btn btn-outline book-btn" data-id="${hotel.id}" style="width: 100%; padding: 1rem;">
          Book
        </button>
      </div>
    </article>
  `;
}


async function init() {
  const gridContainer = document.getElementById("grid");

  if (!gridContainer) return;

  gridContainer.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
      <div class="loading-spinner"></div>
      <p style="margin-top: 1rem; color: var(--secondary); letter-spacing: 2px; text-transform: uppercase; font-size: 0.8rem;">
        Curating the finest stays...
      </p>
    </div>
  `;

  try {
    const allHotels = await fetchHotels();

    const isHomepage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname === "/";

    const hotelsToShow = isHomepage ? allHotels.slice(0, 3) : allHotels;

    gridContainer.innerHTML = hotelsToShow.map(createHotelCardHTML).join("");

    gridContainer.querySelectorAll(".book-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const hotelId = e.currentTarget.dataset.id;

        const user = localStorage.getItem("user");
        if (!user) {
          alert("You must sign in before booking.");
          window.location.href = "login.html";
          return;
        }

        window.location.href = `booking.html?id=${hotelId}`;
      });
    });

    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const category = btn.textContent;
        const filtered =
          category === "All"
            ? allHotels
            : allHotels.filter((h) => h.category === category);

        gridContainer.innerHTML = filtered.map(createHotelCardHTML).join("");

        gridContainer.querySelectorAll(".book-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const hotelId = e.currentTarget.dataset.id;
            const user = localStorage.getItem("user");
            if (!user) {
              alert("You must sign in before booking.");
              window.location.href = "login.html";
              return;
            }
            window.location.href = `booking.html?id=${hotelId}`;
          });
        });
      });
    });

  } catch (error) {
    gridContainer.innerHTML = `
      <p style="grid-column: 1/-1; text-align: center;">
        Failed to load hotels. Please try again later.
      </p>
    `;
    console.error("Error fetching hotels:", error);
  }
}

document.addEventListener("DOMContentLoaded", init);


const allHotels = await fetchHotels();

console.log("HOTELS:", allHotels);