// Datos compartidos de las tiendas con información de contacto
export interface Store {
  id: number
  name: string
  address: string
  city: string
  phone: string
  contact: string
  coords: { lat: number; lng: number }
}

export const stores: Store[] = [
  {
    id: 1,
    name: "Distribuidora PETS",
    address: "Av. Q. seca 21 - 59",
    city: "Bucaramanga",
    phone: "3112777907",
    contact: "Marsheri Lozano",
    coords: { lat: 7.1249, lng: -73.1229 }
  },
  {
    id: 2,
    name: "Veterinaria El Hato",
    address: "Cl 29 #17 – 03",
    city: "Bucaramanga",
    phone: "3134957572",
    contact: "Ana Milena Suárez Poches",
    coords: { lat: 7.1234, lng: -73.1266 }
  },
  {
    id: 3,
    name: "Veterinaria El Hato SEDE I",
    address: "Cl 14 #10 - 14",
    city: "San Gil",
    phone: "3102370476",
    contact: "Francisco Javier Pinzón Lozano",
    coords: { lat: 6.5550, lng: -73.1349 }
  },
  {
    id: 4,
    name: "Veterinaria El Hato SEDE II",
    address: "Cl 14 #10 - 14",
    city: "San Gil",
    phone: "3202316426",
    contact: "Mauricio Bravo",
    coords: { lat: 6.5546, lng: -73.1354 }
  },
  {
    id: 5,
    name: "Veterinaria El Hato SEDE III",
    address: "Cr 17 #33 – 47 L 107",
    city: "San Gil",
    phone: "3134063139",
    contact: "Arturo Gomez Chaves",
    coords: { lat: 6.5542, lng: -73.1512 }
  },
  {
    id: 6,
    name: "Veterinaria Servicampo",
    address: "Cr 17 #12 – 93",
    city: "Socorro",
    phone: "3118478504",
    contact: "Sandra Milena Corzo Beltran",
    coords: { lat: 6.4695, lng: -73.2637 }
  },
  {
    id: 7,
    name: "Veterinaria El Hato",
    address: "Cr 9 #10 – 38",
    city: "Oiba",
    phone: "3138832796",
    contact: "Jose Luis Cruz Luna",
    coords: { lat: 6.2654, lng: -73.30024 }
  },
  {
    id: 8,
    name: "Veterinaria Santander",
    address: "Dg 30 #13 - 19",
    city: "Saravena",
    phone: "3118478552",
    contact: "Alba Capacho Peñaloza",
    coords: { lat: 6.9596, lng: -71.8765 }
  },
  {
    id: 9,
    name: "Droguería Santander",
    address: "Dg 30 #14 - 45",
    city: "Saravena",
    phone: "3102544596",
    contact: "Juan Francisco Lozano",
    coords: { lat: 6.9590, lng: -71.8771 }
  },
  {
    id: 10,
    name: "Farmacenter I",
    address: "Dg 30 #16 - 04",
    city: "Saravena",
    phone: "3212041398",
    contact: "Liliana Delgado",
    coords: { lat: 6.9582, lng: -71.8784 }
  },
  {
    id: 11,
    name: "Farmacenter II",
    address: "Cr 16A #20 – 03",
    city: "Saravena",
    phone: "3144645385",
    contact: "Lilibeth Fernandez",
    coords: { lat: 6.9509, lng: -71.8747 }
  },
  {
    id: 12,
    name: "Veterinaria El Hato",
    address: "Cl 7 #12 – 91",
    city: "Fortul",
    phone: "3134068190",
    contact: "Anderson Daza",
    coords: { lat: 6.7990, lng: -71.7679 }
  },
  {
    id: 13,
    name: "Droguería El Paisano",
    address: "Cl 7 #24 - 32",
    city: "Fortul",
    phone: "3105640915",
    contact: "Carlos Aconcha",
    coords: { lat: 6.7911, lng: -71.7745 }
  },
  {
    id: 14,
    name: "Veterinaria El Hato",
    address: "Cr 14 #13 – 55",
    city: "Tame",
    phone: "3123023124",
    contact: "Javier Abril Portilla",
    coords: { lat: 6.4607, lng: -71.7304 }
  },
  {
    id: 15,
    name: "Veterinaria Santander",
    address: "Cr 15 #13 – 68",
    city: "Tame",
    phone: "3118599045",
    contact: "Yimmy Brijaldo",
    coords: { lat: 6.4602, lng: -71.7312 }
  }
]

// Función auxiliar para obtener ciudades únicas
export const getUniqueCities = (): string[] => {
  return Array.from(new Set(stores.map(store => store.city)))
}

// Función auxiliar para filtrar tiendas por ciudad
export const getStoresByCity = (city: string): Store[] => {
  return stores.filter(store => store.city === city)
}
