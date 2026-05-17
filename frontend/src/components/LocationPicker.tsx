"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, Navigation } from "lucide-react";

// Fix Leaflet default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ onLocationSelect, initialLat = 30.4278, initialLng = -9.5981 }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add zoom control to bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Click handler
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Place/move marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
      }

      // Reverse geocode
      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
        );
        const data = await res.json();
        const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setSelectedAddress(address);
        onLocationSelect(lat, lng, address);

        markerRef.current?.bindPopup(
          `<div style="font-family:sans-serif;direction:rtl;text-align:right;font-size:12px;font-weight:bold;max-width:220px">${address}</div>`
        ).openPopup();
      } catch {
        const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setSelectedAddress(fallback);
        onLocationSelect(lat, lng, fallback);
      } finally {
        setGeocoding(false);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.setView([latitude, longitude], 16);
        // Simulate click
        mapInstanceRef.current?.fireEvent("click", {
          latlng: L.latLng(latitude, longitude),
        } as any);
      },
      () => {
        alert("تعذر تحديد موقعك الحالي");
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground">
          📍 حدد موقع محلك على الخريطة
        </label>
        <button
          type="button"
          onClick={handleLocateMe}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/70 transition-colors"
        >
          <Navigation size={14} />
          موقعي الحالي
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden border-2 border-border shadow-lg" style={{ height: 280 }}>
        <div ref={mapRef} className="w-full h-full z-0" />
        
        {/* Geocoding overlay */}
        {geocoding && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-lg">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-xs font-bold text-primary">جاري تحديد العنوان...</span>
            </div>
          </div>
        )}

        {/* Instruction overlay if no marker */}
        {!selectedAddress && !geocoding && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg text-center">
              <p className="text-xs font-bold text-primary/60 flex items-center justify-center gap-2">
                <MapPin size={14} className="text-primary" />
                اضغط على الخريطة لتحديد موقع محلك
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected address preview */}
      {selectedAddress && (
        <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
          <MapPin size={16} className="text-green-600 mt-0.5 shrink-0" />
          <p className="text-xs font-bold text-green-700 leading-relaxed">{selectedAddress}</p>
        </div>
      )}
    </div>
  );
}
