/**
 * Geocoding: prefers Google Maps Geocoding API when GOOGLE_MAPS_API_KEY is set,
 * otherwise falls back to OpenStreetMap Nominatim.
 *
 * Google: https://developers.google.com/maps/documentation/geocoding/requests-geocoding
 * Nominatim: https://operations.osmfoundation.org/policies/nominatim/
 */

async function googleGeocode(q, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&components=country:IN&key=${apiKey}`
  const resp = await fetch(url)
  const data = await resp.json()

  if (data.status === "OK" && data.results?.length) {
    const r = data.results[0]
    const loc = r.geometry?.location
    if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") {
      return null
    }
    return {
      lat: loc.lat,
      lng: loc.lng,
      displayName: r.formatted_address || q,
      provider: "google",
    }
  }

  if (data.status === "ZERO_RESULTS") {
    return null
  }

  const errMsg = data.error_message || data.status || "Google Geocoding failed"
  const err = new Error(errMsg)
  err.googleStatus = data.status
  throw err
}

async function nominatimGeocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`
  const resp = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "CropYield/1.0 (crop yield app; +https://localhost)",
    },
  })

  if (!resp.ok) {
    throw new Error("Nominatim unavailable")
  }

  const data = await resp.json()
  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  const hit = data[0]
  const lat = parseFloat(hit.lat)
  const lng = parseFloat(hit.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return {
    lat,
    lng,
    displayName: hit.display_name || q,
    provider: "nominatim",
  }
}

exports.geocodeSearch = async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : ""
  if (q.length < 3) {
    return res.status(400).json({ message: "Query must be at least 3 characters" })
  }

  const googleKey = process.env.GOOGLE_MAPS_API_KEY

  try {
    if (googleKey) {
      try {
        const g = await googleGeocode(q, googleKey)
        if (g) {
          return res.json(g)
        }
      } catch (e) {
        console.warn("Google geocode (falling back to OSM):", e.message)
      }
    }

    const n = await nominatimGeocode(q)
    if (!n) {
      return res.status(404).json({
        message: "No location found for that address",
        provider: googleKey ? "nominatim" : "nominatim",
      })
    }
    return res.json(n)
  } catch (err) {
    console.error("geocodeSearch:", err.message)
    res.status(502).json({ message: err.message || "Geocoding request failed" })
  }
}

/** Lets the UI show whether Google-backed geocoding is expected */
exports.geocodeStatus = (req, res) => {
  res.json({
    googleConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
  })
}
