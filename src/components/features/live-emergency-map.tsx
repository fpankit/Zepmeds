
"use client";

import { useEffect, useRef, useState } from 'react';
import L, { LatLngExpression, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issues with webpack
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

const ambulanceIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-white bg-red-500 rounded-full p-1"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

interface LiveEmergencyMapProps {
  userPosition: { lat: number; lng: number };
}

export function LiveEmergencyMap({ userPosition }: LiveEmergencyMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);
    
    // The ambulance starts from a fixed offset for a predictable simulation
    const ambulanceStartPosition = { lat: userPosition.lat + 0.05, lng: userPosition.lng + 0.05 };

    useEffect(() => {
        let map: LeafletMap | null = null;
        // Initialize map only if the container is available and map is not already initialized
        if (mapContainerRef.current && !mapInstanceRef.current) {
            map = L.map(mapContainerRef.current).setView([userPosition.lat, userPosition.lng], 13);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Add markers
            L.marker([userPosition.lat, userPosition.lng])
                .bindPopup("Your Location")
                .addTo(map);
            
            L.marker([ambulanceStartPosition.lat, ambulanceStartPosition.lng], { icon: ambulanceIcon })
                .bindPopup("Ambulance")
                .addTo(map);
            
            // Draw path
            const latlngs = [
                [ambulanceStartPosition.lat, ambulanceStartPosition.lng],
                [userPosition.lat, userPosition.lng]
            ];
            L.polyline(latlngs as LatLngExpression[], { color: 'red', dashArray: '5, 10' }).addTo(map);

            // Adjust map view to fit both points
            map.fitBounds(L.latLngBounds(latlngs as LatLngExpression[]).pad(0.1));
        }

        // Cleanup function to run when the component unmounts
        return () => {
            if (map) {
                map.remove();
            }
            mapInstanceRef.current = null;
        };
    // Dependencies are set to ensure this effect runs only when positions change, not on every render.
    }, [userPosition, ambulanceStartPosition]);

    return (
        <div ref={mapContainerRef} className="h-64 w-full rounded-md" />
    );
}
