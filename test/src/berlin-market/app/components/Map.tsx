"use client"

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Phone, User, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import type { Store } from '../lib/stores'

interface MapProps {
  stores: Store[]
  selectedStore: Store | null
  onStoreSelect: (store: Store) => void
  selectedCity: string | 'all'
  initialPetsStore?: Store | null
}

// Crear iconos personalizados
const hatoIcon = new L.Icon({
  iconUrl: '/leaflet/hato.png',
  iconSize: [35, 57], // Aumentado de 25x41 a 35x57
  iconAnchor: [17, 57], // Ajustado al nuevo tamaño
  popupAnchor: [1, -57], // Ajustado al nuevo tamaño
  shadowSize: [57, 57] // Ajustado al nuevo tamaño
})

const petsIcon = new L.Icon({
  iconUrl: '/leaflet/pets.png',
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  popupAnchor: [1, -57],
  shadowSize: [57, 57]
})

const servicampoIcon = new L.Icon({
  iconUrl: '/leaflet/servicampo.png',
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  popupAnchor: [1, -57],
  shadowSize: [57, 57]
})

const santanderIcon = new L.Icon({
  iconUrl: '/leaflet/santander.png',
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  popupAnchor: [1, -57],
  shadowSize: [57, 57]
})

const defaultIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [35, 57], // Aumentado de 25x41 a 35x57
  iconAnchor: [17, 57], // Ajustado al nuevo tamaño
  popupAnchor: [1, -57], // Ajustado al nuevo tamaño
  shadowSize: [57, 57] // Ajustado al nuevo tamaño
})

// Función para determinar si una tienda es Veterinaria El Hato
function isHatoStore(name: string): boolean {
  return name.includes("Veterinaria El Hato")
}

// Función para determinar si una tienda es Distribuidora PETS
function isPetsStore(name: string): boolean {
  return name.includes("Distribuidora PETS")
}

// Función para determinar si una tienda es Servicampo
function isServicampoStore(name: string): boolean {
  return name.includes("Servicampo")
}

// Función para determinar si una tienda es Veterinaria Santander
function isSantanderStore(name: string): boolean {
  return name.includes("Veterinaria Santander")
}

// Función para calcular el centro de una ciudad
function getCityCenter(stores: Store[]) {
  const lats = stores.map(store => store.coords.lat)
  const lngs = stores.map(store => store.coords.lng)
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
  }
}

