import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DeliveryMapData, MapMarkerData } from '../../types';
import { LocationSummary } from './LocationSummary';
import { RadiusOverlay } from './RadiusOverlay';
import { MapLegend } from './MapLegend';
import { createDonorMarker, createDonorDivIcon } from './DonorMarker';
import { createNGOMarker, createNGODivIcon } from './NGOMarker';
import { createVolunteerMarker, createVolunteerDivIcon } from './VolunteerMarker';
import { createRoutePolylines } from './RouteLine';
import { Layers, Maximize2 } from 'lucide-react';

interface MapViewProps {
  mapData?: DeliveryMapData;
  height?: string;
  markers?: MapMarkerData[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  interactive?: boolean;
  showRadiusOverlay?: boolean;
  showLegend?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  mapData,
  height = '420px',
  markers = [],
  centerLat,
  centerLng,
  zoom = 13,
  interactive = true,
  showRadiusOverlay = false,
  showLegend = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapError, setMapError] = useState<boolean>(false);
  const [tileType, setTileType] = useState<'STANDARD' | 'TERRAIN'>('STANDARD');

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Focus map specifically on Andhra Pradesh & Telangana region
      const apTelanganaDefaultLat = centerLat || mapData?.pickup.latitude || 15.505;
      const apTelanganaDefaultLng = centerLng || mapData?.pickup.longitude || 80.049;

      const apTelanganaBounds: L.LatLngBoundsExpression = [
        [12.5, 76.5], // South-West (Chittoor / Anantapur)
        [19.9, 85.0], // North-East (Adilabad / Srikakulam)
      ];

      const map = L.map(mapContainerRef.current, {
        center: [apTelanganaDefaultLat, apTelanganaDefaultLng],
        zoom,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: apTelanganaBounds,
        maxBoundsViscosity: 0.8,
        zoomControl: false,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
      });

