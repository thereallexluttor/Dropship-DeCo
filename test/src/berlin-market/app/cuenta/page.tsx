"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, MapPin, Edit, ShoppingBag, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/app/components/MainLayout';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AdminDashboard from '@/app/components/AdminDashboard';

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
  fecha: string;
  total: number;
  estado: string;
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}

export default function CuentaPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);

  // Estados para edición de perfil
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editDireccion, setEditDireccion] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Obtener información del usuario desde la tabla usuarios
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('correo', user.email)
        .single();

      if (userData && !error) {
        setUser(userData);
        setEditedUser(userData);
        setEditNombre(userData.nombre);
        setEditTelefono(userData.telefono);
        setEditDireccion(userData.direccion);

        // Obtener historial de compras (simulado por ahora)
        await loadOrders(userData.id);
      }
    }
    setIsLoading(false);
  };

  const loadOrders = async (userId: string) => {
    // Simulación de datos de pedidos - en producción esto vendría de una tabla de pedidos
    const mockOrders: Order[] = [
      {
        id: '001',
        fecha: '2024-01-15',
        total: 89.99,
        estado: 'Entregado',
        productos: [
          { nombre: 'Alimento para perros premium', cantidad: 2, precio: 44.99 }
        ]
      },
      {
        id: '002',
        fecha: '2024-01-10',
        total: 156.50,
        estado: 'En tránsito',
        productos: [
          { nombre: 'Juguete para gatos', cantidad: 1, precio: 25.99 },
          { nombre: 'Arena sanitaria', cantidad: 3, precio: 43.50 }
        ]
      }
    ];
    setOrders(mockOrders);
  };

  const handleUpdateProfile = async () => {
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
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditNombre(user.nombre);
      setEditTelefono(user.telefono);
      setEditDireccion(user.direccion);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
          <div className="bg-[#196428] text-white py-1 overflow-hidden">
            <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
              <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
              <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
              <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
              <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            </div>
          </div>
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428] mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
          </div>
          <Footer />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
          {/* Promotional Banner */}
          <div className="bg-[#196428] text-white py-1 overflow-hidden">
            <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
              <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
              <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
              <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
              <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            </div>
          </div>

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
        {/* Promotional Banner */}
        <div className="bg-[#196428] text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
          </div>
        </div>

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
                      {orders.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">Aún no tienes compras registradas</p>
                          <p className="text-gray-400 text-sm mt-2">Tus pedidos aparecerán aquí una vez que realices tu primera compra</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {orders.map((order) => (
                            <Card key={order.id} className="border-l-4 border-l-[#196428] shadow-sm">
                              <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                  <div>
                                    <p className="font-semibold text-xl text-gray-900 mb-1">Pedido #{order.id}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(order.fecha).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-xl text-gray-900 mb-2">€{order.total.toFixed(2)}</p>
                                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                                      order.estado === 'Entregado'
                                        ? 'bg-green-100 text-green-800'
                                        : order.estado === 'En tránsito'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {order.estado}
                                    </span>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <p className="text-sm font-medium text-gray-700 mb-3">Productos incluidos:</p>
                                  <div className="space-y-3">
                                    {order.productos.map((producto, index) => (
                                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                          <span className="font-medium text-gray-900">{producto.nombre}</span>
                                          <span className="text-sm text-gray-600 ml-2">Cantidad: {producto.cantidad}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">€{(producto.precio * producto.cantidad).toFixed(2)}</span>
                                      </div>
                                    ))}
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
