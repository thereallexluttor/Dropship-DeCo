"use client"

import { useEffect, useState } from "react"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Link from "next/link"
import dynamic from "next/dynamic"
import { MapPin, Phone, User, Navigation } from "lucide-react"
import { stores, loadStoresFromSupabase, type Store } from "../lib/stores"

const Map = dynamic(() => import("../components/Map"), { ssr: false })

export default function ContactoPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Función para encontrar "Distribuidora PETS" o usar la primera tienda como fallback
  const findPetsStore = (storesList: Store[]): Store | null => {
    const petsStore = storesList.find(store => store.name.includes("Distribuidora PETS"))
    return petsStore || storesList[0] || null
  }

  const [storesList, setStoresList] = useState<Store[]>(stores)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [initialPetsStore, setInitialPetsStore] = useState<Store | null>(findPetsStore(stores))

  // Cargar tiendas desde Supabase al montar el componente
  useEffect(() => {
    const loadStores = async () => {
      const supabaseStores = await loadStoresFromSupabase()
      if (supabaseStores.length > 0) {
        setStoresList(supabaseStores)
        setInitialPetsStore(findPetsStore(supabaseStores))
      }
      setIsLoading(false)
    }
    loadStores()
  }, [])

  // Get unique cities and filtered stores using shared functions
  const cities = Array.from(new Set(storesList.map(store => store.city)))
  const filteredStores = selectedCity === 'all'
    ? storesList
    : storesList.filter(store => store.city === selectedCity)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
        <div className="bg-[#196428] text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Contáctanos — Tiendas y teléfonos</span>
            <span className="inline-block mr-8">Contáctanos — Tiendas y teléfonos</span>
          </div>
        </div>

        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
        />

        <main className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="mb-12">
              <nav className="flex items-center text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700 transition-colors">Inicio</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Contacto</span>
              </nav>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-10 text-center" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
              Contacto
            </h1>

            <div className="flex flex-col md:grid md:grid-cols-3 gap-4 sm:gap-6">
              {/* Store List */}
              <div className="md:col-span-1 bg-white rounded-[18px] sm:rounded-[22px] md:rounded-[26px] shadow-lg border border-[#196428]/10 p-3 sm:p-4 lg:p-5 h-[320px] md:h-[620px] overflow-y-auto">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0f3c1a]">Nuestras Tiendas</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Explora por ciudad y descubre tu punto más cercano.</p>
                  </div>
                </div>
                
                {/* City Filter */}
                <div className="mb-3 sm:mb-5">
                  <div className="relative">
                    <select 
                      className="w-full appearance-none p-2 sm:p-2.5 pr-10 text-sm sm:text-base border border-[#196428]/30 rounded-full bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-[#196428]/60 focus:border-transparent transition-all"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value as string)}
                  >
                    <option value="all">Todas las ciudades</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#196428]/70 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {filteredStores.map((store) => (
                    <div
                      key={store.id}
                      className={`relative overflow-hidden group rounded-2xl cursor-pointer transition-all duration-300 border ${
                        selectedStore?.id === store.id
                          ? 'bg-gradient-to-br from-[#196428] via-[#145020] to-[#0d2d15] text-white shadow-xl border-[#196428]'
                          : 'bg-white text-gray-800 shadow-sm border-gray-100 hover:-translate-y-1 hover:shadow-lg'
                      }`}
                      onClick={() => setSelectedStore(store)}
                    >
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${selectedStore?.id === store.id ? 'hidden' : 'bg-gradient-to-br from-[#196428]/10 via-transparent to-transparent'}`} />
                      <div className="relative z-[1] p-3 sm:p-4">
                        <div className="flex items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm sm:text-base font-semibold tracking-tight ${selectedStore?.id === store.id ? 'text-white' : 'text-[#0f3c1a]'}`}>{store.name}</h4>
                            <p className={`text-xs sm:text-sm mt-0.5 ${selectedStore?.id === store.id ? 'text-white/80' : 'text-gray-600'}`}>{store.address}</p>
                            <p className={`text-xs sm:text-sm ${selectedStore?.id === store.id ? 'text-emerald-100' : 'text-[#196428]'}`}>{store.city}</p>
                          </div>
                        </div>

                        <div className={`mt-3 grid grid-cols-1 gap-2 rounded-xl p-3 ${selectedStore?.id === store.id ? 'bg-black/10 backdrop-blur border border-white/20' : 'bg-[#f5fdf5] border border-[#196428]/10'}`}>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <User className={`h-4 w-4 ${selectedStore?.id === store.id ? 'text-white/80' : 'text-[#196428]'}`} />
                            <span className={selectedStore?.id === store.id ? 'text-white/90' : 'text-gray-700'}>{store.contact}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Phone className={`h-4 w-4 ${selectedStore?.id === store.id ? 'text-white/80' : 'text-[#196428]'}`} />
                            <a
                              href={`tel:${store.phone}`}
                              className={`underline-offset-2 ${selectedStore?.id === store.id ? 'text-white hover:text-emerald-100' : 'text-[#196428] hover:text-[#0f3c1a]'}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {store.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Navigation className={`h-4 w-4 ${selectedStore?.id === store.id ? 'text-white/80' : 'text-[#196428]'}`} />
                            <span className={selectedStore?.id === store.id ? 'text-white/90' : 'text-gray-700'}>
                              {store.coords.lat.toFixed(4)}, {store.coords.lng.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="md:col-span-2 rounded-[18px] sm:rounded-[22px] md:rounded-[28px] overflow-hidden h-[420px] md:h-[620px] shadow-lg border border-[#196428]/10">
                <Map 
                  stores={filteredStores}
                  selectedStore={selectedStore}
                  onStoreSelect={setSelectedStore}
                  selectedCity={selectedCity}
                  initialPetsStore={initialPetsStore}
                />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  )
}


