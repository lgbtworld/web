import React from 'react';

const Empty = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export const MapContainer = Empty;
export const TileLayer = Empty;
export const Marker = Empty;
export const Popup = Empty;
export const Circle = Empty;
export const CircleMarker = Empty;
export const Polygon = Empty;
export const Polyline = Empty;
export const Rectangle = Empty;
export const Tooltip = Empty;
export const LayersControl = Empty;
export const LayerGroup = Empty;
export const FeatureGroup = Empty;

export const useMap = () => ({});
export const useMapEvent = () => ({});
export const useMapEvents = () => ({});

export default {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
};

