export function getGoogleMapsApiKey(): string | undefined {
  const k = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  return k || undefined;
}
