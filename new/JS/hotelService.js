export async function fetchHotels() {

  const response = await fetch("http://127.0.0.1:8000/hotels");

  const data = await response.json();

  return data;
}