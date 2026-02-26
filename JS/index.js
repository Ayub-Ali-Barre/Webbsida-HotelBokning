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
        <a href="hotel.html?id=${hotel.id}" class="btn btn-outline" style="width: 100%; padding: 1rem;">Explore</a>
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

  // set a helpful placeholder for the travel dates input (today - 7 days)
  const travelInput = document.getElementById('travel');
  if (travelInput) {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 7);

    const fmt = (d) => d.toISOString().slice(0,10);
    // keep a simple placeholder label; show example range in the title (hover)
    travelInput.placeholder = 'Travel';
    travelInput.title = `${fmt(today)} — ${fmt(end)}`;
  }

  // When the user clicks the travel placeholder, show two date inputs (check-in/check-out)
  if (travelInput) {
    travelInput.readOnly = true; // avoid keyboard on mobile; we'll swap to dates on click
    const searchBar = travelInput.closest('.search');

    const createDateInput = (id, placeholder) => {
      const inp = document.createElement('input');
      inp.type = 'date';
      inp.id = id;
      inp.name = id;
      inp.className = 'input date-input';
      inp.placeholder = placeholder;
      return inp;
    };

    let checkinInput = null;
    let checkoutInput = null;

    const removeDateInputs = () => {
      if (checkinInput && checkinInput.parentNode) checkinInput.parentNode.removeChild(checkinInput);
      if (checkoutInput && checkoutInput.parentNode) checkoutInput.parentNode.removeChild(checkoutInput);
      checkinInput = null;
      checkoutInput = null;
      travelInput.style.display = '';
    };

    const commitDates = () => {
      if (checkinInput && checkoutInput && checkinInput.value && checkoutInput.value) {
        travelInput.value = `${checkinInput.value} — ${checkoutInput.value}`;
      }
      removeDateInputs();
    };

    travelInput.addEventListener('click', (e) => {
      // if already swapped do nothing
      if (checkinInput) return;
      // hide the placeholder input
      travelInput.style.display = 'none';

      // create date inputs and insert before the search button
      checkinInput = createDateInput('checkin', 'Check-in');
      checkoutInput = createDateInput('checkout', 'Check-out');

      // find the search button to insert before it
      const searchBtn = searchBar.querySelector('button');
      searchBar.insertBefore(checkinInput, searchBtn);
      searchBar.insertBefore(checkoutInput, searchBtn);

      // focus the first date
      checkinInput.focus();

      // when both dates are selected, commit and remove date inputs
      const onBlurOrChange = () => {
        // small timeout to allow clicks between inputs
        setTimeout(() => {
          if (!checkinInput || !checkoutInput) return;
          // if both have values, commit
          if (checkinInput.value && checkoutInput.value) {
            commitDates();
          }
        }, 150);
      };

      checkinInput.addEventListener('change', onBlurOrChange);
      checkoutInput.addEventListener('change', onBlurOrChange);

      // if user clicks outside the search bar, commit or remove
      const onDocClick = (ev) => {
        if (!searchBar.contains(ev.target)) {
          commitDates();
          document.removeEventListener('click', onDocClick);
        }
      };
      document.addEventListener('click', onDocClick);
    });
  }

  // Dynamic city suggestions using Teleport Cities API
  const destInput = document.getElementById('destination');
  const datalist = document.getElementById('cities');
  if (destInput && datalist) {
    // a small curated list of popular cities shown by default
    const defaultCities = [
      'Stockholm', 'Gothenburg', 'Malmö', 'Copenhagen', 'Helsinki',
      'London, UK', 'Paris, France', 'New York, USA', 'Los Angeles, USA', 'Tokyo, Japan', 'Marrakech, Morocco', 'Monaco', 'French Riviera'
    ];

    const renderOptions = (arr) => {
      datalist.innerHTML = arr.map(v => `<option value="${v}"></option>`).join('');
    };

    // populate defaults initially
    renderOptions(defaultCities);

    let timer = null;
    const fetchCities = async (q) => {
      // show curated defaults for short queries / empty
      if (!q || q.length < 2) {
        renderOptions(defaultCities);
        return;
      }
      try {
        const res = await fetch(`https://api.teleport.org/api/cities/?search=${encodeURIComponent(q)}&limit=10`);
        if (!res.ok) return;
        const data = await res.json();
        const results = (data._embedded && data._embedded['city:search-results']) || [];
        const names = results.map(r => r.matching_full_name || (r.name || '')).filter(Boolean);
        // if API returned nothing, fall back to defaults
        if (!names.length) renderOptions(defaultCities);
        else renderOptions(names);
      } catch (e) {
        // on error, keep defaults
        console.error('city search error', e);
        renderOptions(defaultCities);
      }
    };

    destInput.addEventListener('input', (e) => {
      const q = e.target.value;
      clearTimeout(timer);
      timer = setTimeout(() => fetchCities(q), 250);
    });

    // when focused and empty, show defaults
    destInput.addEventListener('focus', () => {
      if (!destInput.value) renderOptions(defaultCities);
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
