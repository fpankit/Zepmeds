
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

const SIMULATION_STEPS = 200;
const SIMULATION_INTERVAL = 1000; // ms

export function LiveEmergencyMap({ userPosition }: LiveEmergencyMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);
    const ambulanceMarkerRef = useRef<L.Marker | null>(null);

    const [ambulancePosition, setAmbulancePosition] = useState(() => {
        // Start ambulance from a random point nearby
        return { lat: userPosition.lat + 0.05, lng: userPosition.lng + 0.05 };
    });
    const [step, setStep] = useState(0);

    // TODO: The current ambulance simulation uses setInterval which causes performance issues
    // and a SES_UNCAUGHT_EXCEPTION error on resize. This has been temporarily disabled.
    // A better approach would be to use CSS animations or a more performant library for this.
    // // Simulate ambulance movement
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setStep(prevStep => {
    //             const nextStep = prevStep + 1;
    //             if (nextStep > SIMULATION_STEPS) {
    //                 clearInterval(interval);
    //                 return prevStep;
    //             }

    //             const latDiff = (userPosition.lat - ambulancePosition.lat) / SIMULATION_STEPS;
    //             const lngDiff = (userPosition.lng - ambulancePosition.lng) / SIMULATION_STEPS;
                
    //             if (ambulanceMarkerRef.current) {
    //                 const newPos = {
    //                     lat: ambulancePosition.lat + latDiff * nextStep,
    //                     lng: ambulancePosition.lng + lngDiff * nextStep
    //                 };
    //                 ambulanceMarkerRef.current.setLatLng(newPos);
    //             }
                
    //             return nextStep;
    //         });
    //     }, SIMULATION_INTERVAL);

    //     return () => clearInterval(interval);
    // }, [userPosition, ambulancePosition]);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([userPosition.lat, userPosition.lng], 13);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // User Marker
            L.marker([userPosition.lat, userPosition.lng])
                .bindPopup("Your Location")
                .addTo(map);
            
            // Ambulance Marker
            ambulanceMarkerRef.current = L.marker([ambulancePosition.lat, ambulancePosition.lng], { icon: ambulanceIcon })
                .bindPopup("Ambulance")
                .addTo(map);
            
             // Draw path
             const latlngs = [
                [ambulancePosition.lat, ambulancePosition.lng],
                [userPosition.lat, userPosition.lng]
            ];
            L.polyline(latlngs as LatLngExpression[], { color: 'red', dashArray: '5, 10' }).addTo(map);

            map.fitBounds(L.latLngBounds(latlngs as LatLngExpression[]).pad(0.1));
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [userPosition, ambulancePosition]);

    return (
        <div ref={mapContainerRef} className="h-64 w-full rounded-md" />
    );
}
