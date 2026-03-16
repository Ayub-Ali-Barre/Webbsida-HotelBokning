const API_BASE = "https://auroraresort.online/py";

export async function fetchHotels() {
  const res = await fetch(`${API_BASE}/hotels`);

  if (!res.ok) {
    throw new Error("Failed to fetch hotels");
  }

  return await res.json();
}