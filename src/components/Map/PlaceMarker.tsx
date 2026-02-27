import React from 'react';
import { Marker as ReactMarker } from 'react-leaflet';
import L from 'leaflet';
import { Place } from '../../types/places';

interface PlaceMarkerProps {
  place: Place;
  selected: boolean;
  onClick: (place: Place) => void;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ place, selected, onClick }) => {
  const { latitude, longitude } = place.extras.place;

  const iconHtml = `
    <div class="flex items-center justify-center w-8 h-8 rounded-full ${selected ? 'bg-purple-600' : 'bg-purple-400'} border-2 border-white shadow-md">
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    </div>
  `;

  const icon = L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  return (
    <ReactMarker
      position={[latitude, longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onClick(place),
      }}
    />
  );
};

export default PlaceMarker;
