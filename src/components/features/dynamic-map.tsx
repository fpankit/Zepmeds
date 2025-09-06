
"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issues with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

type DynamicMapProps = {
    position: {
        lat: number;
        lng: number;
    };
    zoom?: number;
    popupText?: string;
}

export function DynamicMap({ position, zoom = 15, popupText = "Your Location" }: DynamicMapProps) {
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <MapContainer center={[position.lat, position.lng]} zoom={zoom} scrollWheelZoom={false} style={{ height: '200px', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.lat, position.lng]}>
                <Popup>
                    {popupText}
                </Popup>
            </Marker>
        </MapContainer>
    );
}
