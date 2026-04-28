import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Navigation } from "lucide-react";

/* Fix default Leaflet marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/** Haversine distance in km */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createColorIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
      <div style="width:8px;height:8px;border-radius:50%;background:white;"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#6B4EFF;border:3px solid white;box-shadow:0 2px 12px rgba(107,78,255,0.4);display:flex;align-items:center;justify-content:center;">
    <div style="width:10px;height:10px;border-radius:50%;background:white;animation:pulse 2s ease-in-out infinite;"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function FlyToLocation({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

/**
 * NearbyMap — Reusable map showing user location + nearby markers in a radius.
 *
 * Props:
 *   markers: [{ id, lat, lng, name, detail1, detail2, detail3 }]
 *   radiusKm: number (default 50)
 *   markerColor: string
 *   markerType: "ngo" | "volunteer"
 *   title: string
 */
export default function NearbyMap({ markers = [], radiusKm = 50, markerColor = "#FF6B35", markerType = "ngo", title = "Nearby" }) {
  const [userLoc, setUserLoc] = useState(null);
  const [locError, setLocError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setLocError("Unable to detect location. Please enable location access.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const nearbyMarkers = userLoc
    ? markers
        .map((m) => ({ ...m, distance: haversineKm(userLoc.lat, userLoc.lng, m.lat, m.lng) }))
        .filter((m) => m.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
    : [];

  const colorIcon = createColorIcon(markerColor);

  if (loading) {
    return (
      <div style={{ background: "white", borderRadius: 20, padding: 48, textAlign: "center", boxShadow: "0 4px 24px rgba(107,78,255,0.10)" }}>
        <Loader2 size={28} color="#6B4EFF" className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#6B7280" }}>
          Detecting your location...
        </p>
      </div>
    );
  }

  if (locError) {
    return (
      <div style={{ background: "white", borderRadius: 20, padding: 32, textAlign: "center", boxShadow: "0 4px 24px rgba(107,78,255,0.10)" }}>
        <Navigation size={32} color="#FF4D8D" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 16, color: "#1A1A2E", marginBottom: 4 }}>
          Location Access Needed
        </p>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#6B7280" }}>{locError}</p>
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(107,78,255,0.10)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={18} color={markerColor} />
          <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 16, color: "#1A1A2E" }}>
            {title}
          </span>
        </div>
        <span style={{
          padding: "4px 12px", borderRadius: 999, fontSize: 12,
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
          background: nearbyMarkers.length > 0 ? "#E6F9EE" : "#FFE8F2",
          color: nearbyMarkers.length > 0 ? "#2DCB73" : "#FF4D8D",
        }}>
          {nearbyMarkers.length} found within {radiusKm}km
        </span>
      </div>

      {/* Map */}
      <div style={{ height: 400 }}>
        <MapContainer
          center={[userLoc.lat, userLoc.lng]}
          zoom={10}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToLocation center={[userLoc.lat, userLoc.lng]} zoom={10} />

          {/* 50km radius circle */}
          <Circle
            center={[userLoc.lat, userLoc.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              fillColor: markerColor,
              fillOpacity: 0.06,
              color: markerColor,
              weight: 2,
              dashArray: "8 4",
              opacity: 0.4,
            }}
          />

          {/* User marker */}
          <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
            <Popup>
              <div style={{ textAlign: "center", padding: 4 }}>
                <strong style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14 }}>📍 You are here</strong>
              </div>
            </Popup>
          </Marker>

          {/* Entity markers */}
          {nearbyMarkers.map((m) => {
            const urgencyColor = m.urgencyScore ? (m.urgencyScore >= 8 ? "#FF4D8D" : m.urgencyScore >= 4 ? "#FFD046" : "#2DCB73") : markerColor;
            const icon = createColorIcon(urgencyColor);
            
            return (
              <Marker key={m.id} position={[m.lat, m.lng]} icon={icon}>
                <Popup>
                  <div style={{ padding: 4, minWidth: 180 }}>
                    <h4 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, color: "#1A1A2E", marginBottom: 6 }}>
                      {markerType === "ngo" ? "🏢" : "🙋"} {m.name}
                    </h4>
                    {m.detail1 && (
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#6B7280", marginBottom: 3 }}>
                        {m.detail1}
                      </p>
                    )}
                    {m.detail2 && (
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#6B7280", marginBottom: 3 }}>
                        {m.detail2}
                      </p>
                    )}
                    {m.detail3 && (
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#6B7280", marginBottom: 3 }}>
                        {m.detail3}
                      </p>
                    )}
                    <div style={{
                      marginTop: 8, padding: "4px 10px", borderRadius: 99,
                      background: "#EDE9FF", display: "inline-block",
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#6B4EFF",
                    }}>
                      📏 {m.distance.toFixed(1)} km away
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
