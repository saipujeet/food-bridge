import React from 'react';
import type { DeliveryMapData } from '../../types';
import { MapView } from './MapView';
import { LocationSummary } from './LocationSummary';
import { MapLoading } from './MapLoading';
import { MapError } from './MapError';
import { MapEmptyState } from './MapEmptyState';

export interface DeliveryMapProps {
  mapData?: DeliveryMapData | null;
  isLoading?: boolean;
  error?: string | null;
  height?: string;
  showRadiusOverlay?: boolean;
  showSummaryCard?: boolean;
  onRetry?: () => void;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  mapData,
  isLoading = false,
  error = null,
  height = '460px',
  showRadiusOverlay = true,
  showSummaryCard = true,
  onRetry,
}) => {
  if (isLoading) {
    return <MapLoading height={height} />;
  }

  if (error) {
    return <MapError mapData={mapData || undefined} errorMsg={error} onRetry={onRetry} />;
  }

  if (!mapData) {
    return <MapEmptyState height={height} />;
  }

  return (
    <div className="space-y-6">
      <MapView
        mapData={mapData}
        height={height}
        showRadiusOverlay={showRadiusOverlay}
        showLegend={true}
      />
      {showSummaryCard && <LocationSummary mapData={mapData} />}
    </div>
  );
};
