"use client";

import Image from "next/image";
import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Footer = () => {
  return (
    <footer
      className="bg-[#196428] text-white w-full py-6 sm:py-8 md:py-10"
      style={{ marginBottom: 0, marginTop: "auto", flexShrink: 0 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-12 gap-8 sm:gap-10 md:gap-6 lg:gap-8">
          <div className="md:col-span-1 lg:col-span-2 flex flex-col items-center md:items-start">
            <Image
              src="/unisantander_footer.png"
              alt="Unisantander"
              width={220}
              height={30}
              className="mb-4 md:mb-1 w-36 sm:w-40 md:w-full max-w-[220px] md:max-w-none"
            />

            {/* Hiring Card - Visible on all screens, responsive layout */}
            <div className="w-full max-w-md mx-auto mt-4 sm:mt-6 md:mt-8">
              <Card
                className={cn(
                  "relative border-0 overflow-hidden",
                  "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
                  "text-white",
                  "shadow-lg sm:shadow-xl"
                )}
              >
                {/* Refined background pattern - responsive scale */}
                <div
                  className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  aria-hidden
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_white_1px,_transparent_1px)] bg-[length:20px_20px] sm:bg-[length:24px_24px]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_white_2px,_transparent_2px)] bg-[length:28px_28px] sm:bg-[length:32px_32px]" />
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                </div>

                <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-3 sm:gap-4 space-y-0 p-3 sm:p-4 pb-0">
                  <div className="space-y-1 sm:space-y-1.5 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold text-white truncate">
                      ¡Hey, Espera!
                    </CardTitle>
                    <CardDescription className="text-blue-100/90 text-xs sm:text-sm line-clamp-2">
                      ¿Quieres trabajar con nosotros?{" "}
                      <span className="font-medium text-white">
                        ¡Estamos contratando!
                      </span>
                    </CardDescription>
                  </div>
                  <div
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/20"
                    aria-hidden
                  >
                    <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </CardHeader>

                <CardFooter className="relative z-10 flex justify-end p-3 sm:p-4 pt-0">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-white hover:bg-white/15 hover:text-white",
                      "focus-visible:ring-white/30",
                      "h-8 sm:h-9 text-xs sm:text-sm"
                    )}
                  >
                    <Link
                      href="/vacantes"
                      className="inline-flex items-center gap-1 sm:gap-1.5"
                      aria-label="Ver vacantes disponibles"
                    >
                      Entra aquí
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

          </div>
          <div className="md:col-span-2 lg:col-span-7 lg:pl-8 order-first md:order-none">
            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Servicio al cliente */}
                <div className="text-center sm:text-left">
                  <h3 className="text-sm sm:text-base font-normal mb-2 sm:mb-3">Servicio al cliente</h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <li><Link href="/ayuda" className="hover:underline inline-block">Ayuda y preguntas frecuentes</Link></li>
                    <li><Link href="/contacto" className="hover:underline inline-block">Contacto</Link></li>
                    <li><Link href="/cuenta" className="hover:underline inline-block">Mi cuenta</Link></li>
                  </ul>
                </div>

                {/* Acerca de Unisantander */}
                <div className="text-center sm:text-left">
                  <h3 className="text-sm sm:text-base font-normal mb-2 sm:mb-3">Acerca de Unisantander</h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <li><Link href="/sobre-nosotros" className="hover:underline inline-block">Sobre nosotros</Link></li>
                    <li><Link href="/carreras" className="hover:underline inline-block">Trabaja con nosotros</Link></li>
                  </ul>
                </div>
                {/* Políticas */}
                <div className="text-center sm:text-left">
                  <h3 className="text-sm sm:text-base font-normal mb-2 sm:mb-3">Políticas</h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <li><Link href="/responsabilidad" className="hover:underline inline-block">Cumplimiento</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* Footer Rabbit and Social Media */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col items-center">
                {/* Footer Rabbit Image - responsive size */}
                <div className="relative w-full max-w-[200px] h-[120px] sm:max-w-[250px] sm:h-[150px] lg:max-w-[300px] lg:h-[200px]">
                  <Image
                    src="/footer_rabbit.png"
                    alt="Footer Rabbit"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 640px) 200px, (max-width: 1024px) 250px, 300px"
                  />
                </div>

                {/* Social Media Icons - responsive spacing and touch targets */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mt-4 mb-0">
                  <Link
                    href="https://www.facebook.com/profile.php?id=61579888082825&notif_id=1766082992571868&notif_t=page_user_activity&ref=notif#"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-gray-200 p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    aria-label="Facebook"
                  >
                    <Image src="/icons/facebook.png" alt="" width={30} height={30} className="w-7 h-7 sm:w-8 sm:h-8" />
                  </Link>
                  <Link
                    href="https://www.instagram.com/unisantander_s.a.s/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-gray-200 p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    aria-label="Instagram"
                  >
                    <Image src="/icons/instagram.png" alt="" width={30} height={30} className="w-7 h-7 sm:w-8 sm:h-8" />
                  </Link>
                  <Link
                    href="https://www.tiktok.com/@unisantander.s.a"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-gray-200 p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    aria-label="TikTok"
                  >
                    <Image src="/icons/tiktok.png" alt="" width={30} height={30} className="w-7 h-7 sm:w-8 sm:h-8" />
                  </Link>
                </div>
              </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;