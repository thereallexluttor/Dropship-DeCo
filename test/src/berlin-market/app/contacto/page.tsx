"use client"

import { useEffect, useMemo, useState } from "react"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Link from "next/link"
import dynamic from "next/dynamic"
import { stores as fallbackStores, Store, loadStoresFromSupabase, getUniqueCities, getStoresByCity } from "../lib/stores"

const DynamicMap = dynamic(() => import("../components/Map"), { ssr: false })

export default function ContactoPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [allStores, setAllStores] = useState<Store[]>(fallbackStores)
  const [selectedCity, setSelectedCity] = useState<string | 'all'>('all')
  const [selectedStore, setSelectedStore] = useState<Store>(fallbackStores[0])

  useEffect(() => {
    loadStoresFromSupabase().then((fetched) => {
      if (fetched.length > 0) {
        setAllStores(fetched)
        setSelectedStore(fetched[0])
      }
    })
  }, [])

  const cities = useMemo(() => ['all', ...Array.from(new Set(allStores.map(s => s.city)))], [allStores])
  const visibleStores = useMemo(() => selectedCity === 'all' ? allStores : allStores.filter(s => s.city === selectedCity), [allStores, selectedCity])

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

            <div className="grid lg:grid-cols-3 gap-8">
              <section className="lg:col-span-1 space-y-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Filtrar por ciudad</label>
                  <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
                    {cities.map((c) => (
                      <option key={c} value={c}>{c === 'all' ? 'Todas' : c}</option>
                    ))}
                  </select>
                </div>

                <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {visibleStores.map((store) => (
                    <li key={store.id} className={`bg-white rounded-md p-4 shadow-sm border ${selectedStore.id === store.id ? 'border-[#196428]' : 'border-transparent'}`}>
                      <button onClick={() => setSelectedStore(store)} className="text-left w-full">
                        <p className="text-sm text-gray-500">{store.city}</p>
                        <h3 className="text-base font-semibold text-gray-900">{store.name}</h3>
                        <p className="text-sm text-gray-700">{store.address}</p>
                        <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Contacto:</span> {store.contact}</p>
                        <p className="text-sm text-gray-700"><span className="font-medium">Tel:</span> {store.phone}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="lg:col-span-2">
                <div className="h-[480px] w-full rounded-lg overflow-hidden shadow-sm bg-white">
                  <DynamicMap stores={visibleStores} selectedStore={selectedStore} onStoreSelect={setSelectedStore} selectedCity={selectedCity} />
                </div>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  )
}


