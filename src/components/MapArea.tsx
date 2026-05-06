"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RedIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapAreaProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  items?: any[];
  center?: [number, number];
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
}

export default function MapArea({ 
  onLocationSelect, 
  items = [], 
  center, 
  initialCenter,
  zoom = 13 
}: MapAreaProps) {
  // Use initialCenter if provided, otherwise fallback to center or Agadir default
  const mapCenter: [number, number] = initialCenter 
    ? [initialCenter.lat, initialCenter.lng] 
    : (center || [30.4278, -9.5981]);
    
  const [position, setPosition] = useState<[number, number] | null>(null);


  function LocationDetector() {
    const map = useMapEvents({
      click(e) {
        if (onLocationSelect) {
          setPosition([e.latlng.lat, e.latlng.lng]);
          onLocationSelect(e.latlng.lat, e.latlng.lng);
          map.flyTo(e.latlng, map.getZoom());
        }
      },
    });

    useEffect(() => {
      if (!onLocationSelect) return; // Only locate if we are in pick mode
      map.locate().on("locationfound", function (e) {
        map.flyTo(e.latlng, 14);
      });
    }, [map]);

    return position === null ? null : (
      <Marker position={position} icon={RedIcon}>
        <Popup>Selected Location</Popup>
      </Marker>
    );
  }

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-inner bg-secondary/20">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; Google'
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        />
        
        <ZoomControl position="bottomright" />
        <LocationDetector />

        {items.map((item, idx) => (
          item.locationCoords && (
            <Marker key={idx} position={[item.locationCoords.lat, item.locationCoords.lng]} icon={item.type === 'lost' ? RedIcon : DefaultIcon}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {onLocationSelect && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          اضغط على الخريطة لتحديد الموقع
        </div>
      )}
    </div>
  );
}
