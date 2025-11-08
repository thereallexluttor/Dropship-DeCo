"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { stores, getUniqueCities, getStoresByCity, type Store } from "../lib/stores"

interface WhatsAppButtonProps {
  className?: string
}

type ViewState = 'main' | 'city-selection' | 'store-selection'

const WhatsAppButton = ({ className = "" }: WhatsAppButtonProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [viewState, setViewState] = useState<ViewState>('main')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  // Get unique cities and filtered stores using shared functions
  const cities = getUniqueCities()
  const filteredStores = getStoresByCity(selectedCity)

  const handleWhatsAppClick = () => {
    if (selectedStore) {
      const whatsappUrl = `https://wa.me/${selectedStore.phone}?text=${encodeURIComponent(`¡Hola ${selectedStore.contact}! Me gustaría más información sobre sus productos.`)}`
      window.open(whatsappUrl, '_blank')
      setIsMenuOpen(false)
      setViewState('main')
      setSelectedCity('')
      setSelectedStore(null)
    }
  }

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setViewState('store-selection')
  }

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store)
    handleWhatsAppClick()
  }

  const resetMenu = () => {
    setIsMenuOpen(false)
    setViewState('main')
    setSelectedCity('')
    setSelectedStore(null)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.whatsapp-menu') && !target.closest('.whatsapp-button')) {
        resetMenu()
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <>
      {/* Main WhatsApp Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`whatsapp-button fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 ${className}`}
      >
        <Image
          src="/icons/whatsapp.png"
          alt="WhatsApp"
          width={28}
          height={28}
          className="w-7 h-7"
        />
      </button>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="whatsapp-menu fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[25px] shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-[#196428] text-white p-3 sm:p-4 md:p-5">
              <h3 className="text-lg sm:text-xl font-bold text-center">
                {viewState === 'main' && 'Selecciona una ciudad'}
                {viewState === 'city-selection' && 'Selecciona una ciudad'}
                {viewState === 'store-selection' && `Tiendas en ${selectedCity}`}
              </h3>
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                <button
                  onClick={resetMenu}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 md:p-5 max-h-96 overflow-y-auto">
              {viewState === 'main' || viewState === 'city-selection' ? (
                <div className="space-y-2 sm:space-y-3">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className="w-full text-left p-3 sm:p-4 bg-gray-50 hover:bg-[#196428] hover:text-white rounded-[10px] sm:rounded-[12px] transition-all duration-300 group"
                    >
                      <div className="font-semibold text-base sm:text-lg group-hover:text-white">{city}</div>
                      <div className="text-sm text-gray-600 group-hover:text-white/90 mt-1">
                        {stores.filter(store => store.city === city).length} tienda{stores.filter(store => store.city === city).length !== 1 ? 's' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleStoreSelect(store)}
                      className="w-full text-left p-3 sm:p-4 bg-white hover:bg-[#196428] hover:text-white rounded-[10px] sm:rounded-[12px] transition-all duration-300 border border-gray-100 hover:border-[#196428] group shadow-sm hover:shadow-md"
                    >
                      <div className="font-semibold text-base sm:text-lg group-hover:text-white mb-1">{store.name}</div>
                      <div className="text-sm text-gray-600 group-hover:text-white/90 mb-1">{store.address}</div>
                      <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                        <div className="text-sm text-gray-600 group-hover:text-white/90">
                          <strong>Contacto:</strong> {store.contact}
                        </div>
                        <div className="text-sm text-gray-600 group-hover:text-white/90">
                          <strong>Tel:</strong> {store.phone}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 md:p-5 bg-gray-50 flex justify-between items-center">
              {viewState === 'store-selection' && (
                <button
                  onClick={() => setViewState('city-selection')}
                  className="px-3 sm:px-4 py-2 text-[#196428] hover:bg-[#196428] hover:text-white rounded-[8px] sm:rounded-[10px] transition-all duration-300 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver
                </button>
              )}
              <button
                onClick={resetMenu}
                className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-[8px] sm:rounded-[10px] transition-all duration-300 font-medium ml-auto"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default WhatsAppButton
