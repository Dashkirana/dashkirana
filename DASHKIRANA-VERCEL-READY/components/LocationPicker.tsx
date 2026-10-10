
'use client';

import { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type SelectedLocation = {
  lat: number;
  lng: number;
};

type LocationPickerProps = {
  initialLocation?: SelectedLocation;
  onLocationChange: (location: SelectedLocation) => void;
};

const defaultLocation: SelectedLocation = {
  lat: 17.7345,
  lng: 83.3012,
};

const markerIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (location: SelectedLocation) => void;
}) {
  useMapEvents({
    click(event) {
      onLocationChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function LocationPicker({
  initialLocation = defaultLocation,
  onLocationChange,
}: LocationPickerProps) {
  const [selected, setSelected] =
    useState<SelectedLocation>(initialLocation);

  function selectLocation(location: SelectedLocation) {
    setSelected(location);
    onLocationChange(location);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Tap the map to select your delivery location.
      </p>

      <div className="h-80 w-full overflow-hidden rounded-xl border">
        <MapContainer
          center={[selected.lat, selected.lng]}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onLocationChange={selectLocation} />

          <Marker
            position={[selected.lat, selected.lng]}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const point = event.target.getLatLng();
                selectLocation({ lat: point.lat, lng: point.lng });
              },
            }}
          />
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500">
        Selected coordinates: {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
      </p>
    </div>
  );
}
