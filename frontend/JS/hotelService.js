const API_BASE = "/py";

export async function fetchHotels(city = "") {

  let url = `${API_BASE}/hotels`;

  if (city) {
    url += `?city=${encodeURIComponent(city)}`;
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch hotels");
  }

  return await res.json();
}