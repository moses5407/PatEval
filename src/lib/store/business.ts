import { create } from 'zustand';

export interface Business {
  id: string;
  name: string;
  locations: Location[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  businessId: string;
}

interface BusinessState {
  businesses: Business[];
  selectedBusiness: Business | null;
  selectedLocation: Location | null;
  setBusinesses: (businesses: Business[]) => void;
  setSelectedBusiness: (business: Business | null) => void;
  setSelectedLocation: (location: Location | null) => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  businesses: [],
  selectedBusiness: null,
  selectedLocation: null,
  setBusinesses: (businesses) => set({ businesses }),
  setSelectedBusiness: (business) => set({ selectedBusiness: business, selectedLocation: null }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
}));