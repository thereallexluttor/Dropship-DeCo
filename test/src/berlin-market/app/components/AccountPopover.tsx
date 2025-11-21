"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import AccountPopoverContent from "./AccountPopoverContent";

export default function AccountPopover() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    checkAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    alert("Sesión cerrada exitosamente");
    // Redirigir a inicio después de cerrar sesión
    router.push('/');
  };

  const handleGoToAccount = () => {
    router.push('/cuenta');
  };

  // ✅ OPTIMIZACIÓN: Prefetching agresivo - prefetch cuando el popover se abre
  React.useEffect(() => {
    if (isOpen && user) {
      router.prefetch('/cuenta');
    }
  }, [isOpen, user, router]);

  // ✅ OPTIMIZACIÓN: Prefetch en hover para máxima velocidad
  const handleMouseEnter = () => {
    if (user) {
      router.prefetch('/cuenta');
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        closeRef.current?.click();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Si el usuario NO está autenticado, mostrar popover de login/registro
  if (!user) {
    return (
      <Popover onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="group flex flex-col items-center justify-center cursor-pointer bg-transparent border-none p-0 outline-none"
          >
            <div className={`h-4 w-4 transition-colors group-hover:text-[#196428] ${isOpen ? 'text-[#196428]' : 'text-gray-500'}`}>
              <User className="h-full w-full" />
            </div>
            <span className={`text-xs font-light mt-1 transition-colors group-hover:text-[#196428] ${isOpen ? 'text-[#196428]' : 'text-gray-500'}`}>
              Cuenta
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none shadow-xl z-[9999] w-auto" align="center" sideOffset={8}>
          <AccountPopoverContent />
        </PopoverContent>
        <PopoverClose ref={closeRef} className="hidden" />
      </Popover>
    );
  }

  // Si el usuario está autenticado, mostrar menú de usuario
  return (
    <Popover onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex flex-col items-center justify-center cursor-pointer bg-transparent border-none p-0 outline-none"
        >
          <div className={`h-5 w-5 transition-colors group-hover:text-[#196428] ${isOpen ? 'text-[#196428]' : 'text-gray-500'} bg-gray-200 rounded-full flex items-center justify-center`}>
            <span className="text-xs font-medium text-gray-700">
              {(user.user_metadata?.nombre || user.email || 'U')[0].toUpperCase()}
            </span>
          </div>
          <span className={`text-xs font-light mt-1 transition-colors group-hover:text-[#196428] ${isOpen ? 'text-[#196428]' : 'text-gray-500'}`}>
            Cuenta
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 border-none shadow-xl z-[9999] w-auto" align="center" sideOffset={8}>
        <div className="w-full bg-[#FBFFE6] p-4 xs:p-4 sm:p-5 md:p-6 rounded-lg shadow-sm">
          <div className="w-full space-y-3">
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-gray-800">
                ¡Hola, {user.user_metadata?.nombre || 'Usuario'}!
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleGoToAccount}
                onMouseEnter={handleMouseEnter}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4 text-[#196428]" />
                <span className="text-sm font-medium">Mi Cuenta</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
      <PopoverClose ref={closeRef} className="hidden" />
    </Popover>
  );
}