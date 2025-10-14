"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener el código de autorización de los parámetros de búsqueda
        const code = searchParams.get('code');

        if (code) {
          // Intercambiar el código por tokens de sesión
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Error en callback de autenticación:', error);
            setMessage('Error al confirmar la cuenta. Inténtalo de nuevo.');
          } else if (data.user) {
            setMessage('¡Cuenta confirmada exitosamente! Ahora puedes iniciar sesión.');

            // Redirigir después de 3 segundos
            setTimeout(() => {
              router.push('/');
            }, 3000);
          }
        } else {
          setMessage('Código de autorización no encontrado.');
        }
      } catch (error) {
        console.error('Error en callback:', error);
        setMessage('Error inesperado. Inténtalo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 xs:p-6 sm:p-8">
        <div className="text-center">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#196428] mx-auto mb-4"></div>
              <h2 className="text-lg xs:text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                Confirmando tu cuenta...
              </h2>
              <p className="text-sm xs:text-sm sm:text-base text-gray-600">
                Por favor espera mientras procesamos tu confirmación.
              </p>
            </>
          ) : (
            <>
              <div className={`rounded-full p-3 mx-auto mb-4 w-fit ${message.includes('Error') ? 'bg-red-100' : 'bg-green-100'}`}>
                <svg
                  className={`h-6 w-6 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {message.includes('Error') ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  )}
                </svg>
              </div>

              <h2 className={`text-lg xs:text-lg sm:text-xl font-semibold mb-2 ${message.includes('Error') ? 'text-red-800' : 'text-green-800'}`}>
                {message.includes('Error') ? 'Error de confirmación' : '¡Cuenta confirmada!'}
              </h2>

              <p className="text-sm xs:text-sm sm:text-base text-gray-600 leading-relaxed">
                {message}
              </p>

              {!message.includes('Error') && (
                <p className="text-xs xs:text-xs sm:text-sm text-gray-500 mt-3">
                  Serás redirigido automáticamente en unos segundos...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
