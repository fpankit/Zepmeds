
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
  { id: 'doc-ai-1', name: 'Dr. Anya Sharma', specialty: 'Cardiologist', image: 'https://picsum.photos/seed/doc1/200' },
  { id: 'doc-ai-2', name: 'Dr. Vikram Singh', specialty: 'Neurologist', image: 'https://picsum.photos/seed/doc2/200' },
  { id: 'doc-ai-3', name: 'Dr. Priya Mehta', specialty: 'Dermatologist', image: 'https://picsum.photos/seed/doc3/200' },
];

export function useCalls() {
  const [doctors] = useState<Doctor[]>(allDoctors);
  
  return {
    doctors,
  };
}
