const noop = () => undefined;

const mockLeaflet = {
  Icon: { Default: { mergeOptions: noop } },
  icon: () => ({}),
  divIcon: () => ({}),
  latLng: (...args: unknown[]) => ({ args }),
  latLngBounds: (...args: unknown[]) => ({ args }),
  map: noop,
};

export const Icon = mockLeaflet.Icon;
export const icon = mockLeaflet.icon;
export const divIcon = mockLeaflet.divIcon;
export const latLng = mockLeaflet.latLng;
export const latLngBounds = mockLeaflet.latLngBounds;
export const map = mockLeaflet.map;

export default mockLeaflet;

