import { MOCK_HOTELS } from "./constants.js";


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
        <button class="btn btn-outline" style="width: 100%; padding: 1rem;">Explore</button>
      </div>
    </article>
  `;
}


function init() {
  const gridContainer = document.getElementById('grid');
  
  if (gridContainer) {
    const hotelsHTML = MOCK_HOTELS.map(createHotelCardHTML).join('');
    gridContainer.innerHTML = hotelsHTML;
  }
}

document.addEventListener('DOMContentLoaded', init);
