"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { stores, getUniqueCities, getStoresByCity, type Store } from "../lib/stores"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      const whatsappUrl = `https://wa.me/${selectedStore.phone}?text=${encodeURIComponent("¡Hola! Me gustaría más información sobre sus productos.")}`
      window.open(whatsappUrl, '_blank')
      handleClose()
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

  const handleBack = () => {
    setViewState('city-selection')
    setSelectedCity('')
  }

  const handleClose = () => {
    setIsMenuOpen(false)
    setViewState('main')
    setSelectedCity('')
    setSelectedStore(null)
  }

  return (
    <>
      {/* Main WhatsApp Button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className={cn(
          "whatsapp-button fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50",
          className
        )}
        aria-label="Abrir WhatsApp"
      >
        <Image
          src="/icons/whatsapp.png"
          alt="WhatsApp"
          width={28}
          height={28}
          className="w-7 h-7"
        />
      </button>

      {/* Dialog Modal */}
      <Dialog open={isMenuOpen} onOpenChange={(open) => {
        if (!open) {
          handleClose()
        } else {
          setIsMenuOpen(true)
        }
      }}>
        <DialogContent 
          className="sm:max-w-md max-h-[80vh] p-0 overflow-hidden"
        >
          {/* Header */}
          <DialogHeader className="bg-[#196428] text-white p-4 sm:p-5 m-0 rounded-t-lg space-y-0">
            <DialogTitle className="text-lg sm:text-xl font-bold text-center text-white">
              {viewState === 'main' || viewState === 'city-selection' 
                ? 'Selecciona una ciudad'
                : `Tiendas en ${selectedCity}`
              }
            </DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="p-4 sm:p-5 max-h-96 overflow-y-auto">
            {viewState === 'main' || viewState === 'city-selection' ? (
              <div className="space-y-2 sm:space-y-3">
                {cities.map((city) => (
                  <Button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 sm:p-4 bg-gray-50 hover:bg-[#196428] hover:text-white transition-all duration-300 group"
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="font-semibold text-base sm:text-lg group-hover:text-white">
                        {city}
                      </div>
                      <div className="text-sm text-gray-600 group-hover:text-white/90 mt-1">
                        {stores.filter(store => store.city === city).length} tienda{stores.filter(store => store.city === city).length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredStores.map((store) => (
                  <Button
                    key={store.id}
                    onClick={() => handleStoreSelect(store)}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 sm:p-4 bg-white hover:bg-[#196428] hover:text-white transition-all duration-300 border border-gray-100 hover:border-[#196428] group shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="text-sm text-gray-600 group-hover:text-white/90 mb-1">
                        {store.address}
                      </div>
                      <div className="text-sm text-gray-600 group-hover:text-white/90">
                        <strong>Tel:</strong> {store.phone}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 sm:p-5 bg-gray-50 m-0 rounded-b-lg">
            <div className="flex justify-between items-center w-full">
              {viewState === 'store-selection' && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="text-[#196428] hover:bg-[#196428] hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              )}
              <Button
                onClick={handleClose}
                variant="ghost"
                className="text-gray-600 hover:bg-gray-200 ml-auto"
              >
                Cancelar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WhatsAppButton
