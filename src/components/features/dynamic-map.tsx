
"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Map } from 'leaflet';

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
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([position.lat, position.lng], zoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);
        }

        // Cleanup function to destroy the map instance when component unmounts
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount

     useEffect(() => {
        if (mapInstanceRef.current) {
            // Remove old marker if it exists
            if (markerRef.current) {
                markerRef.current.remove();
            }

            // Add new marker
            markerRef.current = L.marker([position.lat, position.lng]).addTo(mapInstanceRef.current)
                .bindPopup(popupText)
                .openPopup();
            
            // Pan to the new position
            mapInstanceRef.current.setView([position.lat, position.lng], zoom);
        }
    }, [position, zoom, popupText]);

    return (
        <div 
            ref={mapContainerRef} 
            style={{ height: '200px', width: '100%', borderRadius: '0.5rem' }} 
        />
    );
}
