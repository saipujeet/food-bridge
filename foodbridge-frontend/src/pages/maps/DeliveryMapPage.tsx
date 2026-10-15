import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { mapService } from '../../services/mapService';
import { volunteerService } from '../../services/volunteerService';
import type { DeliveryMapData } from '../../types';
import { MapView } from '../../components/maps/MapView';
import { LocationSummary } from '../../components/maps/LocationSummary';
import {
  Navigation,
  RefreshCw,
  ArrowLeft,
  ShieldAlert,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const DeliveryMapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [mapData, setMapData] = useState<DeliveryMapData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Live Location Update modal for Volunteers
  const [isUpdatingLocation, setIsUpdatingLocation] = useState<boolean>(false);
  const [newLat, setNewLat] = useState<number>(15.505);
  const [newLng, setNewLng] = useState<number>(80.049);

  const fetchMapData = async () => {
    if (!id || !user) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await mapService.getDeliveryMapData(id, user.id, user.role);
      setMapData(data);
      if (data.volunteer) {
        setNewLat(data.volunteer.latitude);
        setNewLng(data.volunteer.longitude);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load delivery location map';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [id, user]);

  const handleUpdateVolunteerLocation = async () => {
    if (!user || user.role !== 'VOLUNTEER') return;
    setIsUpdatingLocation(true);

    try {
      await volunteerService.updateLocation(newLat, newLng);
      showToast('Location Updated', 'Your live coordinates have been broadcast to active delivery participants.', 'success');
      await fetchMapData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update location';
      showToast('Error', msg, 'error');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* HEADER BAR */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Navigation className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Delivery Map & Live Tracking</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Task #{id} • Real-time route tracking between Donor pickup and NGO destination
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMapData} className="flex items-center space-x-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Map</span>
          </Button>

          {user?.role === 'VOLUNTEER' && id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/volunteer/deliveries/${id}`)}
              className="flex items-center space-x-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Manage Task Logistics</span>
            </Button>
          )}

          {user?.role === 'VOLUNTEER' && mapData?.status !== 'DELIVERED' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUpdateVolunteerLocation}
              disabled={isUpdatingLocation}
              className="flex items-center space-x-2"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Broadcast Live Position</span>
            </Button>
          )}
        </div>
      </div>

      {/* ERROR ALERT (e.g. 403 Forbidden Access) */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-900">Access Restricted</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Return to Dashboard
          </Button>
        </div>
      )}

      {/* MAIN MAP TRACKING DISPLAY */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 mt-2">Loading Leaflet OpenStreetMap tiles & route data...</p>
        </div>
      ) : mapData ? (
        <div className="space-y-6">
          {/* PRIMARY LEAFLET MAP VIEW */}
          <MapView mapData={mapData} height="460px" showRadiusOverlay={true} />

          {/* VOLUNTEER LIVE LOCATION UPDATE FORM (FOR VOLUNTEER ROLE) */}
          {user?.role === 'VOLUNTEER' && mapData.status !== 'DELIVERED' && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Volunteer Live GPS Control</h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Role: Assigned Volunteer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Update Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLat}
                    onChange={(e) => setNewLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Update Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLng}
                    onChange={(e) => setNewLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUpdateVolunteerLocation}
                    disabled={isUpdatingLocation}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    {isUpdatingLocation ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Update Live Position</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* LOGISTICS BREAKDOWN & DISTANCE SUMMARY */}
          <LocationSummary mapData={mapData} />
        </div>
      ) : null}
    </div>
  );
};