function MapController({ 
  stores, 
  selectedStore, 
  selectedCity,
  markerRefs,
  initialPetsStore
}: { 
  stores: Store[]
  selectedStore: Store | null
  selectedCity: string | 'all'
  markerRefs: React.MutableRefObject<{ [key: number]: L.Marker }>
  initialPetsStore?: Store | null
}) {
  const map = useMap()
  const previousStoreId = useRef<number | null>(null)
  const isInitialLoad = useRef<boolean>(true)
  
  useEffect(() => {
    // En la carga inicial, centrar en Distribuidora PETS si no hay tienda seleccionada
    if (isInitialLoad.current && !selectedStore && initialPetsStore && map) {
      isInitialLoad.current = false
      // No establecer previousStoreId aquí para que la primera selección funcione
      const { lat, lng } = initialPetsStore.coords
      
      map.whenReady(() => {
        setTimeout(() => {
          if (map && map.getContainer()) {
            map.setView([lat, lng], 14, {
              animate: true,
              duration: 0.8
            })
          }
        }, 100)
      })
      return
    }
    
    // Si hay una tienda seleccionada (cualquier selección del usuario), centrar el mapa
    if (selectedStore && map) {
      // Siempre centrar si es diferente a la anterior (incluyendo cuando previousStoreId es null)
      const shouldCenter = previousStoreId.current !== selectedStore.id
      
      if (shouldCenter) {
        previousStoreId.current = selectedStore.id
        const { lat, lng } = selectedStore.coords
        const storeId = selectedStore.id
        let timeoutId: NodeJS.Timeout | null = null
        
        // Función para abrir el popup
        const openPopup = () => {
          setTimeout(() => {
            try {
              // Verificar que el mapa y su contenedor estén disponibles
              if (!map || !map.getContainer()) return
              
              const marker = markerRefs.current[storeId]
              if (!marker) return
              
              // Verificar que el marcador esté en el mapa
              if (!map.hasLayer(marker)) return
              
              // Verificar que el popup esté disponible
              const popup = marker.getPopup()
              if (popup) {
                // Usar requestAnimationFrame para asegurar que el DOM esté listo
                requestAnimationFrame(() => {
                  try {
                    marker.openPopup()
                  } catch (error) {
                    // Silenciar errores si el popup no se puede abrir
                    console.debug('No se pudo abrir el popup:', error)
                  }
                })
              }
            } catch (error) {
              // Silenciar errores si algo falla
              console.debug('Error al abrir popup:', error)
            }
          }, 300)
        }
        
        // Función para centrar el mapa
        const centerMap = () => {
          // Verificar que el mapa esté completamente inicializado
          if (!map || !map.getContainer()) return
          
          // Verificar si el mapa ya está en la posición correcta
          const currentCenter = map.getCenter()
          const currentZoom = map.getZoom()
          const isAlreadyCentered = 
            Math.abs(currentCenter.lat - lat) < 0.001 && 
            Math.abs(currentCenter.lng - lng) < 0.001 && 
            currentZoom === 14
          
          if (isAlreadyCentered) {
            // Si ya está centrado, solo abrir el popup
            openPopup()
          } else {
            // Usar setView con animación para centrar el mapa de manera confiable
            map.setView([lat, lng], 14, {
              animate: true,
              duration: 0.8
            })
            
            // Esperar a que el mapa termine de moverse y luego abrir el popup
            const handleMoveEnd = () => {
              map.off('moveend', handleMoveEnd)
              openPopup()
            }
            
            map.once('moveend', handleMoveEnd)
          }
        }
        
        // Esperar a que el mapa esté completamente listo antes de centrar
        map.whenReady(() => {
          // Pequeño delay adicional para asegurar que todo esté inicializado
          timeoutId = setTimeout(centerMap, 100)
        })
        
        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
        }
      }
    }
  }, [selectedStore, map, markerRefs, initialPetsStore])

  return null
}

export default function Map({ stores, selectedStore, onStoreSelect, selectedCity, initialPetsStore }: MapProps) {
  const markerRefs = useRef<{ [key: number]: L.Marker }>({})
  
  // Centro inicial de Colombia
  const center: [number, number] = [4.570868, -74.297333]

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      dragging={true}
      minZoom={5}
      maxZoom={18}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController 
        stores={stores} 
        selectedStore={selectedStore} 
        selectedCity={selectedCity}
        markerRefs={markerRefs}
        initialPetsStore={initialPetsStore}
      />
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={[store.coords.lat, store.coords.lng]}
          icon={isHatoStore(store.name) ? hatoIcon : 
                isPetsStore(store.name) ? petsIcon : 
                isServicampoStore(store.name) ? servicampoIcon :
                isSantanderStore(store.name) ? santanderIcon :
                defaultIcon}
          ref={(ref) => {
            if (ref) {
              markerRefs.current[store.id] = ref
            }
          }}
          eventHandlers={{
            click: () => onStoreSelect(store),
          }}
        >
          <Popup>
            <div className="text-sm min-w-[230px] max-w-[280px]">
              <div className="relative overflow-hidden rounded-2xl border border-[#196428]/20 bg-gradient-to-br from-[#196428] via-[#145020] to-[#0d2d15] shadow-xl">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#196428] via-[#1d7a3a] to-[#0b2611]" />
                <div className="p-4 text-white">
                  <div className="flex items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold leading-tight text-white">
                        {store.name}
                      </h4>
                      <p className="mt-1 text-xs text-white">
                        {store.address}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                        <MapPin className="h-3 w-3 text-white" />
                        {store.city}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs text-white">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-white" />
                      <span className="font-medium text-white">{store.contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-white" />
                      <a
                        href={`tel:${store.phone}`}
                        className="font-semibold text-white underline-offset-2 hover:text-white hover:underline"
                      >
                        <span className="text-white">{store.phone}</span>
                      </a>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${store.coords.lat},${store.coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/10 backdrop-blur px-3 py-1.5 text-white transition-colors hover:bg-black/20"
                    >
                      <Navigation className="h-4 w-4 text-white" />
                      <span className="text-xs font-semibold text-white">Ver ruta en Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}