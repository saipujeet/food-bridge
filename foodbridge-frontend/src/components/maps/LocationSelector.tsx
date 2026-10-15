import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface LocationSelectorProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
  title?: string;
  subtitle?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  initialLatitude = 15.505,
  initialLongitude = 80.049,
  initialAddress = '',
  onLocationSelect,
  title = 'Select Pickup Point on Map',
  subtitle = 'Click on the map or adjust latitude and longitude coordinates below.',
}) => {
  const [lat, setLat] = useState<number>(initialLatitude);
  const [lng, setLng] = useState<number>(initialLongitude);
  const [address, setAddress] = useState<string>(initialAddress);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const apTelanganaBounds: L.LatLngBoundsExpression = [
        [12.5, 76.5], // South-West (Chittoor / Anantapur)
        [19.9, 85.0], // North-East (Adilabad / Srikakulam)
      ];

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 14,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: apTelanganaBounds,
        maxBoundsViscosity: 0.8,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      // Custom Pin Icon
      const customIcon = L.divIcon({
        html: `
          <div class="w-9 h-9 rounded-2xl bg-emerald-600 ring-4 ring-emerald-300 text-white flex items-center justify-center text-lg shadow-lg">
            <span>📍</span>
          </div>
        `,
        className: 'custom-picker-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Handle marker drag event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const newLat = Math.round(position.lat * 1000000) / 1000000;
        const newLng = Math.round(position.lng * 1000000) / 1000000;
        setLat(newLat);
        setLng(newLng);
        onLocationSelect({ latitude: newLat, longitude: newLng, address });
      });

      // Handle map click event
      map.on('click', (e: L.LeafletMouseEvent) => {
        const clickedLat = Math.round(e.latlng.lat * 1000000) / 1000000;
        const clickedLng = Math.round(e.latlng.lng * 1000000) / 1000000;
        setLat(clickedLat);
        setLng(clickedLng);
        marker.setLatLng([clickedLat, clickedLng]);
        onLocationSelect({ latitude: clickedLat, longitude: clickedLng, address });
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('[LocationSelector] Leaflet setup warning:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when lat/lng state changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng]);
    }
    onLocationSelect({ latitude: lat, longitude: lng, address });
  }, [lat, lng, address]);

  const handleConfirmLocation = () => {
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center">
          <MapPin className="w-4 h-4 text-emerald-600 mr-2" />
          {title}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
      </div>

      {/* Interactive Map Picker Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200">
        <div ref={mapContainerRef} style={{ height: '280px' }} className="w-full bg-slate-100" />
        <div className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 shadow-xs border border-slate-200">
          💡 Click anywhere on map or drag pin to select coordinates
        </div>
      </div>

      {/* Lat/Lng & Address Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Latitude Coordinate
          </label>
          <input
            type="number"
            step="0.000001"
            min="-90"
            max="90"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Longitude Coordinate
          </label>
          <input
            type="number"
            step="0.000001"
            min="-180"
            max="180"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          Address Description
        </label>
        <input
          type="text"
          placeholder="e.g. 742 Evergreen Terrace, Sector 4, Metropolis"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
        />
      </div>

      {/* Selected Coordinates Confirmation Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="text-xs">
          <span className="text-slate-500 font-medium">Selected Position: </span>
          <strong className="text-emerald-700 font-mono font-bold">
            ({lat.toFixed(6)}, {lng.toFixed(6)})
          </strong>
        </div>

        <Button variant="primary" size="sm" onClick={handleConfirmLocation} className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Confirm Selected Location</span>
        </Button>
      </div>
    </div>
  );
};
