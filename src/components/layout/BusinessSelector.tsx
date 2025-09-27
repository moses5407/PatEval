import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { useBusinessStore } from '../../lib/store/business';

export function BusinessSelector() {
  const {
    businesses,
    selectedBusiness,
    selectedLocation,
    setSelectedBusiness,
    setSelectedLocation
  } = useBusinessStore();

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <select
          value={selectedBusiness?.id || ''}
          onChange={(e) => {
            const business = businesses.find(b => b.id === e.target.value);
            setSelectedBusiness(business || null);
          }}
          className="appearance-none rounded-md border border-gray-300 bg-white pl-8 pr-8 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select Business</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
        <Building2 className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>

      {selectedBusiness && (
        <div className="relative">
          <select
            value={selectedLocation?.id || ''}
            onChange={(e) => {
              const location = selectedBusiness.locations.find(l => l.id === e.target.value);
              setSelectedLocation(location || null);
            }}
            className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select Location</option>
            {selectedBusiness.locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
      )}
    </div>
  );
}