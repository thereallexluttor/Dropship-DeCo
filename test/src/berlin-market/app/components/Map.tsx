"use client"

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Store {
  id: number
  name: string
  address: string
  city: string
  phone: string
  contact: string
  coords: { lat: number; lng: number }
}

interface MapProps {
  stores: Store[]
  selectedStore: Store
  onStoreSelect: (store: Store) => void
  selectedCity: string | 'all'
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
  markerRefs 
}: { 
  stores: Store[]
  selectedStore: Store
  selectedCity: string | 'all'
  markerRefs: React.MutableRefObject<{ [key: number]: L.Marker }>
}) {
  const map = useMap()
  
  // Eliminado el ajuste automático de zoom/posición al cambiar de ciudad

  useEffect(() => {
    // Abrir el popup del marcador seleccionado
    const marker = markerRefs.current[selectedStore.id]
    if (marker) {
      marker.openPopup()
    }
  }, [selectedStore, markerRefs])

  return null
}

export default function Map({ stores, selectedStore, onStoreSelect, selectedCity }: MapProps) {
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
            <div className="text-sm">
              <h4 className="font-semibold">{store.name}</h4>
              <p className="text-gray-600">{store.address}</p>
              <p className="text-gray-600">{store.city}</p>
              <p className="text-gray-600 mt-1"><strong>Contacto:</strong> {store.contact}</p>
              <p className="text-gray-600"><strong>Tel:</strong> {store.phone}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}