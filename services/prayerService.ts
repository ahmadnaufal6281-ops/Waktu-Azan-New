
import { PrayerData } from "../types";

export const fetchPrayerTimings = async (lat: number, lng: number): Promise<PrayerData> => {
  const method = 4; // Kemenag (Indonesian Ministry of Religious Affairs) style
  const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`);
  if (!response.ok) throw new Error("Gagal mengambil jadwal sholat.");
  const json = await response.json();
  return json.data;
};

export const getLocationName = async (lat: number, lng: number): Promise<{ city: string; country: string }> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const json = await response.json();
    return {
      city: json.address.city || json.address.town || json.address.village || "Unknown City",
      country: json.address.country || "Unknown Country"
    };
  } catch (e) {
    return { city: "Jakarta", country: "Indonesia" }; // Fallback
  }
};
