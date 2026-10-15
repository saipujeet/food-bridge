import React from 'react';

interface LocationPopupProps {
  title: string;
  type: 'DONOR' | 'VOLUNTEER' | 'NGO';
  subtitle?: string;
  address?: string;
  foodInfo?: string;
  statusInfo?: string;
  lastUpdated?: string;
  isLive?: boolean;
}

export const createLocationPopupHtml = ({
  title,
  type,
  subtitle,
  address,
  foodInfo,
  statusInfo,
  lastUpdated,
  isLive = true,
}: LocationPopupProps): string => {
  let titleColor = '#059669';
  let badgeBg = '#dcfce7';
  let badgeText = '#166534';
  let icon = '📦';

  if (type === 'NGO') {
    titleColor = '#2563eb';
    badgeBg = '#dbeafe';
    badgeText = '#1e40af';
    icon = '🏛️';
  } else if (type === 'VOLUNTEER') {
    titleColor = '#d97706';
    badgeBg = isLive ? '#fef3c7' : '#f1f5f9';
    badgeText = isLive ? '#92400e' : '#475569';
    icon = '🛵';
  }

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px; min-width: 180px; max-width: 240px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
        <strong style="color: ${titleColor}; font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 4px;">
          <span>${icon}</span> ${title}
        </strong>
      </div>
      
      ${subtitle ? `<p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #1e293b;">${subtitle}</p>` : ''}
      
      ${address ? `<p style="margin: 0 0 4px 0; font-size: 11px; color: #475569; line-height: 1.3;">📍 ${address}</p>` : ''}
      
      ${foodInfo ? `<div style="margin-top: 4px; padding: 4px 8px; background: #ecfdf5; border-radius: 6px; border: 1px solid #a7f3d0; font-size: 11px; color: #047857; font-weight: 700;">🍱 Food: ${foodInfo}</div>` : ''}
      
      ${type === 'VOLUNTEER' ? `
        <div style="margin-top: 6px; display: flex; items-center; justify-content: space-between; gap: 4px;">
          <span style="font-size: 10px; font-weight: 800; background: ${badgeBg}; color: ${badgeText}; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
            ${isLive ? '🟢 Live Location' : '📍 Last Known Location'}
          </span>
          ${statusInfo ? `<span style="font-size: 10px; font-weight: 700; color: #475569;">${statusInfo}</span>` : ''}
        </div>
        ${lastUpdated ? `<p style="margin: 4px 0 0 0; font-size: 9px; color: #94a3b8; font-family: monospace;">Updated: ${lastUpdated}</p>` : ''}
      ` : ''}
    </div>
  `;
};

export const LocationPopup: React.FC<LocationPopupProps> = (props) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: createLocationPopupHtml(props) }} />
  );
};
