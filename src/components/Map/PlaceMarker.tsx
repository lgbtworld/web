import React from 'react';
import { Marker as ReactMarker } from 'react-leaflet';
import L from 'leaflet';
import { Place } from '../../types/places';
import { generatePlaceImage } from '../../helpers/helpers';

interface PlaceMarkerProps {
  place: Place;
  selected: boolean;
  onClick: (place: Place) => void;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ place, selected, onClick }) => {
  const { latitude, longitude, image, name } = place.extras.place;
  const imageUrl = image || generatePlaceImage(place.public_id);

  const iconHtml = `
    <div class="relative group">
      <!-- Outer Glow/Pulse for selected state -->
      ${selected ? '<div class="absolute -inset-2 bg-purple-500 rounded-full animate-ping opacity-20"></div>' : ''}
      
      <!-- Pin Container -->
      <div class="relative flex flex-col items-center transition-all duration-300 ${selected ? 'scale-125 -translate-y-4' : 'hover:scale-110 hover:-translate-y-2'}">
        
        <!-- Main Circular Image Holder -->
        <div class="relative w-12 h-12 rounded-full border-[3px] border-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] overflow-hidden bg-white z-20">
          <img src="${imageUrl}" class="w-full h-full object-cover" alt="${name}" onerror="this.src='${generatePlaceImage(place.public_id)}'" />
          ${selected ? '<div class="absolute inset-0 border-2 border-purple-500/50 rounded-full"></div>' : ''}
        </div>
        
        <!-- Improved Pin Tail (SVG Triangle for precision) -->
        <div class="relative -mt-1 z-10">
          <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_4px_4px_rgba(0,0,0,0.1)]">
            <path d="M10 15L0 0H20L10 15Z" fill="white"/>
          </svg>
        </div>
        
        <!-- Ground Shadow (Contact Point) -->
        <div class="absolute -bottom-1 w-3 h-1.5 bg-black/30 rounded-[100%] blur-[2px] transform scale-x-150"></div>
      </div>
      
      <!-- Premium Tooltip -->
      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1.5 bg-gray-900/95 backdrop-blur-md text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 ${selected ? 'opacity-100 translate-y-0' : 'translate-y-1'}">
        ${name}
      </div>
    </div>
  `;

  const icon = L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: [48, 64],
    iconAnchor: [24, 60],
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
