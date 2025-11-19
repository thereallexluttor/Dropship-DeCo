"use client";

import Image from "next/image";
import Link from "next/link";
import { Megaphone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#196428] text-white pt-4 pb-4 w-full" style={{ marginBottom: 0, marginTop: 'auto', flexShrink: 0 }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-12 gap-8 md:gap-6 lg:gap-4">
          <div className="md:col-span-1 lg:col-span-2 flex flex-col items-center md:items-start">
            <Image
              src="/unisantander_footer.png"
              alt="Unisantander"
              width={220}
              height={30}
              className="mb-4 md:mb-1 w-40 md:w-full"
            />

            {/* Hiring Card - Desktop Only */}
            <div className="hidden md:block w-full max-w-md mx-auto mt-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white relative overflow-hidden shadow-lg">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-white rounded-full translate-y-6 -translate-x-6"></div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-sm font-normal mb-1">¡Hey, Espera!</h3>
                    <p className="text-xs opacity-90">
                      ¿Quieres trabajar con nosotros? <span className="font-normal">¡Estamos contratando!</span>
                    </p>
                  </div>

                  {/* Megaphone Icon */}
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="absolute bottom-2 right-2">
                  <Link href="/vacantes" className="text-white hover:text-gray-200 transition-colors text-xs underline">
                    Entra aquí
                  </Link>
                </div>
              </div>
            </div>

          </div>
          <div className="md:col-span-2 lg:col-span-7 lg:pl-8 order-first md:order-none">
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Servicio al cliente */}
                <div className="text-left">
                  <h3 className="text-base font-normal mb-3">Servicio al cliente</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/ayuda" className="hover:underline">Ayuda y preguntas frecuentes</Link></li>
                    <li><Link href="/contacto" className="hover:underline">Contacto</Link></li>
                    <li><Link href="/cuenta" className="hover:underline">Mi cuenta</Link></li>
                  </ul>
                </div>

                {/* Acerca de Unisantander */}
                <div className="text-left">
                  <h3 className="text-base font-normal mb-3">Acerca de Unisantander</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/sobre-nosotros" className="hover:underline">Sobre nosotros</Link></li>
                    <li><Link href="/carreras" className="hover:underline">Trabaja con nosotros</Link></li>
                    <li><Link href="/responsabilidad" className="hover:underline">Responsabilidad</Link></li>
                    <li><Link href="/cumplimiento" className="hover:underline">Cumplimiento</Link></li>
                  </ul>
                </div>
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
                <div className="flex justify-center space-x-6 lg:space-x-8 mt-4 mb-0">
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
  );
};

export default Footer;