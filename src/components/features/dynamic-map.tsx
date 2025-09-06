
"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Map } from 'leaflet';

// Fix for default icon issues with webpack
// This is a common workaround for Next.js/Webpack projects with Leaflet
const defaultIcon = new L.Icon({
    iconUrl: '/marker-icon.png',
    iconRetinaUrl: '/marker-icon-2x.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;


type DynamicMapProps = {
    position: {
        lat: number;
        lng: number;
    };
    zoom?: number;
    popupText?: string;
}

export function DynamicMap({ position, zoom = 15, popupText = "Your Location" }: DynamicMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);

    useEffect(() => {
        // Ensure this only runs on the client
        if (typeof window === 'undefined') return;

        // Initialize map only if the container exists and map is not already initialized
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([position.lat, position.lng], zoom);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            L.marker([position.lat, position.lng]).addTo(map)
                .bindPopup(popupText)
                .openPopup();
        }

        // Cleanup function to destroy the map instance when the component unmounts
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [position, zoom, popupText]); // Rerun effect if these props change, though the re-init logic is handled inside

    return (
        <div 
            ref={mapContainerRef} 
            style={{ height: '200px', width: '100%', borderRadius: '0.5rem' }} 
        />
    );
}