      // Ultra-fast CDN tile layer setup to fix map loading latency in volunteer vehicles
      const tileUrl =
        tileType === 'STANDARD'
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      });

      tileLayer.on('tileerror', () => {
        console.warn('[MapView] Tile loading fallback triggered.');
      });

      tileLayer.addTo(map);

      // Force Leaflet container resize calculation for instant tile load in volunteer vehicle view
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      L.control.zoom({ position: 'topright' }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setMapError(false);
    } catch (err) {
      console.warn('[MapView] Leaflet map initialization warning:', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tileType, interactive]);

  // Update Markers & Polylines when mapData or markers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layersGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    // Mode A: Render from DeliveryMapData
    if (mapData) {
      // 1. DONOR PICKUP MARKER (📦) — Fixed at original donor pickup location
      if (mapData.pickup) {
        const pLatLon: L.LatLngExpression = [mapData.pickup.latitude, mapData.pickup.longitude];
        bounds.push(pLatLon);

        const donorMarker = createDonorMarker({
          latitude: mapData.pickup.latitude,
          longitude: mapData.pickup.longitude,
          donorName: mapData.donorName,
          pickupAddress: mapData.pickup.address,
          foodName: mapData.foodName,
          quantity: mapData.quantity,
          unit: mapData.unit,
        });
        donorMarker.addTo(layers);
      }

      // 2. NGO DESTINATION MARKER (🏛️) — Fixed at original NGO destination location
      if (mapData.destination) {
        const dLatLon: L.LatLngExpression = [mapData.destination.latitude, mapData.destination.longitude];
        bounds.push(dLatLon);

        const ngoMarker = createNGOMarker({
          latitude: mapData.destination.latitude,
          longitude: mapData.destination.longitude,
          ngoName: mapData.ngoName,
          destinationAddress: mapData.destination.address,
        });
        ngoMarker.addTo(layers);
      }

      // 3. VOLUNTEER SCOOTER MARKER (🛵) — Dynamically positioned based on exact action state:
      if (mapData.volunteer && mapData.status !== 'PENDING_ASSIGNMENT') {
        const isDelivered = mapData.status === 'DELIVERED';
        const isInTransit = mapData.status === 'IN_TRANSIT' || mapData.status === 'PICKED_UP';
        const isPickupPending = mapData.status === 'PICKUP_PENDING' || mapData.status === 'ACCEPTED';

        let volLat = mapData.volunteer.latitude;
        let volLng = mapData.volunteer.longitude;
        let statusText = 'IN TRANSIT TO NGO';
        let popupSubtitle = 'Scooter En Route to NGO Destination 🛵';

        if (isDelivered) {
          // Action: MARKED AS DELIVERED -> Volunteer icon 🛵 moves to NGO Destination Office!
          volLat = mapData.destination.latitude;
          volLng = mapData.destination.longitude;
          statusText = 'ARRIVED AT NGO DESTINATION';
          popupSubtitle = 'Delivered — Parked at NGO Office Destination 🎉';
        } else if (isInTransit) {
          // Action: MARKED AS PICKED UP -> Volunteer icon 🛵 moves en route towards NGO Office!
          statusText = 'FOOD PICKED UP — EN ROUTE TO NGO';
          popupSubtitle = 'Food Picked Up from Donor — En Route to NGO 🛵';
        } else if (isPickupPending) {
          // Action: MARKED AS ACCEPTED -> Volunteer icon 🛵 is at Donor Pickup Kitchen!
          volLat = mapData.pickup.latitude;
          volLng = mapData.pickup.longitude;
          statusText = 'AT DONOR PICKUP LOCATION';
          popupSubtitle = 'Assigned Volunteer — At Donor Pickup Kitchen 📦';
        }

        const vLatLon: L.LatLngExpression = [volLat, volLng];
        bounds.push(vLatLon);

        const volunteerMarker = createVolunteerMarker({
          latitude: volLat,
          longitude: volLng,
          volunteerName: mapData.volunteerName || 'Assigned Volunteer',
          subtitle: popupSubtitle,
          statusInfo: statusText,
          lastUpdated: mapData.volunteer.updatedAt
            ? new Date(mapData.volunteer.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
          isLive: !isDelivered,
        });
        volunteerMarker.addTo(layers);
      }

      // 4. Red Polyline Route Paths based on Delivery Status
      const routePolylines = createRoutePolylines({
        status: mapData.status,
        pickup: mapData.pickup,
        destination: mapData.destination,
        volunteer: mapData.volunteer,
      });

      routePolylines.forEach((poly) => poly.addTo(layers));

      // 5. Circle overlay for matching radius if specified
      if (mapData.matchingRadiusKm && mapData.pickup) {
        L.circle([mapData.pickup.latitude, mapData.pickup.longitude], {
          radius: mapData.matchingRadiusKm * 1000,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(layers);
      }
    }

    // Mode B: Arbitrary Markers array passed directly
    if (markers && markers.length > 0) {
      markers.forEach((m) => {
        const pos: L.LatLngExpression = [m.latitude, m.longitude];
        bounds.push(pos);

        let marker: L.Marker;
        if (m.type === 'PICKUP') {
          marker = L.marker(pos, { icon: createDonorDivIcon() });
        } else if (m.type === 'NGO') {
          marker = L.marker(pos, { icon: createNGODivIcon() });
        } else {
          marker = L.marker(pos, { icon: createVolunteerDivIcon(true) });
        }

        if (m.popupText || m.title) {
          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px;">
              <strong style="font-size: 13px;">${m.title}</strong>
              ${m.subtitle ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">${m.subtitle}</p>` : ''}
              ${m.address ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #334155;">${m.address}</p>` : ''}
            </div>
          `);
        }
        marker.addTo(layers);
      });
    }

    // Fit map bounds smoothly
    if (bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], zoom);
      } else {
        map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [mapData, markers, zoom]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (mapData?.pickup) {
      map.setView([mapData.pickup.latitude, mapData.pickup.longitude], zoom);
    } else if (centerLat && centerLng) {
      map.setView([centerLat, centerLng], zoom);
    }
  };

  if (mapError && mapData) {
    return <LocationSummary mapData={mapData} isMapUnavailable={true} />;
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs group">
      {/* Map Element Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full bg-slate-100 z-10" />

      {/* Floating Map Controls overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-2">
        <button
          onClick={() => setTileType((prev) => (prev === 'STANDARD' ? 'TERRAIN' : 'STANDARD'))}
          className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-extrabold border border-slate-200 shadow-xs hover:bg-white transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>{tileType === 'STANDARD' ? 'Standard Map' : 'Terrain Map'}</span>
        </button>

        <button
          onClick={handleRecenter}
          className="p-2 rounded-xl bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200 shadow-xs hover:bg-white transition-all cursor-pointer"
          title="Recenter Map"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      {showLegend && (
        <div className="absolute bottom-3 right-3 z-20 hidden sm:block">
          <MapLegend />
        </div>
      )}

      {/* Optional Matching Radius Overlay */}
      {showRadiusOverlay && mapData?.matchingRadiusKm && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 sm:max-w-md">
          <RadiusOverlay currentRadiusKm={mapData.matchingRadiusKm} />
        </div>
      )}
    </div>
  );
};
