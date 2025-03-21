export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
}

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Anillo Solitario Diamante "Eterno Amor"',
    price: 2999,
    category: 'Colección Premium',
    image: '/cap1.jpg',
    description: 'Elegante anillo de compromiso con diamante central de 1 quilate.'
  },
  {
    id: '2',
    name: 'Anillo de Compromiso "Infinity"',
    price: 3499,
    category: 'Colección Royal',
    image: '/cap2.jpg',
    description: 'Diseño exclusivo con diamante central y pavé de diamantes en banda.'
  },
  {
    id: '3',
    name: 'Collar de Perlas Akoya',
    price: 1299,
    category: 'Colección Clásica',
    image: '/cap3.jpg',
    description: 'Collar de perlas cultivadas Akoya con broche de oro blanco de 18k.'
  },
  {
    id: '4',
    name: 'Pendientes Diamante Princesa',
    price: 1850,
    category: 'Colección Royal',
    image: '/cap4.jpg',
    description: 'Pendientes con diamantes talla princesa de 0.75 quilates cada uno.'
  },
  {
    id: '5',
    name: 'Pulsera Rivière de Diamantes',
    price: 4999,
    category: 'Colección Premium',
    image: '/cap1.jpg',
    description: 'Elegante pulsera con 25 diamantes talla brillante engastados en platino.'
  },
  {
    id: '6',
    name: 'Anillo Trío de Diamantes',
    price: 2750,
    category: 'Colección Contemporánea',
    image: '/cap2.jpg',
    description: 'Sofisticado anillo con tres diamantes centrales rodeados de pavé.'
  },
  {
    id: '7',
    name: 'Collar Gargantilla de Zafiros',
    price: 3250,
    category: 'Colección Royal',
    image: '/cap3.jpg',
    description: 'Deslumbrante gargantilla con zafiros azules y diamantes en oro blanco de 18k.'
  },
  {
    id: '8',
    name: 'Pendientes Cascada de Diamantes',
    price: 2100,
    category: 'Colección Premium',
    image: '/cap4.jpg',
    description: 'Pendientes largos con diamantes en cascada montados en oro blanco de 18k.'
  },
  {
    id: '9',
    name: 'Pulsera Esmeraldas y Diamantes',
    price: 3899,
    category: 'Colección Exclusiva',
    image: '/goldsilver.jpeg',
    description: 'Exquisita pulsera con esmeraldas colombianas intercaladas con diamantes.'
  },
  {
    id: '10',
    name: 'Anillo Vintage de Rubíes',
    price: 2499,
    category: 'Colección Vintage',
    image: '/cap1.jpg',
    description: 'Anillo de estilo vintage con rubí central y diamantes en montadura de oro rosa de 18k.'
  },
  {
    id: '11',
    name: 'Collar Corazón de Diamantes',
    price: 1699,
    category: 'Colección Romántica',
    image: '/cap2.jpg',
    description: 'Delicado collar con colgante en forma de corazón pavimentado con diamantes.'
  },
  {
    id: '12',
    name: 'Pendientes de Perlas Tahití',
    price: 1299,
    category: 'Colección Marina',
    image: '/cap3.jpg',
    description: 'Elegantes pendientes con perlas negras de Tahití y diamantes.'
  },
  {
    id: '13',
    name: 'Anillo Halo de Zafiro',
    price: 3150,
    category: 'Colección Royal',
    image: '/cap4.jpg',
    description: 'Majestuoso anillo con zafiro central de 1.5 quilates rodeado de diamantes.'
  },
  {
    id: '14',
    name: 'Pulsera Tennis de Diamantes',
    price: 5500,
    category: 'Colección Premium',
    image: '/cap1.jpg',
    description: 'Elegante pulsera tennis con 45 diamantes engastados en oro blanco de 18k.'
  },
  {
    id: '15',
    name: 'Collar Choker de Oro',
    price: 1799,
    category: 'Colección Contemporánea',
    image: '/cap2.jpg',
    description: 'Moderno collar choker en oro amarillo de 18k con diseño minimalista.'
  },
  {
    id: '16',
    name: 'Pendientes Candelabro',
    price: 2250,
    category: 'Colección Elegance',
    image: '/cap3.jpg',
    description: 'Espectaculares pendientes largos con diamantes y tanzanitas en cascada.'
  },
  {
    id: '17',
    name: 'Anillo de Esmeralda Colombiana',
    price: 4200,
    category: 'Colección Exclusiva',
    image: '/cap4.jpg',
    description: 'Impresionante anillo con esmeralda colombiana certificada de 2 quilates.'
  },
  {
    id: '18',
    name: 'Pulsera Multi-cadena en Oro Rosa',
    price: 1850,
    category: 'Colección Contemporánea',
    image: '/goldsilver.jpeg',
    description: 'Delicada pulsera de múltiples cadenas entrelazadas en oro rosa de 18k.'
  },
  {
    id: '19',
    name: 'Collar de Aguamarina y Diamantes',
    price: 2950,
    category: 'Colección Marina',
    image: '/cap1.jpg',
    description: 'Collar con colgante de aguamarina de 3 quilates rodeada de diamantes.'
  },
  {
    id: '20',
    name: 'Pendientes Botón de Rubíes',
    price: 1699,
    category: 'Colección Royal',
    image: '/cap2.jpg',
    description: 'Elegantes pendientes con rubíes centrales rodeados de diamantes.'
  },
  {
    id: '21',
    name: 'Anillo Eternidad de Zafiros',
    price: 2350,
    category: 'Colección Royal',
    image: '/cap3.jpg',
    description: 'Precioso anillo con zafiros azules calibrados en todo su contorno.'
  },
  {
    id: '22',
    name: 'Pulsera Rígida con Diamantes',
    price: 3299,
    category: 'Colección Premium',
    image: '/cap4.jpg',
    description: 'Sofisticada pulsera rígida en oro blanco con pavé de diamantes.'
  },
  {
    id: '23',
    name: 'Collar con Perla Barroca',
    price: 1999,
    category: 'Colección Vintage',
    image: '/cap1.jpg',
    description: 'Original collar con perla barroca natural suspendida en cadena de oro.'
  },
  {
    id: '24',
    name: 'Pendientes Chandelier con Topacios',
    price: 2499,
    category: 'Colección Elegance',
    image: '/cap2.jpg',
    description: 'Deslumbrantes pendientes largos con topacios azules y diamantes.'
  }
]; 