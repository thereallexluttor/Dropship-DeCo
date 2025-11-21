"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, MapPin, Edit, ShoppingBag, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/app/components/MainLayout';
import dynamic from 'next/dynamic';

// Lazy load Header y Footer para reducir bundle inicial
const Header = dynamic(() => import('@/app/components/Header'), {
  ssr: false,
  loading: () => <div className="h-16 bg-white" /> // Placeholder con altura fija
});

const Footer = dynamic(() => import('@/app/components/Footer'), {
  ssr: false,
  loading: () => <div className="h-32 bg-white" /> // Placeholder con altura fija
});

// Lazy load AdminDashboard para no bloquear la carga inicial
const AdminDashboard = dynamic(() => import('@/app/components/AdminDashboard'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428] mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando panel de administración...</p>
      </div>
    </div>
  ),
  ssr: false
});

interface UserProfile {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  rol: string;
}

interface Order {
  id: string;
  pedido_id: string;
  fecha: string;
  total: number;
  estado: string;
  detalles: Array<{
    id: string;
    producto_id: string;
    producto_nombre: string;
    cantidad: number;
    subtotal: number;
  }>;
}

// Función helper para formatear precios sin ceros decimales innecesarios
const formatPrice = (price: number): string => {
  const formatted = price.toFixed(2);
  return formatted.endsWith('.00') ? price.toFixed(0) : formatted;
};

// Función helper para calcular días transcurridos desde una fecha
const calcularDiasTranscurridos = (fecha: string): number => {
  const fechaPedido = new Date(fecha);
  const fechaActual = new Date();
  fechaActual.setHours(0, 0, 0, 0);
  fechaPedido.setHours(0, 0, 0, 0);
  const diferencia = fechaActual.getTime() - fechaPedido.getTime();
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
};

// ✅ OPTIMIZACIÓN: Componente memoizado para banner promocional
const PromotionalBanner = () => (
  <div className="bg-[#196428] text-white py-1 overflow-hidden">
    <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
      <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
      <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
      <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
      <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
    </div>
  </div>
);

