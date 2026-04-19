import axios from 'axios'

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY

export const getNearbyBookstores = async (lat, lng, radius = 5000) => {
  const categories = 'commercial.books,education.library'
  const url = `https://api.geoapify.com/v2/places`
  const { data } = await axios.get(url, {
    params: {
      categories,
      filter: `circle:${lng},${lat},${radius}`,
      limit: 20,
      apiKey: GEOAPIFY_KEY,
    },
  })
  return data.features.map((f) => ({
    id: f.properties.place_id,
    name: f.properties.name || 'Unnamed',
    address: f.properties.formatted || '',
    distance: f.properties.distance ? Math.round(f.properties.distance) : null,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
  }))
}