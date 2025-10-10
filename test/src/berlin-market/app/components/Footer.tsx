import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#196428] text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-12 gap-8 md:gap-6 lg:gap-4">
          <div className="md:col-span-1 lg:col-span-2 flex flex-col items-center md:items-start">
            <Image
              src="/unisantander.png"
              alt="Unisantander"
              width={220}
              height={30}
              className="mb-4 md:mb-1 w-40 md:w-full"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-7 lg:pl-8 order-first md:order-none">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-4">
              {/* Servicio al cliente */}
              <div className="md:col-span-1">
                <h3 className="text-sm font-semibold mb-1.5">Servicio al cliente</h3>
                <ul className="space-y-[2px] text-[11px]">
                  <li><Link href="#">Ayuda y preguntas frecuentes</Link></li>
                  <li><Link href="#">Contacto</Link></li>
                  <li><Link href="#">Mi cuenta</Link></li>
                  <li><Link href="#">Solicitar contraseña</Link></li>
                  <li><Link href="#">Mis órdenes</Link></li>
                  <li><Link href="#">Mi lista de deseos</Link></li>
                  <li><Link href="#">Entrega rápida</Link></li>
                  <li><Link href="#">Pago seguro y métodos de pago</Link></li>
                  <li><Link href="#">Política de devolución de 30 días</Link></li>
                  <li><Link href="#">Newsletter</Link></li>
                  <li><Link href="#">Haga clic y recople</Link></li>
                  <li><Link href="#">Declaración de accesibilidad</Link></li>
                </ul>
              </div>

              {/* Nuestros mercados */}
              <div className="md:col-span-1">
                <h3 className="text-sm font-semibold mb-1.5">Nuestros mercados</h3>
                <ul className="space-y-[2px] text-[11px]">
                  <li><Link href="#">Encuentra mercados</Link></li>
                  <li><Link href="#">Servicios en el mercado</Link></li>
                  <li><Link href="#">Tarjeta regalo</Link></li>
                  <li><Link href="#">Salón Unisantander</Link></li>
                  <li><Link href="#">Prácticas veterinarias activas</Link></li>
                </ul>
              </div>

              {/* Acerca de Unisantander */}
              <div className="col-span-2 sm:col-span-1">
                <h3 className="text-sm font-semibold mb-1.5">Acerca de Unisantander</h3>
                <ul className="space-y-[2px] text-[11px]">
                  <li><Link href="/sobre-nosotros">Sobre nosotros</Link></li>
                  <li><Link href="#">Carreras</Link></li>
                  <li><Link href="#">Responsabilidad</Link></li>
                  <li><Link href="#">Animal comprometido</Link></li>
                  <li><Link href="#">Cumplimiento</Link></li>
                  <li><Link href="#">Convertirse en socio del mercado</Link></li>
                  <li><Link href="#">Prensa</Link></li>
                  <li><Link href="#">Indicaciones</Link></li>
                </ul>
              </div>

              <div className="hidden lg:block lg:col-span-1">
                {/* Este div es para mantener el layout en 4 columnas en desktop, se rellena con el conejo */}
              </div>
            </div>
          </div>
          {/* Footer Rabbit and Social Media */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col items-center md:items-start">
            {/* Footer Rabbit Image */}
            <div className="relative w-full max-w-[250px] h-[150px] lg:w-[300px] lg:h-[200px]">
              <Image
                src="/footer_rabbit.png"
                alt="Footer Rabbit"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Social Media Icons */}
            <div className="flex justify-center space-x-6 lg:space-x-8 mt-4">
              <Link href="#" className="text-white hover:text-gray-200">
                <Image src="/icons/facebook.png" alt="Facebook" width={30} height={30} />
              </Link>
              <Link href="#" className="text-white hover:text-gray-200">
                <Image src="/icons/instagram.png" alt="Instagram" width={30} height={30} />
              </Link>
              <Link href="#" className="text-white hover:text-gray-200">
                <Image src="/icons/youtube.png" alt="YouTube" width={30} height={30} />
              </Link>
              <Link href="#" className="text-white hover:text-gray-200">
                <Image src="/icons/tiktok.png" alt="TikTok" width={30} height={30} />
              </Link>
              <Link href="#" className="text-white hover:text-gray-200">
                <Image src="/icons/whatsapp.png" alt="WhatsApp" width={30} height={30} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

