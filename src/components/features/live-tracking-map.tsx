
"use client";

import { useEffect, useRef, useState } from 'react';
import L, { LatLngExpression, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Rider Icon (Motorcycle)
const riderIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-white"><path d="M19 14.06V19h-2v-4.94l-2.12-2.12-3.51.5-1.87-3.75 3.51-.5L15 6h4v2h-2.47l-1.04 1.04 2.12 2.12L19 14.06M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// User Icon (Home)
const userIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" /></svg>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Helper function to calculate distance in Kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2); // Returns distance in km, rounded to 2 decimal places
}

interface LiveTrackingMapProps {
  riderLocation: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
}

export function LiveTrackingMap({ riderLocation, userLocation }: LiveTrackingMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);

    const distance = calculateDistance(
        riderLocation.lat, riderLocation.lng,
        userLocation.lat, userLocation.lng
    );

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current, {
                zoomControl: false, // Disables the + and - buttons
            }).setView([userLocation.lat, userLocation.lng], 13);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapInstanceRef.current);

            // Add markers
            L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                .addTo(mapInstanceRef.current);
            
            L.marker([riderLocation.lat, riderLocation.lng], { icon: riderIcon })
                .addTo(mapInstanceRef.current);
            
            // Draw path
            const latlngs = [
                [riderLocation.lat, riderLocation.lng],
                [userLocation.lat, userLocation.lng]
            ];
            L.polyline(latlngs as LatLngExpression[], { color: '#FBBF24', dashArray: '5, 10' }).addTo(mapInstanceRef.current);

            // Adjust map view to fit both points
            mapInstanceRef.current.fitBounds(L.latLngBounds(latlngs as LatLngExpression[]).pad(0.2));
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [userLocation, riderLocation]);

    return (
        <div className="relative">
            <div ref={mapContainerRef} className="h-48 w-full rounded-md" />
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold p-2 rounded-md backdrop-blur-sm">
                {distance} km away
            </div>
        </div>
    );
}