export default function CuentaPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);

  // Estados para edición de perfil
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editDireccion, setEditDireccion] = useState("");

  useEffect(() => {
    // Cargar usuario y pedidos en paralelo para máxima velocidad
    checkUser();
  }, []);

  // Redirigir "Nuestras Tiendas" a /contacto en esta página sin modificar Header
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href === '/#nuestras-tiendas' || href === '#nuestras-tiendas') {
        e.preventDefault();
        router.push('/contacto');
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [router]);

  const checkUser = async () => {
    try {
      // ✅ OPTIMIZACIÓN: Cargar usuario y pedidos en paralelo
      const [authResult, userResult] = await Promise.all([
        supabase.auth.getUser(),
        // Prefetch pedidos mientras obtenemos el usuario
        Promise.resolve(null)
      ]);

      const { data: { user } } = authResult;

      if (user) {
        // Obtener información del usuario desde la tabla usuarios
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('id, nombre, correo, telefono, direccion, rol')
          .eq('correo', user.email)
          .single();

        if (userData && !error) {
          setUser(userData);
          setEditedUser(userData);
          setEditNombre(userData.nombre);
          setEditTelefono(userData.telefono);
          setEditDireccion(userData.direccion);
          
          // ✅ OPTIMIZACIÓN: Mostrar página inmediatamente y cargar pedidos en paralelo
          setIsLoading(false);

          // Cargar pedidos inmediatamente sin setTimeout
          loadOrders(userData.id);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setIsLoading(false);
    }
  };

  const loadOrders = useCallback(async (userId: string) => {
    setIsLoadingOrders(true);
    try {
      // ✅ OPTIMIZACIÓN: Query optimizada - solo campos necesarios, limitado a 10
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select(`
          id,
          fecha,
          total,
          estado,
          detalle_pedido (
            id,
            producto_id,
            cantidad,
            subtotal,
            productos:producto_id (
              nombre
            )
          )
        `)
        .eq('usuario_id', userId)
        .order('fecha', { ascending: false })
        .limit(10);

      if (pedidosError) {
        console.error('Error fetching pedidos:', pedidosError);
        setOrders([]);
        setIsLoadingOrders(false);
        return;
      }

      if (!pedidosData || pedidosData.length === 0) {
        setOrders([]);
        setIsLoadingOrders(false);
        return;
      }

      // ✅ OPTIMIZACIÓN: Procesar datos de forma eficiente
      const ordersWithDetails: Order[] = pedidosData.map((pedido: any) => ({
        id: pedido.id,
        pedido_id: pedido.id,
        fecha: pedido.fecha,
        total: pedido.total,
        estado: pedido.estado,
        detalles: (pedido.detalle_pedido || []).map((detalle: any) => ({
          id: detalle.id,
          producto_id: detalle.producto_id,
          producto_nombre: detalle.productos?.nombre || 'Producto desconocido',
          cantidad: detalle.cantidad,
          subtotal: detalle.subtotal
        }))
      }));

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const handleUpdateProfile = useCallback(async () => {
    if (!user || !editedUser) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: editNombre,
          telefono: editTelefono,
          direccion: editDireccion
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, nombre: editNombre, telefono: editTelefono, direccion: editDireccion });
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    }
  }, [user, editedUser, editNombre, editTelefono, editDireccion]);

  const handleCancelEdit = useCallback(() => {
    if (user) {
      setEditNombre(user.nombre);
      setEditTelefono(user.telefono);
      setEditDireccion(user.direccion);
    }
    setIsEditing(false);
  }, [user]);

  // ✅ OPTIMIZACIÓN: Skeleton loading en lugar de spinner para mejor UX
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
          <PromotionalBanner />
          <Header />
          <main className="py-16 sm:py-20 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
              {/* Skeleton para título */}
              <div className="mb-12">
                <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse"></div>
              </div>
              {/* Skeleton para tabs */}
              <div className="mb-8">
                <div className="flex gap-4 justify-center">
                  <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                </div>
              </div>
              {/* Skeleton para card */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="space-y-6">
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
          <PromotionalBanner />
          <Header />

          <main className="py-16 sm:py-20 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
              <div className="text-center">
                <div className="mb-8">
                  <User className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                  <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
                    Acceso no autorizado
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Debes iniciar sesión para acceder a tu cuenta personal y revisar tu información y compras.
                  </p>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
        <PromotionalBanner />
        <Header />

        <main className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            {/* Breadcrumb */}
            <div className="mb-12">
              <nav className="flex items-center text-sm text-gray-500">
                <a href="/" className="hover:text-gray-700 transition-colors">
                  Inicio
                </a>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Mi Cuenta</span>
              </nav>
            </div>

            {/* Page Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-12 text-center" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
              {user.rol === 'admin' ? 'Panel de Administración' : 'Mi Cuenta'}
            </h1>

            {/* Admin Dashboard or User Content */}
            {user.rol === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Tabs defaultValue="perfil" className="space-y-8">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                  <TabsTrigger value="perfil" className="text-sm sm:text-base">Información Personal</TabsTrigger>
                  <TabsTrigger value="compras" className="text-sm sm:text-base">Historial de Compras</TabsTrigger>
                </TabsList>

                <TabsContent value="perfil" className="space-y-8">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                        <User className="h-5 w-5" />
                        Información Personal
                      </CardTitle>
                      <CardDescription className="text-base">
                        Revisa y actualiza tu información personal
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!isEditing ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <User className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">{user.nombre}</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
                              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">{user.correo}</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-sm font-medium text-gray-700">Teléfono</label>
                              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">{user.telefono}</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-sm font-medium text-gray-700">Dirección</label>
                              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-900">{user.direccion}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-4">
                            <Button
                              onClick={() => setIsEditing(true)}
                              className="bg-[#196428] hover:bg-[#145020] text-white px-6 py-2"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Información
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                              <Input
                                value={editNombre}
                                onChange={(e) => setEditNombre(e.target.value)}
                                className="h-11"
                                placeholder="Ingresa tu nombre completo"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Teléfono</label>
                              <Input
                                value={editTelefono}
                                onChange={(e) => setEditTelefono(e.target.value)}
                                className="h-11"
                                placeholder="Ingresa tu número de teléfono"
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-medium text-gray-700">Dirección</label>
                              <Input
                                value={editDireccion}
                                onChange={(e) => setEditDireccion(e.target.value)}
                                className="h-11"
                                placeholder="Ingresa tu dirección completa"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-4">
                            <Button
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="px-6 py-2"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleUpdateProfile}
                              className="bg-[#196428] hover:bg-[#145020] text-white px-6 py-2"
                            >
                              Guardar Cambios
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="compras" className="space-y-8">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                        <ShoppingBag className="h-5 w-5" />
                        Historial de Compras
                      </CardTitle>
                      <CardDescription className="text-base">
                        Revisa todas tus compras realizadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingOrders ? (
                        <div className="space-y-4">
                          {[1, 2].map((i) => (
                            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                          ))}
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">Aún no tienes compras registradas</p>
                          <p className="text-gray-400 text-sm mt-2">Tus pedidos aparecerán aquí una vez que realices tu primera compra</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {orders.map((order) => (
                            <Card key={order.pedido_id} className="border-l-4 border-l-[#196428] shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white to-green-50/30">
                              <CardContent className="p-8">
                                {/* Header de la Card */}
                                <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
                                  <div className="flex items-start gap-4">
                                    <div className="bg-[#196428] text-white p-3 rounded-full">
                                      <ShoppingBag className="h-6 w-6" />
                                    </div>
                                  <div>
                                      <div className="flex items-center gap-3 mb-2">
                                        <p className="font-bold text-2xl text-gray-900">Pedido #{order.pedido_id}</p>
                                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${
                                          order.estado === 'completado' || order.estado === 'Entregado'
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : order.estado === 'en_transito' || order.estado === 'En tránsito'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : order.estado === 'pendiente'
                                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                            : order.estado === 'cancelado'
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                          {order.estado === 'completado' ? '✓ Completado' :
                                           order.estado === 'en_transito' ? '🚚 En tránsito' :
                                           order.estado === 'pendiente' ? '⏳ Pendiente' :
                                           order.estado === 'cancelado' ? '❌ Cancelado' :
                                           order.estado}
                                        </span>
                                      </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                                        <Calendar className="h-4 w-4 text-[#196428]" />
                                        <span className="font-medium">
                                      {new Date(order.fecha).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                        {(() => {
                                          const diasTranscurridos = calcularDiasTranscurridos(order.fecha);
                                          return (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                              {diasTranscurridos === 0 
                                                ? 'Hoy' 
                                                : diasTranscurridos === 1 
                                                ? 'Hace 1 día' 
                                                : `Hace ${diasTranscurridos} días`}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right lg:text-center">
                                    <div className="bg-[#196428] text-white px-4 py-2 rounded-xl shadow-lg">
                                      <p className="text-xs font-medium text-green-100 mb-1">Total del Pedido</p>
                                      <p className="font-black text-2xl">${formatPrice(order.total)}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Separador elegante */}
                                <div className="relative mb-6">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                  </div>
                                  <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">Detalles del Pedido</span>
                                  </div>
                                </div>

                                {/* Lista de Productos */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                      <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11h8l.64 5.12a2 2 0 01-1.96 2.38H9.32a2 2 0 01-1.96-2.38L8 11z" />
                                      </svg>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">Productos ({order.detalles.length})</p>
                                  </div>

                                  <div className="grid gap-3">
                                    {order.detalles.map((detalle, index) => (
                                      <div key={detalle.id} className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-[#196428] hover:shadow-md transition-all duration-200">
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center gap-3">
                                            <div className="bg-green-50 text-[#196428] p-2 rounded-lg group-hover:bg-[#196428] group-hover:text-white transition-colors duration-200">
                                              <span className="text-sm font-bold">{index + 1}</span>
                                            </div>
                                        <div>
                                              <span className="font-semibold text-gray-900 text-lg block group-hover:text-[#196428] transition-colors duration-200">
                                                {detalle.producto_nombre}
                                              </span>
                                              <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                  Cantidad: {detalle.cantidad}
                                                </span>
                                                {detalle.cantidad > 1 && (
                                                  <span className="text-xs text-gray-500">
                                                    (${formatPrice(detalle.subtotal / detalle.cantidad)} c/u)
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <span className="font-bold text-[#196428] text-xl">${formatPrice(detalle.subtotal)}</span>
                                          </div>
                                        </div>

                                        {/* Línea decorativa al final de cada producto */}
                                        {index < order.detalles.length - 1 && (
                                          <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Footer de la Card */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                  <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span className="font-medium">
                                      {order.detalles.length} producto{order.detalles.length !== 1 ? 's' : ''} en este pedido
                                    </span>
                                    <span className="font-medium">
                                      ID: #{order.pedido_id}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  );
}
