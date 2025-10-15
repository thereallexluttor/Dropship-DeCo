"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { stores, getUniqueCities, getStoresByCity, type Store } from '../lib/stores'

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('./Map'), { ssr: false })

export default function StoreLocator() {
  const [selectedStore, setSelectedStore] = useState<Store>(stores[0])
  const [selectedCity, setSelectedCity] = useState<string | 'all'>('all')

  // Get unique cities and filtered stores using shared functions
  const cities = getUniqueCities()
  const filteredStores = selectedCity === 'all'
    ? stores
    : getStoresByCity(selectedCity)

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {/* Store List */}
      <div className="md:col-span-1 bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[25px] shadow-sm p-3 sm:p-4 h-[300px] md:h-[600px] overflow-y-auto">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Nuestras Tiendas</h3>
        
        {/* City Filter */}
        <div className="mb-3 sm:mb-4">
          <select 
            className="w-full p-1.5 sm:p-2 text-sm sm:text-base border rounded-lg"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value as string)}
          >
            <option value="all">Todas las ciudades</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className={`p-2 sm:p-3 md:p-4 rounded-lg cursor-pointer transition-all ${
                selectedStore.id === store.id
                  ? 'bg-[#196428] text-white'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedStore(store)}
            >
              <h4 className="text-sm sm:text-base font-medium">{store.name}</h4>
              <p className={`text-xs sm:text-sm ${selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'}`}>
                {store.address}
              </p>
              <p className={`text-xs sm:text-sm ${selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'}`}>
                {store.city}
              </p>
              <div className={`mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t ${selectedStore.id === store.id ? 'border-white/20' : 'border-gray-200'}`}>
                <p className={`text-xs sm:text-sm ${selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'}`}>
                  <strong>Contacto:</strong> {store.contact}
                </p>
                <p className={`text-xs sm:text-sm ${selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'}`}>
                  <strong>Tel:</strong> {store.phone}
                </p>
                <p className={`text-xs sm:text-sm ${selectedStore.id === store.id ? 'text-white/90' : 'text-gray-600'}`}>
                  <strong>GPS:</strong> {store.coords.lat}, {store.coords.lng}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="md:col-span-2 rounded-[15px] sm:rounded-[20px] md:rounded-[25px] overflow-hidden h-[400px] md:h-[600px]">
        <Map 
          stores={filteredStores}
          selectedStore={selectedStore}
          onStoreSelect={setSelectedStore}
          selectedCity={selectedCity}
        />
      </div>
    </div>
  )
}