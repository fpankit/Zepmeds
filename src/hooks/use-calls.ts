
'use client';

import { useState } from 'react';

// This file would typically fetch data from a backend, but we'll use static data for this example.

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

const allDoctors: Doctor[] = [
  { id: 'doc-ai-1', name: 'Dr. Anya Sharma', specialty: 'Cardiologist', image: 'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fdoctors%2Fdoc-ai-1.png?alt=media' },
  { id: 'doc-ai-2', name: 'Dr. Vikram Singh', specialty: 'Neurologist', image: 'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fdoctors%2Fdoc-ai-2.png?alt=media' },
  { id: 'doc-ai-3', name: 'Dr. Priya Mehta', specialty: 'Dermatologist', image: 'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fdoctors%2Fdoc-ai-3.png?alt=media' },
];

export function useCalls() {
  const [doctors] = useState<Doctor[]>(allDoctors);
  
  return {
    doctors,
  };
}
