export interface CategoryItem {
  name: string;
  href: string;
  description: string;
  image: string;
}

export interface Category {
  name: string;
  description: string;
  featured: {
    name: string;
    href: string;
  };
  items: CategoryItem[];
}

export const categories: Category[] = [
  {
    name: "COLECCIONES",
    description: "Descubre nuestra exclusiva selección de joyas",
    featured: { name: "Nueva Colección Primavera", href: "/nueva-coleccion" },
    items: [
      { 
        name: "Anillos", 
        href: "colecciones/anillos",
        description: "Anillos de compromiso y alta joyería",
        image: "/cap1.jpg" 
      },
      { 
        name: "Collares", 
        href: "colecciones/collares",
        description: "Elegantes collares y gargantillas",
        image: "/cap2.jpg"
      },
      { 
        name: "Pulseras", 
        href: "colecciones/pulseras",
        description: "Pulseras artesanales exclusivas",
        image: "/cap3.jpg"
      },
      { 
        name: "Pendientes", 
        href: "colecciones/pendientes",
        description: "Pendientes para cada ocasión",
        image: "/cap4.jpg"
      }
    ],
  },
  {
    name: "OCASIONES",
    description: "El regalo perfecto para cada momento",
    featured: { name: "Colección Bodas 2024", href: "/bodas" },
    items: [
      { 
        name: "Bodas", 
        href: "ocasiones/bodas",
        description: "Joyas para el día más especial",
        image: "/cap2.jpg"
      },
      { 
        name: "Compromiso", 
        href: "ocasiones/compromiso",
        description: "Anillos de compromiso únicos",
        image: "/cap1.jpg"
      },
      { 
        name: "Regalos", 
        href: "ocasiones/regalos",
        description: "Detalles inolvidables",
        image: "/cap4.jpg"
      },
      { 
        name: "Edición Limitada", 
        href: "ocasiones/edicion-limitada",
        description: "Piezas exclusivas numeradas",
        image: "/cap3.jpg"
      }
    ],
  },
  {
    name: "MATERIALES",
    description: "La más alta calidad en cada material",
    featured: { name: "Colección Diamantes Rare", href: "/diamantes" },
    items: [
      { 
        name: "Oro 18k", 
        href: "materiales/oro-18k",
        description: "Pureza y elegancia en oro",
        image: "/cap1.jpg"
      },
      { 
        name: "Platino", 
        href: "materiales/platino",
        description: "El metal más noble y duradero",
        image: "/cap2.jpg"
      },
      { 
        name: "Diamantes", 
        href: "materiales/diamantes",
        description: "Diamantes certificados GIA",
        image: "/cap3.jpg"
      },
      { 
        name: "Piedras Preciosas", 
        href: "materiales/piedras-preciosas",
        description: "Gemas de excepcional calidad",
        image: "/cap4.jpg"
      }
    ],
  },
  {
    name: "SERVICIOS",
    description: "Experiencia personalizada de lujo",
    featured: { name: "Diseño a Medida", href: "/personalizacion" },
    items: [
      { 
        name: "Personalización", 
        href: "servicios/personalizacion",
        description: "Diseños únicos a tu medida",
        image: "/cap4.jpg"
      },
      { 
        name: "Grabado", 
        href: "servicios/grabado",
        description: "Mensajes eternos en tus joyas",
        image: "/cap3.jpg"
      },
      { 
        name: "Mantenimiento", 
        href: "servicios/mantenimiento",
        description: "Cuidado experto de tus joyas",
        image: "/cap2.jpg"
      },
      { 
        name: "Tasación", 
        href: "servicios/tasacion",
        description: "Valoración profesional certificada",
        image: "/cap1.jpg"
      }
    ],
  },
]; 