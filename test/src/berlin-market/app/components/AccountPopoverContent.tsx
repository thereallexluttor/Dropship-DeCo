"use client";

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, User, Mail, Phone, MapPin, Lock, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const AccountForm = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para registro
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

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
  };

  const handleGoToAccount = () => {
    router.push('/cuenta');
  };

  // Función para manejar registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (!registerEmail || !registerPassword || !nombre || !telefono || !direccion) {
      alert("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      // Crear usuario en Supabase Auth con email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            nombre: nombre,
            telefono: telefono,
            direccion: direccion
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Guardar información adicional en la tabla usuarios
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              nombre: nombre,
              correo: registerEmail,
              telefono: telefono,
              direccion: direccion,
              rol: 'cliente',
              password: registerPassword // Nota: En producción, nunca almacenes la contraseña en texto plano
            }
          ]);

        if (insertError) throw insertError;

        alert("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
        // Limpiar formulario
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
        setNombre("");
        setTelefono("");
        setDireccion("");
        setIsRegistering(false);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      alert("Error en el registro. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        alert("Inicio de sesión exitoso");
        // Aquí puedes redirigir o actualizar el estado de la aplicación
      }
    } catch (error) {
      console.error('Error en login:', error);
      alert("Error en el inicio de sesión. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si el usuario está autenticado, mostrar opciones de cuenta
  if (user) {
    return (
      <div className="w-full space-y-3 xs:space-y-3 sm:space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-gray-800">¡Hola, {user.user_metadata?.nombre || user.email}!</p>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleGoToAccount}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <User className="h-4 w-4 text-[#196428]" />
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
    );
  }

  // Si el usuario no está autenticado, mostrar formulario de login/registro
  return (
    <div className="w-full space-y-3 xs:space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-5">
      {/* Ya soy cliente */}
      {!isRegistering && (
        <div className="space-y-3 xs:space-y-3 sm:space-y-4">

          <form className="space-y-3 xs:space-y-3 sm:space-y-4" onSubmit={handleLogin}>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 xs:px-3 sm:px-4 py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm xs:text-sm sm:text-base md:text-sm transition-all duration-200"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 xs:px-3 sm:px-4 py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm xs:text-sm sm:text-base md:text-sm pr-10 xs:pr-10 sm:pr-12 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 xs:right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#196428] hover:bg-[#145020] text-white font-semibold py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg transition-all duration-200 text-sm xs:text-sm sm:text-base md:text-sm disabled:opacity-50 hover:shadow-lg"
            >
              {isLoading ? "Cargando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="flex flex-col xs:flex-col sm:flex-col space-y-2 xs:space-y-2 sm:space-y-3">
            <div className="text-center">
              <a href="#" className="text-[#196428] hover:underline text-xs xs:text-xs sm:text-sm font-medium transition-colors">
                Olvidé mi contraseña
              </a>
            </div>
            <div className="text-[10px] xs:text-[10px] sm:text-xs text-gray-600 text-center leading-tight">
              Protegido por reCAPTCHA - <a href="#" className="underline hover:text-[#196428] transition-colors">Privacidad</a> y{' '}
              <a href="#" className="underline hover:text-[#196428] transition-colors">Condiciones</a>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-300"></div>

      {/* Nuevo aquí / Formulario de registro */}
      <div className="space-y-3 xs:space-y-3 sm:space-y-4">
        {!isRegistering ? (
          <>
            <div className="text-center xs:text-center sm:text-center">
              <h2 className="text-sm xs:text-sm sm:text-base md:text-base lg:text-lg font-bold text-gray-800 mb-2 xs:mb-2 sm:mb-3">
                ¿Nuevo aquí?
              </h2>
              <p className="text-xs xs:text-xs sm:text-sm text-gray-700 mb-3 xs:mb-3 sm:mb-4">
                ¡Disfruta de beneficios exclusivos!
              </p>
            </div>

            <ul className="space-y-2 xs:space-y-2 sm:space-y-3 mb-4 xs:mb-4 sm:mb-5">
              <li className="flex items-start gap-2 xs:gap-2 sm:gap-3">
                <Check className="h-4 w-4 xs:h-4 xs:w-4 sm:h-4 sm:w-4 md:h-4 md:w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                <span className="text-xs xs:text-xs sm:text-sm text-gray-700 leading-tight">
                  Compras más <span className="font-bold">rápidas</span>
                </span>
              </li>
              <li className="flex items-start gap-2 xs:gap-2 sm:gap-3">
                <Check className="h-4 w-4 xs:h-4 xs:w-4 sm:h-4 sm:w-4 md:h-4 md:w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                <span className="text-xs xs:text-xs sm:text-sm text-gray-700 leading-tight">
                  <span className="font-bold">Historial</span> de pedidos
                </span>
              </li>
              <li className="flex items-start gap-2 xs:gap-2 sm:gap-3">
                <Check className="h-4 w-4 xs:h-4 xs:w-4 sm:h-4 sm:w-4 md:h-4 md:w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                <span className="text-xs xs:text-xs sm:text-sm text-gray-700 leading-tight">
                  <span className="font-bold">Descuentos</span> exclusivos
                </span>
              </li>
              <li className="flex items-start gap-2 xs:gap-2 sm:gap-3">
                <Check className="h-4 w-4 xs:h-4 xs:w-4 sm:h-4 sm:w-4 md:h-4 md:w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                <span className="text-xs xs:text-xs sm:text-sm text-gray-700 leading-tight">
                  <span className="font-bold">Lista</span> de deseos
                </span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className="w-full bg-[#196428] hover:bg-[#145020] text-white font-semibold py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg transition-all duration-200 text-sm xs:text-sm sm:text-base md:text-sm hover:shadow-lg"
            >
              Regístrate ahora
            </button>
          </>
        ) : (
          /* Formulario de registro */
          <div className="space-y-3 xs:space-y-3 sm:space-y-4">
            <div className="text-center xs:text-center sm:text-center mb-4 xs:mb-4 sm:mb-5">
              <h3 className="text-sm xs:text-sm sm:text-base md:text-lg font-bold text-gray-800">
                Crear cuenta
              </h3>
              <p className="text-xs xs:text-xs sm:text-sm text-gray-600 mt-1">
                Completa tus datos para registrarte
              </p>
            </div>

            <form className="space-y-3 xs:space-y-3 sm:space-y-4" onSubmit={handleRegister}>
              <div className="relative">
                <User className="absolute left-3 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 xs:px-3 sm:px-4 py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm xs:text-sm sm:text-base md:text-sm pl-10 xs:pl-10 sm:pl-12 transition-all duration-200"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-3 xs:px-3 sm:px-4 py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm xs:text-sm sm:text-base md:text-sm pl-10 xs:pl-10 sm:pl-12 transition-all duration-200"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 xs:px-3 sm:px-4 py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm xs:text-sm sm:text-base md:text-sm pl-10 xs:pl-10 sm:pl-12 transition-all duration-200"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Dirección completa"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-3 xs:px-3 sm:px-4 py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm xs:text-sm sm:text-base md:text-sm pl-10 xs:pl-10 sm:pl-12 transition-all duration-200"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-3 xs:px-3 sm:px-4 py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm xs:text-sm sm:text-base md:text-sm pl-10 xs:pl-10 sm:pl-12 pr-10 xs:pr-10 sm:pr-12 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 xs:right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 xs:px-3 sm:px-4 py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm xs:text-sm sm:text-base md:text-sm pl-10 xs:pl-10 sm:pl-12 pr-10 xs:pr-10 sm:pr-12 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 xs:right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#196428] hover:bg-[#145020] text-white font-semibold py-3 xs:py-3 sm:py-3 md:py-3 rounded-lg transition-all duration-200 text-sm xs:text-sm sm:text-base md:text-sm disabled:opacity-50 hover:shadow-lg"
              >
                {isLoading ? "Registrando..." : "Crear cuenta"}
              </button>

              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="w-full text-[#196428] hover:underline text-xs xs:text-xs sm:text-sm font-medium transition-colors text-center"
              >
                ← Volver al inicio de sesión
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPopoverContent() {
  return (
    <div className="w-full bg-[#FBFFE6] p-4 xs:p-4 sm:p-5 md:p-6 rounded-lg shadow-sm mobile-fixed-height md:mobile-fixed-height-none relative">
      {/* Indicador visual para bottom sheet en móvil */}
      <div className="md:hidden absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full"></div>
      <AccountForm />
    </div>
  );
}