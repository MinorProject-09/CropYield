import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function fixLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
}

function MapClick({ onPick }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick(lat, lng);
      map.setView([lat, lng], Math.max(map.getZoom(), 13), { animate: true });
    },
  });
  return null;
}

/** Pans the map when focusNonce changes (e.g. after “Use my location”), not on every drag. */
function FlyToExternalPin({ lat, lng, focusNonce }) {
  const map = useMap();
  const prevNonce = useRef(0);
  useEffect(() => {
    if (focusNonce > 0 && focusNonce !== prevNonce.current) {
      prevNonce.current = focusNonce;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        map.setView([lat, lng], Math.max(map.getZoom(), 13), { animate: true });
      }
    }
  }, [focusNonce, lat, lng, map]);
  return null;
}

/**
 * Interactive map (OpenStreetMap tiles): click to pin, drag pin to adjust. Lat/lng update via onChange.
 */
export default function LocationMapPicker({ latitude, longitude, onChange, focusNonce = 0 }) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const hasPin =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  const center = hasPin ? [lat, lng] : DEFAULT_CENTER;
  const zoom = hasPin ? 13 : DEFAULT_ZOOM;

  function handlePick(a, b) {
    onChange({
      latitude: a.toFixed(6),
      longitude: b.toFixed(6),
    });
  }

  function handleDragEnd(e) {
    const m = e.target.getLatLng();
    handlePick(m.lat, m.lng);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-green-200 bg-white shadow-inner">
      <p className="border-b border-green-100 bg-green-50/80 px-3 py-2 text-xs text-green-800">
        Click the map to drop a pin, or drag the pin to fine-tune. Latitude and longitude update
        automatically.
      </p>
      <MapContainer
        center={center}
        zoom={zoom}
        className="z-0 h-[min(420px,55vh)] w-full min-h-[320px]"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClick onPick={handlePick} />
        {hasPin ? <FlyToExternalPin lat={lat} lng={lng} focusNonce={focusNonce} /> : null}
        {hasPin ? (
          <Marker
            position={[lat, lng]}
            draggable
            eventHandlers={{
              dragend: handleDragEnd,
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
