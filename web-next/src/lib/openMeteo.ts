/** Open-Meteo forecast API (open data, attribution required in UI). */

const BASE = "https://api.open-meteo.com/v1/forecast";

export type OpenMeteoCurrent = {
  temperature_2m?: number;
  apparent_temperature?: number;
  relative_humidity_2m?: number;
  weather_code?: number;
};

export type OpenMeteoResponse = {
  current?: OpenMeteoCurrent;
  error?: boolean;
  reason?: string;
};

export function openMeteoForecastUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code",
    timezone: "auto",
  });
  return `${BASE}?${params.toString()}`;
}

export async function fetchOpenMeteoCurrent(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<OpenMeteoResponse> {
  const res = await fetch(openMeteoForecastUrl(lat, lon), { signal });
  if (!res.ok) return { error: true, reason: String(res.status) };
  return (await res.json()) as OpenMeteoResponse;
}
