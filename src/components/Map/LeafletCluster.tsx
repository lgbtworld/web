import {
  createElementObject,
  createPathComponent,
  extendContext,
  LeafletContextInterface,
} from '@react-leaflet/core';
import Leaflet, { LeafletMouseEventHandlerFn } from 'leaflet';

import 'leaflet.markercluster';

import { LucideProps } from 'lucide-react';
import React, { FunctionComponent } from 'react';



import MarkerIconWrapper from './LeafletMarker/MarkerIconWrapper';
import LeafletDivIcon from './LeafletDivIcon';
import { AppConfig } from './lib/AppConfig';

type ClusterEvents = {
  onClick?: LeafletMouseEventHandlerFn;
  onDblClick?: LeafletMouseEventHandlerFn;
  onMouseDown?: LeafletMouseEventHandlerFn;
  onMouseUp?: LeafletMouseEventHandlerFn;
  onMouseOver?: LeafletMouseEventHandlerFn;
  onMouseOut?: LeafletMouseEventHandlerFn;
  onContextMenu?: LeafletMouseEventHandlerFn;
};

type MarkerClusterControl = Leaflet.MarkerClusterGroupOptions & {
  children: React.ReactNode;
  icon: FunctionComponent<LucideProps>;
  color: string;
} & ClusterEvents;

const CreateMarkerClusterGroup = (
  props: MarkerClusterControl,
  context: LeafletContextInterface
) => {
  const markerClusterGroup = new Leaflet.MarkerClusterGroup({
    removeOutsideVisibleBounds: true,
    spiderfyOnMaxZoom: true,
    spiderLegPolylineOptions: {
      className: 'hidden',
    },
    showCoverageOnHover: false,
    spiderfyOnEveryZoom: false,
    zoomToBoundsOnClick: true,
    unspiderfyOnMapClick: false, // Boş yere tıklayınca grup kapanmasın
    spiderfyDistanceMultiplier: 10,
    iconCreateFunction: (cluster: any) => {
      const customIcon = LeafletDivIcon({
        source: (
          <MarkerIconWrapper
            key={`markerIconWrapper${cluster.getChildCount()}`}
            color={props.color}
            item={{
              group: true,
              index: BigInt(cluster.getChildCount()),
            }}
            label={`${cluster.getChildCount()}`}
          />
        ),
        anchor: [
          AppConfig.ui.markerIconSize / 2,
          AppConfig.ui.markerIconSize / 2,
        ],
      });

      return (
        customIcon ??
        Leaflet.divIcon({
          html: `${cluster.getChildCount()}`,
          iconAnchor: [
            AppConfig.ui.markerIconSize / 2,
            AppConfig.ui.markerIconSize / 2,
          ],
        })
      );
    },
    ...props,
  } as any);

  return createElementObject(
    markerClusterGroup,
    extendContext(context, { layerContainer: markerClusterGroup })
  );
};

const LeafletClusterComponent =
  createPathComponent<Leaflet.MarkerClusterGroup, MarkerClusterControl>(
    CreateMarkerClusterGroup
  );

export const LeafletCluster: React.FC<MarkerClusterControl> = (props) => (
  <LeafletClusterComponent {...props} />
);
