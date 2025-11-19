"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import supabase, { Categoria, Subcategoria, Producto, Marca, TamanoProducto, ProductoStock, UI, SobreNosotros, Tienda } from '@/lib/supabase';
import { Trabajo, Aplicacion, actualizarEstadoAplicacion, crearTrabajo, editarTrabajo, obtenerTrabajos } from '@/lib/vacantes';

interface AplicacionConTrabajo {
  id: number;
  trabajo_id: number;
  nombre_aplicante: string;
  email_aplicante: string;
  telefono_aplicante: string;
  experiencia_laboral: string;
  disponibilidad: string;
  mensaje: string;
  cv_url: string;
  estado: string;
  fecha_aplicacion: string;
  fecha_revision: string | null;
  notas_revision: string | null;
  trabajos?: {
    titulo?: string;
    departamento?: string;
    ubicacion?: string;
  }[];
}

// Tipos para formularios internos
interface ProductoForm {
  subcategorias_id: number
  nombre: string
  descripcion: string
  imagen_url: string
  descuento: boolean
  descuento_valor: string
  destacado: boolean
  novedad: boolean
  id_marca: number
  stocks: ProductoStock[]  // Nuevo campo que combina tamaño, precio y stock
  // Campos antiguos mantenidos para compatibilidad durante la transición
  tamano: TamanoProducto[]
  precios: number[]
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X, FolderPlus, FolderOpen, Package, Tag, Layout, ChevronUp, ChevronDown, Briefcase, Users, FileText, Eye, Download, MapPin, ShoppingBag, ClipboardList, Search, TrendingUp, DollarSign, BarChart3, PieChart, Activity } from 'lucide-react';

// Función helper para formatear precios sin ceros decimales innecesarios
const formatPrice = (price: number): string => {
  const formatted = price.toFixed(2);
  return formatted.endsWith('.00') ? price.toFixed(0) : formatted;
};

// Función helper para formatear números con separadores de miles
const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString('es-ES');
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

const AdminDashboard = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [uiElements, setUiElements] = useState<UI[]>([]);
  const [sobreNosotros, setSobreNosotros] = useState<SobreNosotros | null>(null);
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [aplicaciones, setAplicaciones] = useState<any[]>([]);
  const [selectedTrabajo, setSelectedTrabajo] = useState<Trabajo | null>(null);
  const [trabajoAplicaciones, setTrabajoAplicaciones] = useState<any[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [aliados, setAliados] = useState<{id: number, nombre: string, imagen_url: string, created_at?: string}[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [filtroEstadoPedidos, setFiltroEstadoPedidos] = useState<string>('todos');
  const [pedidoSearch, setPedidoSearch] = useState<string>('');
  const [paginaPedidos, setPaginaPedidos] = useState<number>(1);
  const pedidosPorPagina = 5;
  const [filtroCategoriaSubcategorias, setFiltroCategoriaSubcategorias] = useState<number>(0);
  const [busquedaSubcategorias, setBusquedaSubcategorias] = useState<string>('');
  const [busquedaProductos, setBusquedaProductos] = useState<string>('');
  const [filtroCategoriaProductos, setFiltroCategoriaProductos] = useState<number>(0);
  const [filtroSubcategoriaProductos, setFiltroSubcategoriaProductos] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tablesConfigured, setTablesConfigured] = useState<boolean | null>(null);

  // Estado para el modal del CV
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [currentCvUrl, setCurrentCvUrl] = useState<string>('');

  // Estados para crear/editar trabajos
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Trabajo | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Estados para el formulario de trabajo
  const [jobFormData, setJobFormData] = useState<{
    titulo: string;
    departamento: string;
    ubicacion: string;
    tipo_contrato: string;
    salario: string;
    descripcion: string;
    requisitos: string[];
    beneficios: string[];
    activo: boolean;
  }>({
    titulo: '',
    departamento: '',
    ubicacion: '',
    tipo_contrato: '',
    salario: '',
    descripcion: '',
    requisitos: [],
    beneficios: [],
    activo: true
  })

  // Estados para formularios
  const [newCategoria, setNewCategoria] = useState({
    nombre: '',
    descripcion: '',
    imagen_marca1: '',
    imagen_marca2: '',
    imagen_marca3: '',
    categoria_imagen: ''
  });
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [newSubcategoria, setNewSubcategoria] = useState({ categories_id: 0, nombre: '', descripcion: '' });
  const [editingSubcategoria, setEditingSubcategoria] = useState<Subcategoria | null>(null);
  const [newProducto, setNewProducto] = useState<ProductoForm>({
    subcategorias_id: 0,
    nombre: '',
    descripcion: '',
    imagen_url: '',
    descuento: false,
    descuento_valor: '',
    destacado: false,
    novedad: false,
    id_marca: 0,
    stocks: [],  // Nuevo campo stocks inicializado vacío
    tamano: [],
    precios: []
  });
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [newMarca, setNewMarca] = useState({ nombre_marca: '' });
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null);
  const [newUI, setNewUI] = useState<UI>({
    banner: [],
    hiddenbanner: [],
    popup: null
  });
  const [editingUI, setEditingUI] = useState<UI | null>(null);
  const [editingSobreNosotros, setEditingSobreNosotros] = useState<SobreNosotros | null>(null);
  const [uiCategory, setUiCategory] = useState<'inicio' | 'sobre-nosotros'>('inicio');
  const [imageUploading, setImageUploading] = useState(false);
  const [newTienda, setNewTienda] = useState<Omit<Tienda, 'id' | 'created_at' | 'updated_at'>>({
    nombre: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    contacto: '',
    lat: 0,
    lng: 0
  });
  const [editingTienda, setEditingTienda] = useState<Tienda | null>(null);
  const [newAliado, setNewAliado] = useState<{ nombre: string; imagen_url: string }>({
    nombre: '',
    imagen_url: ''
  });
  const [editingAliado, setEditingAliado] = useState<{id: number, nombre: string, imagen_url: string} | null>(null);

  // Forzar actualización de tipos
  useEffect(() => {}, []);

  useEffect(() => {
    loadData();
  }, []);

  // Función para cargar pedidos con detalles
  // Función para cancelar automáticamente pedidos pendientes con más de 7 días
  const cancelarPedidosVencidos = async () => {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 7);
      fechaLimite.setHours(0, 0, 0, 0);

      // Buscar pedidos pendientes con más de 7 días
      const { data: pedidosVencidos, error: errorBusqueda } = await supabase
        .from('pedidos')
        .select('id')
        .eq('estado', 'pendiente')
        .lt('fecha', fechaLimite.toISOString());

      if (errorBusqueda) {
        console.error('❌ Error buscando pedidos vencidos:', errorBusqueda);
        return;
      }

      if (pedidosVencidos && pedidosVencidos.length > 0) {
        console.log(`🔄 Cancelando ${pedidosVencidos.length} pedido(s) vencido(s)...`);
        
        // Actualizar todos los pedidos vencidos a cancelado
        const { error: errorActualizacion } = await supabase
          .from('pedidos')
          .update({ estado: 'cancelado' })
          .in('id', pedidosVencidos.map(p => p.id));

        if (errorActualizacion) {
          console.error('❌ Error cancelando pedidos vencidos:', errorActualizacion);
        } else {
          console.log(`✅ ${pedidosVencidos.length} pedido(s) cancelado(s) automáticamente`);
        }
      }
    } catch (error) {
      console.error('❌ Error inesperado cancelando pedidos vencidos:', error);
    }
  };

  const loadPedidos = async () => {
    console.log('🔄 Cargando pedidos desde Supabase...');
    
    // Primero cancelar pedidos vencidos automáticamente
    await cancelarPedidosVencidos();
    
    try {
      // Intentar usar función RPC primero (más eficiente)
      const { data: pedidosData, error: pedidosError } = await supabase
        .rpc('get_pedidos_with_details');

      if (pedidosError) {
        console.log('⚠️ RPC no disponible, usando consulta directa...');
        
        // Fallback: Consulta directa con joins
        const { data: detallesData, error: detallesError } = await supabase
          .from('detalle_pedido')
          .select(`
            id,
            pedido_id,
            producto_id,
            cantidad,
            subtotal,
            tamano_index,
            productos:producto_id (
              nombre,
              imagen_url
            ),
            pedidos:pedido_id (
              id,
              usuario_id,
              fecha,
              total,
              estado,
              Direccion,
              usuarios:usuario_id (
                nombre,
                correo,
                telefono,
                direccion
              )
            )
          `)
          .order('pedido_id', { ascending: false });

        if (detallesError) {
          console.error('❌ Error cargando pedidos:', detallesError);
          if (detallesError.message.includes('relation "pedidos" does not exist') ||
              detallesError.message.includes('relation "detalle_pedido" does not exist')) {
            console.error('❌ Las tablas de pedidos no existen en la base de datos');
          }
          setPedidos([]);
          return;
        }

        // Transformar datos al formato esperado
        const pedidosTransformados = (detallesData || []).map((detalle: any) => ({
          id_detalle_pedido: detalle.id,
          pedido_id: detalle.pedido_id,
          nombre: detalle.pedidos?.usuarios?.nombre || '',
          correo: detalle.pedidos?.usuarios?.correo || '',
          telefono: detalle.pedidos?.usuarios?.telefono || '',
          direccion: detalle.pedidos?.Direccion || detalle.pedidos?.usuarios?.direccion || '',
          producto_id: detalle.producto_id,
          nombre_producto: detalle.productos?.nombre || '',
          imagen_producto: detalle.productos?.imagen_url || '',
          cantidad: detalle.cantidad,
          subtotal: detalle.subtotal,
          tamano_index: detalle.tamano_index || 0,
          estado_pedido: detalle.pedidos?.estado || '',
          fecha: detalle.pedidos?.fecha || '',
          total: detalle.pedidos?.total || 0
        }));

        console.log('✅ Pedidos cargados exitosamente:', pedidosTransformados.length, 'detalles');
        setPedidos(pedidosTransformados);
      } else {
        console.log('✅ Pedidos cargados desde RPC:', pedidosData?.length || 0, 'detalles');
        setPedidos(pedidosData || []);
      }
    } catch (error) {
      console.error('❌ Error inesperado cargando pedidos:', error);
      setPedidos([]);
    }
  };

  // Función auxiliar para actualizar stocks de un pedido
  const actualizarStocksPedido = async (pedidoId: number, operacion: 'restar' | 'sumar') => {
    // Obtener los detalles del pedido con los productos
    const { data: detallesPedido, error: detallesError } = await supabase
      .from('detalle_pedido')
      .select('producto_id, cantidad, tamano_index')
      .eq('pedido_id', pedidoId);

    if (detallesError) {
      console.error('Error obteniendo detalles del pedido:', detallesError);
      throw new Error('Error al obtener los detalles del pedido');
    }

    if (!detallesPedido || detallesPedido.length === 0) {
      console.error('No se encontraron productos en el pedido');
      throw new Error('No se encontraron productos en el pedido');
    }

    // Actualizar el stock de cada producto
    for (const detalle of detallesPedido) {
      const { producto_id, cantidad, tamano_index } = detalle;
      const sizeIndex = tamano_index || 0;

      // Obtener el producto actual
      const { data: producto, error: productoError } = await supabase
        .from('productos')
        .select('stocks')
        .eq('id', producto_id)
        .single();

      if (productoError) {
        console.error(`Error obteniendo producto ${producto_id}:`, productoError);
        throw new Error(`Error al obtener el producto ID ${producto_id}`);
      }

      if (!producto || !producto.stocks || producto.stocks.length === 0) {
        console.warn(`Producto ${producto_id} no tiene stocks definidos`);
        continue;
      }

      // Actualizar el stock del tamaño específico
      const stocksActualizados = [...producto.stocks];

      if (sizeIndex >= 0 && sizeIndex < stocksActualizados.length) {
        const stockActual = stocksActualizados[sizeIndex].stock || 0;
        let nuevoStock;

        if (operacion === 'restar') {
          nuevoStock = Math.max(0, stockActual - cantidad);
        } else {
          nuevoStock = stockActual + cantidad;
        }

        stocksActualizados[sizeIndex] = {
          ...stocksActualizados[sizeIndex],
          stock: nuevoStock
        };

        // Actualizar en la base de datos
        const { error: updateError } = await supabase
          .from('productos')
          .update({ stocks: stocksActualizados })
          .eq('id', producto_id);

        if (updateError) {
          console.error(`Error actualizando stock del producto ${producto_id}:`, updateError);
          throw new Error(`Error al actualizar el stock del producto ID ${producto_id}`);
        }

        const operacionTexto = operacion === 'restar' ? 'restado' : 'sumado';
        console.log(`✅ Stock ${operacionTexto} para producto ${producto_id}, tamaño ${sizeIndex}: ${stockActual} -> ${nuevoStock}`);
      } else {
        console.warn(`Índice de tamaño ${sizeIndex} fuera de rango para producto ${producto_id}`);
      }
    }
  };

  // Función para actualizar el estado de un pedido
  const handleUpdateEstadoPedido = async (pedidoId: number, nuevoEstado: string) => {
    try {
      // Obtener el estado actual del pedido
      const pedidoActual = pedidos.find(p => p.pedido_id === pedidoId);
      const estadoActual = pedidoActual?.estado_pedido;

      if (!estadoActual) {
        console.error('No se pudo encontrar el estado actual del pedido');
        alert('Error: No se pudo determinar el estado actual del pedido');
        return;
      }

      // Determinar si necesitamos actualizar stocks
      const necesitaActualizarStock =
        (estadoActual === 'pendiente' && nuevoEstado === 'pagado') || // Pago realizado
        (estadoActual === 'pagado' && nuevoEstado === 'pendiente');   // Pago revertido

      // Actualizar stocks si es necesario
      if (necesitaActualizarStock) {
        const operacion = nuevoEstado === 'pagado' ? 'restar' : 'sumar';
        await actualizarStocksPedido(pedidoId, operacion);
      }

      // Actualizar el estado del pedido
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', pedidoId);

      if (error) {
        console.error('Error actualizando estado del pedido:', error);
        alert('Error al actualizar el estado del pedido');
        return;
      }

      // Actualizar estado local
      setPedidos(pedidos.map(p =>
        p.pedido_id === pedidoId
          ? { ...p, estado_pedido: nuevoEstado }
          : p
      ));

      console.log(`✅ Pedido ${pedidoId} actualizado a: ${nuevoEstado}`);

      // Enviar correo de seguimiento si el nuevo estado lo requiere
      const estadosConCorreo = ['pagado', 'enviado', 'entregado'];
      if (estadosConCorreo.includes(nuevoEstado)) {
        try {
          // Agrupar productos del pedido
          const productosDelPedido = pedidos
            .filter(p => p.pedido_id === pedidoId)
            .map(p => ({
              nombre: p.nombre_producto,
              nombre_producto: p.nombre_producto,
              cantidad: p.cantidad,
              quantity: p.cantidad,
              subtotal: p.subtotal,
              unitPrice: p.subtotal / p.cantidad
            }));

          // Obtener información del cliente del primer producto del pedido
          const pedidoInfo = pedidos.find(p => p.pedido_id === pedidoId);
          
          if (pedidoInfo && pedidoInfo.correo) {
            // Preparar datos para el correo
            const emailData = {
              userEmail: pedidoInfo.correo,
              userName: pedidoInfo.nombre || '',
              orderId: pedidoId.toString(),
              orderDate: pedidoInfo.fecha || new Date().toISOString(),
              totalAmount: pedidoInfo.total || 0,
              items: productosDelPedido,
              orderStatus: nuevoEstado,
              address: pedidoInfo.direccion || ''
            };

            // Enviar correo de seguimiento
            const emailResponse = await fetch('/api/send-order-status-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailData)
            });

            if (emailResponse.ok) {
              console.log(`✅ Correo de seguimiento enviado para pedido #${pedidoId}`);
            } else {
              const errorData = await emailResponse.json();
              console.error('Error enviando correo de seguimiento:', errorData);
              // No bloquear la actualización del estado si falla el correo
            }
          } else {
            console.warn(`⚠️ No se encontró correo para pedido #${pedidoId}, no se enviará correo de seguimiento`);
          }
        } catch (emailError) {
          console.error('Error al enviar correo de seguimiento:', emailError);
          // No bloquear la actualización del estado si falla el correo
        }
      }

      // Mostrar mensajes según el tipo de cambio
      if (nuevoEstado === 'pagado') {
        alert('Pedido marcado como pagado y stocks actualizados correctamente. Se ha enviado un correo de confirmación al cliente.');
      } else if (nuevoEstado === 'pendiente' && estadoActual === 'pagado') {
        alert('Estado cambiado a pendiente y stocks restituidos correctamente');
      } else if (nuevoEstado === 'enviado') {
        alert('Pedido marcado como enviado. Se ha enviado un correo de seguimiento al cliente.');
      } else if (nuevoEstado === 'entregado') {
        alert('Pedido marcado como entregado. Se ha enviado un correo de confirmación al cliente.');
      }
    } catch (error) {
      console.error('Error inesperado actualizando pedido:', error);
      alert('Error al actualizar el pedido');
    }
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'text-yellow-600';
      case 'pagado': return 'text-blue-600';
      case 'enviado': return 'text-purple-600';
      case 'entregado': return 'text-green-600';
      case 'cancelado': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Función para obtener el nombre del estado
  const getEstadoNombre = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'pagado': return 'Pagado';
      case 'enviado': return 'Enviado';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  // Función para obtener los pedidos filtrados por estado (únicos por pedido_id)
  const getPedidosFiltrados = () => {
    let pedidosFiltrados = filtroEstadoPedidos === 'todos' 
      ? pedidos 
      : pedidos.filter(pedido => pedido.estado_pedido === filtroEstadoPedidos);
    
    // Ordenar por fecha descendente (más recientes primero)
    return pedidosFiltrados.sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return fechaB - fechaA; // Descendente (más reciente primero)
    });
  };

  // Función para obtener pedidos paginados
  const getPedidosPaginados = () => {
    const pedidosFiltrados = getPedidosFiltrados();
    const inicio = (paginaPedidos - 1) * pedidosPorPagina;
    const fin = inicio + pedidosPorPagina;
    return pedidosFiltrados.slice(inicio, fin);
  };

  // Función para obtener el total de páginas
  const getTotalPaginasPedidos = () => {
    const totalPedidos = getPedidosFiltrados().length;
    return Math.ceil(totalPedidos / pedidosPorPagina);
  };

  // Función para obtener el contador de pedidos únicos por estado (no productos)
  const getContadorPedidosPorEstado = (estado: string) => {
    const pedidosUnicos = new Set();
    pedidos.forEach(pedido => {
      if (estado === 'todos' || pedido.estado_pedido === estado) {
        pedidosUnicos.add(pedido.pedido_id);
      }
    });
    return pedidosUnicos.size;
  };

  // Función para obtener el color del filtro activo
  const getFiltroPedidosColor = (estado: string) => {
    if (filtroEstadoPedidos === estado || (filtroEstadoPedidos === 'todos' && estado === 'todos')) {
      return 'bg-[#196428] text-white hover:bg-[#145020]';
    }
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  // Funciones para calcular métricas de analítica
  const calcularMetricasPedidos = () => {
    // Obtener pedidos únicos
    const pedidosUnicos = new Map<number, any>();
    pedidos.forEach(p => {
      if (!pedidosUnicos.has(p.pedido_id)) {
        pedidosUnicos.set(p.pedido_id, {
          pedido_id: p.pedido_id,
          total: p.total,
          estado: p.estado_pedido,
          fecha: p.fecha
        });
      }
    });
    const pedidosArray = Array.from(pedidosUnicos.values());

    // Total de pedidos
    const totalPedidos = pedidosArray.length;

    // Pedidos por estado
    const pedidosPorEstado = pedidosArray.reduce((acc: any, p: any) => {
      const estado = p.estado || 'sin_estado';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    // Ingresos totales (solo pedidos pagados, enviados o entregados)
    const estadosPagados = ['pagado', 'enviado', 'entregado'];
    const ingresosTotales = pedidosArray
      .filter((p: any) => estadosPagados.includes(p.estado))
      .reduce((sum: number, p: any) => sum + (p.total || 0), 0);

    // Promedio de valor por pedido
    const promedioValor = totalPedidos > 0 
      ? pedidosArray.reduce((sum: number, p: any) => sum + (p.total || 0), 0) / totalPedidos 
      : 0;

    // Pedidos por mes (últimos 6 meses)
    const ahora = new Date();
    const pedidosPorMes: { [key: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesKey = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
      pedidosPorMes[mesKey] = 0;
    }

    pedidosArray.forEach((p: any) => {
      if (p.fecha) {
        const fechaPedido = new Date(p.fecha);
        const mesKey = fechaPedido.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
        if (pedidosPorMes[mesKey] !== undefined) {
          pedidosPorMes[mesKey]++;
        }
      }
    });

    // Tasa de cancelación
    const pedidosCancelados = pedidosPorEstado['cancelado'] || 0;
    const tasaCancelacion = totalPedidos > 0 ? (pedidosCancelados / totalPedidos) * 100 : 0;

    return {
      totalPedidos,
      pedidosPorEstado,
      ingresosTotales,
      promedioValor,
      pedidosPorMes,
      tasaCancelacion
    };
  };

  const calcularMetricasProductos = () => {
    // Agrupar productos vendidos
    const productosVendidos = new Map<number, {
      producto_id: number;
      nombre: string;
      cantidad: number;
      ingresos: number;
    }>();

    pedidos.forEach(p => {
      if (p.producto_id && p.nombre_producto) {
        const productoId = p.producto_id;
        if (!productosVendidos.has(productoId)) {
          productosVendidos.set(productoId, {
            producto_id: productoId,
            nombre: p.nombre_producto,
            cantidad: 0,
            ingresos: 0
          });
        }
        const producto = productosVendidos.get(productoId)!;
        producto.cantidad += p.cantidad || 0;
        // Solo contar ingresos de pedidos pagados, enviados o entregados
        if (['pagado', 'enviado', 'entregado'].includes(p.estado_pedido)) {
          producto.ingresos += p.subtotal || 0;
        }
      }
    });

    const productosArray = Array.from(productosVendidos.values());
    
    // Total de unidades vendidas
    const totalUnidades = productosArray.reduce((sum, p) => sum + p.cantidad, 0);

    // Top 10 productos más vendidos por cantidad
    const topProductosCantidad = [...productosArray]
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    // Top 10 productos por ingresos
    const topProductosIngresos = [...productosArray]
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 10);

    return {
      totalUnidades,
      totalProductosUnicos: productosArray.length,
      topProductosCantidad,
      topProductosIngresos
    };
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar categorías
      const { data: categoriasData, error: categoriasError} = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (categoriasError) {
        console.error('Error cargando categorías:', categoriasError);
        // Si la tabla no existe, mostrar mensaje informativo
        if (categoriasError.message.includes('relation "categories" does not exist')) {
          setTablesConfigured(false);
          setIsLoading(false);
          return;
        }
        throw categoriasError;
      }
      setCategorias(categoriasData || []);
      setTablesConfigured(true);

      // Cargar subcategorías
      const { data: subcategoriasData, error: subcategoriasError } = await supabase
        .from('subcategories')
        .select('*')
        .order('categories_id')
        .order('id');

      if (subcategoriasError) {
        console.error('Error cargando subcategorías:', subcategoriasError);
        // Si la tabla no existe, mostrar mensaje informativo
        if (subcategoriasError.message.includes('relation "subcategories" does not exist')) {
          setTablesConfigured(false);
          setIsLoading(false);
          return;
        }
        throw subcategoriasError;
      }
      setSubcategorias(subcategoriasData || []);

      // Cargar productos
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .order('id');

      if (productosError) {
        console.error('Error cargando productos:', productosError);
        if (productosError.message.includes('relation "productos" does not exist')) {
          setTablesConfigured(false);
          setIsLoading(false);
          return;
        }
        throw productosError;
        }
        setProductos(productosData || []);

        // Cargar marcas
        console.log('🔄 Cargando marcas desde Supabase...');
        const { data: marcasData, error: marcasError } = await supabase
          .from('marcas')
          .select('*')
          .order('nombre_marca', { ascending: true });

        if (marcasError) {
          console.error('❌ Error cargando marcas:', marcasError);
          if (marcasError.message.includes('relation "marcas" does not exist')) {
            console.error('❌ La tabla "marcas" no existe en la base de datos');
            setTablesConfigured(false);
            setIsLoading(false);
            return;
          }
          throw marcasError;
        }

        console.log('✅ Marcas cargadas exitosamente:', marcasData?.length || 0, 'marcas');
        console.table(marcasData || []); // Mostrar todas las marcas en tabla
        setMarcas(marcasData || []);

        // Cargar elementos UI
        console.log('🔄 Cargando elementos UI desde Supabase...');
        const { data: uiData, error: uiError } = await supabase
          .from('ui')
          .select('*')
          .order('id', { ascending: true });

        if (uiError) {
          console.error('❌ Error cargando elementos UI:', uiError);
          if (uiError.message.includes('relation "ui" does not exist')) {
            console.error('❌ La tabla "ui" no existe en la base de datos');
            setTablesConfigured(false);
            setIsLoading(false);
            return;
          }
          throw uiError;
        }

        console.log('✅ Elementos UI cargados exitosamente:', uiData?.length || 0, 'elementos');
        console.table(uiData || []); // Mostrar todos los elementos UI en tabla
        setUiElements(uiData || []);

        // Cargar datos de Sobre Nosotros
        console.log('🔄 Cargando datos de Sobre Nosotros desde Supabase...');
        const { data: sobreNosotrosData, error: sobreNosotrosError } = await supabase
          .from('sobre_nosotros')
          .select('*')
          .eq('id', 1)
          .single();

        if (sobreNosotrosError) {
          console.error('❌ Error cargando datos de Sobre Nosotros:', sobreNosotrosError);
          if (sobreNosotrosError.message.includes('relation "sobre_nosotros" does not exist')) {
            console.error('❌ La tabla "sobre_nosotros" no existe en la base de datos');
          }
          // No lanzar error, continuar sin datos de sobre nosotros
          setSobreNosotros(null);
        } else {
          console.log('✅ Datos de Sobre Nosotros cargados exitosamente');
          console.table(sobreNosotrosData);
          setSobreNosotros(sobreNosotrosData);
        }

        // Cargar trabajos
        console.log('🔄 Cargando trabajos desde Supabase...');
        const { data: trabajosData, error: trabajosError } = await supabase
          .from('trabajos')
          .select('*')
          .order('fecha_creacion', { ascending: false });

        if (trabajosError) {
          console.error('❌ Error cargando trabajos:', trabajosError);
          if (trabajosError.message.includes('relation "trabajos" does not exist')) {
            console.error('❌ La tabla "trabajos" no existe en la base de datos');
          }
          // No lanzar error, continuar con trabajos vacíos
          setTrabajos([]);
        } else {
          console.log('✅ Trabajos cargados exitosamente:', trabajosData?.length || 0, 'trabajos');
          setTrabajos(trabajosData || []);
        }

        // Cargar aplicaciones con información del trabajo
        console.log('🔄 Cargando aplicaciones desde Supabase...');
        const { data: aplicacionesData, error: aplicacionesError } = await supabase
          .from('aplicaciones')
          .select(`
            id,
            trabajo_id,
            nombre_aplicante,
            email_aplicante,
            telefono_aplicante,
            experiencia_laboral,
            disponibilidad,
            mensaje,
            cv_url,
            estado,
            fecha_aplicacion,
            fecha_revision,
            notas_revision,
            trabajos!trabajo_id(titulo, departamento, ubicacion)
          `)
          .order('fecha_aplicacion', { ascending: false });

        if (aplicacionesError) {
          console.error('❌ Error cargando aplicaciones:', aplicacionesError);
          if (aplicacionesError.message.includes('relation "aplicaciones" does not exist')) {
            console.error('❌ La tabla "aplicaciones" no existe en la base de datos');
          }
          // No lanzar error, continuar con aplicaciones vacías
          setAplicaciones([]);
        } else {
          console.log('✅ Aplicaciones cargadas exitosamente:', aplicacionesData?.length || 0, 'aplicaciones');
          console.table(aplicacionesData || []); // Debug: mostrar todas las aplicaciones
          setAplicaciones((aplicacionesData as AplicacionConTrabajo[]) || []);
        }

        // Cargar tiendas
        console.log('🔄 Cargando tiendas desde Supabase...');
        const { data: tiendasData, error: tiendasError } = await supabase
          .from('tiendas')
          .select('*')
          .order('ciudad', { ascending: true })
          .order('nombre', { ascending: true });

        if (tiendasError) {
          console.error('❌ Error cargando tiendas:', tiendasError);
          if (tiendasError.message.includes('relation "tiendas" does not exist')) {
            console.error('❌ La tabla "tiendas" no existe en la base de datos');
          }
          // No lanzar error, continuar con tiendas vacías
          setTiendas([]);
        } else {
          console.log('✅ Tiendas cargadas exitosamente:', tiendasData?.length || 0, 'tiendas');
          setTiendas(tiendasData || []);
        }

        // Cargar aliados
        console.log('🔄 Cargando aliados desde Supabase...');
        const { data: aliadosData, error: aliadosError } = await supabase
          .from('aliados')
          .select('*')
          .order('id', { ascending: true });

        if (aliadosError) {
          console.error('❌ Error cargando aliados:', aliadosError);
          if (aliadosError.message.includes('relation "aliados" does not exist')) {
            console.error('❌ La tabla "aliados" no existe en la base de datos');
          }
          // No lanzar error, continuar con aliados vacíos
          setAliados([]);
        } else {
          console.log('✅ Aliados cargados exitosamente:', aliadosData?.length || 0, 'aliados');
          setAliados(aliadosData || []);
        }

        // Cargar pedidos
        await loadPedidos();
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      if (error?.message?.includes('relation "categories" does not exist') ||
          error?.message?.includes('relation "subcategories" does not exist') ||
          error?.message?.includes('relation "productos" does not exist') ||
          error?.message?.includes('relation "usuarios" does not exist') ||
          error?.message?.includes('relation "marcas" does not exist') ||
          error?.message?.includes('relation "aliados" does not exist')) {
        setTablesConfigured(false);
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al cargar los datos: ${error?.message || 'Error desconocido'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para seleccionar un trabajo y mostrar sus aplicaciones
  const handleSelectTrabajo = (trabajo: Trabajo) => {
    setSelectedTrabajo(trabajo)
    const aplicacionesDelTrabajo = aplicaciones.filter(app => app.trabajo_id === trabajo.id)
    console.log('Aplicaciones para trabajo', trabajo.id, ':', aplicacionesDelTrabajo)
    console.log('Total aplicaciones encontradas:', aplicacionesDelTrabajo.length)
    setTrabajoAplicaciones(aplicacionesDelTrabajo)
  }

  // Función para deseleccionar trabajo (clic fuera)
  const handleDeselectTrabajo = (e: React.MouseEvent) => {
    // Solo deseleccionar si se hace clic directamente en el contenedor, no en las tarjetas
    if (e.target === e.currentTarget) {
      setSelectedTrabajo(null)
      setTrabajoAplicaciones([])
    }
  }

  // Función para mostrar CV en modal
  const abrirCV = (cvUrl: string) => {
    setCurrentCvUrl(cvUrl);
    setCvModalOpen(true);
  }

  // Función para aceptar candidato con actualización inmediata
  const aceptarCandidato = async (aplicacionId: number) => {
    try {
      // Actualizar en la base de datos
      await actualizarEstadoAplicacion(aplicacionId, 'aceptado', 'Candidato aceptado - Contactar para siguiente fase')

      // Actualizar inmediatamente el estado local para una respuesta más rápida
      setAplicaciones(prevAplicaciones =>
        prevAplicaciones.map(app =>
          app.id === aplicacionId
            ? { ...app, estado: 'aceptado', notas_revision: 'Candidato aceptado - Contactar para siguiente fase', fecha_revision: new Date().toISOString() }
            : app
        )
      )

      // Actualizar también las aplicaciones del trabajo seleccionado
      if (selectedTrabajo) {
        setTrabajoAplicaciones(prevAplicaciones =>
          prevAplicaciones.map(app =>
            app.id === aplicacionId
              ? { ...app, estado: 'aceptado', notas_revision: 'Candidato aceptado - Contactar para siguiente fase', fecha_revision: new Date().toISOString() }
              : app
          )
        )
      }

      alert('Candidato aceptado exitosamente')
    } catch (error) {
      console.error('Error aceptando candidato:', error)
      alert('Error aceptando candidato. Por favor intenta de nuevo.')
    }
  }

  // Función para rechazar candidato con actualización inmediata
  const rechazarCandidato = async (aplicacionId: number) => {
    try {
      // Actualizar en la base de datos
      await actualizarEstadoAplicacion(aplicacionId, 'rechazado', 'Candidato rechazado después de revisión')

      // Actualizar inmediatamente el estado local para una respuesta más rápida
      setAplicaciones(prevAplicaciones =>
        prevAplicaciones.map(app =>
          app.id === aplicacionId
            ? { ...app, estado: 'rechazado', notas_revision: 'Candidato rechazado después de revisión', fecha_revision: new Date().toISOString() }
            : app
        )
      )

      // Actualizar también las aplicaciones del trabajo seleccionado
      if (selectedTrabajo) {
        setTrabajoAplicaciones(prevAplicaciones =>
          prevAplicaciones.map(app =>
            app.id === aplicacionId
              ? { ...app, estado: 'rechazado', notas_revision: 'Candidato rechazado después de revisión', fecha_revision: new Date().toISOString() }
              : app
          )
        )
      }

      alert('Candidato rechazado')
    } catch (error) {
      console.error('Error rechazando candidato:', error)
      alert('Error rechazando candidato. Por favor intenta de nuevo.')
    }
  }

  // Funciones para manejar trabajos
  const handleCreateJob = () => {
    // Inicializar formulario para creación
    setJobFormData({
      titulo: '',
      departamento: '',
      ubicacion: '',
      tipo_contrato: '',
      salario: '',
      descripcion: '',
      requisitos: [],
      beneficios: [],
      activo: true
    })
    setEditingJob(null)
    setIsCreating(true)
    setIsJobFormOpen(true)
  }

  const handleEditJob = (job: Trabajo) => {
    // Cargar datos del trabajo para edición
    setJobFormData({
      titulo: job.titulo,
      departamento: job.departamento,
      ubicacion: job.ubicacion,
      tipo_contrato: job.tipo_contrato,
      salario: job.salario,
      descripcion: job.descripcion,
      requisitos: job.requisitos || [],
      beneficios: job.beneficios || [],
      activo: job.activo
    })
    setEditingJob(job)
    setIsCreating(false)
    setIsJobFormOpen(true)
  }

  const handleJobInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setJobFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRequisitosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const requisitosArray = e.target.value.split('\n').filter(req => req.trim() !== '')
    setJobFormData(prev => ({ ...prev, requisitos: requisitosArray }))
  }

  const handleBeneficiosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const beneficiosArray = e.target.value.split('\n').filter(ben => ben.trim() !== '')
    setJobFormData(prev => ({ ...prev, beneficios: beneficiosArray }))
  }

  const handleSubmitJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!jobFormData.titulo.trim() || !jobFormData.departamento || !jobFormData.ubicacion.trim() ||
        !jobFormData.tipo_contrato || !jobFormData.salario.trim() || !jobFormData.descripcion.trim()) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setIsSubmitting(true)

      if (editingJob) {
        // Editar trabajo existente
        await editarTrabajo(editingJob.id, jobFormData)
        alert('Trabajo actualizado exitosamente')
      } else {
        // Crear nuevo trabajo
        await crearTrabajo(jobFormData)
        alert('Trabajo creado exitosamente')
      }

      // Cerrar formulario
      setIsJobFormOpen(false)

      // Recargar trabajos desde la base de datos
      await recargarTrabajos()

      // Si era edición, mantener la selección del trabajo editado
      if (editingJob) {
        // Buscar el trabajo actualizado en la lista recargada
        const trabajosActualizados = await obtenerTrabajos()
        const trabajoEditado = trabajosActualizados.find(t => t.id === editingJob.id)
        if (trabajoEditado) {
          setSelectedTrabajo(trabajoEditado)
          // Actualizar las aplicaciones del trabajo editado
          const aplicacionesDelTrabajo = aplicaciones.filter(app => app.trabajo_id === trabajoEditado.id)
          setTrabajoAplicaciones(aplicacionesDelTrabajo)
        }
      }

      // Limpiar estados del formulario
      resetJobForm()
    } catch (error) {
      console.error('Error guardando trabajo:', error)
      alert('Error guardando el trabajo. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función auxiliar para resetear el formulario
  const resetJobForm = () => {
    setJobFormData({
      titulo: '',
      departamento: '',
      ubicacion: '',
      tipo_contrato: '',
      salario: '',
      descripcion: '',
      requisitos: [],
      beneficios: [],
      activo: true
    })
    setEditingJob(null)
    setIsCreating(false)
    setIsJobFormOpen(false)
  }

  // Función para recargar trabajos
  const recargarTrabajos = async () => {
    try {
      const trabajosData = await obtenerTrabajos()
      setTrabajos(trabajosData)
    } catch (error) {
      console.error('Error recargando trabajos:', error)
    }
  }

  // Función para eliminar trabajo
  const handleDeleteJob = async (trabajoId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta oferta laboral? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('trabajos')
        .delete()
        .eq('id', trabajoId)

      if (error) throw error

      // Actualizar estado local
      setTrabajos(trabajos.filter(t => t.id !== trabajoId))
      
      // Si el trabajo eliminado era el seleccionado, limpiar selección
      if (selectedTrabajo?.id === trabajoId) {
        setSelectedTrabajo(null)
        setTrabajoAplicaciones([])
      }

      alert('Oferta laboral eliminada exitosamente')
    } catch (error) {
      console.error('Error eliminando trabajo:', error)
      alert('Error al eliminar la oferta laboral. Por favor intenta de nuevo.')
    }
  }

  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoria.nombre.trim() || !newCategoria.descripcion.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          nombre: newCategoria.nombre,
          descripcion: newCategoria.descripcion,
          imagen_marca1: newCategoria.imagen_marca1 || null,
          imagen_marca2: newCategoria.imagen_marca2 || null,
          imagen_marca3: newCategoria.imagen_marca3 || null,
          categoria_imagen: newCategoria.categoria_imagen || null
        }])
        .select()
        .single();

      if (error) throw error;

      setCategorias([...categorias, data]);
      setNewCategoria({
        nombre: '',
        descripcion: '',
        imagen_marca1: '',
        imagen_marca2: '',
        imagen_marca3: '',
        categoria_imagen: ''
      });
      alert('Categoría creada exitosamente');
    } catch (error: any) {
      console.error('Error creando categoría:', error);
      if (error?.message?.includes('relation "categories" does not exist')) {
        alert('La tabla "categories" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al crear la categoría: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleUpdateCategoria = async (categoria: Categoria) => {
    if (!categoria.nombre.trim() || !categoria.descripcion.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          imagen_marca1: categoria.imagen_marca1,
          imagen_marca2: categoria.imagen_marca2,
          imagen_marca3: categoria.imagen_marca3,
          categoria_imagen: categoria.categoria_imagen
        })
        .eq('id', categoria.id);

      if (error) throw error;

      setCategorias(categorias.map(c => c.id === categoria.id ? categoria : c));
      setEditingCategoria(null);
      alert('Categoría actualizada exitosamente');
    } catch (error: any) {
      console.error('Error actualizando categoría:', error);
      if (error?.message?.includes('relation "categories" does not exist')) {
        alert('La tabla "categories" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al actualizar la categoría: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleDeleteCategoria = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría? Esto también eliminará todas sus subcategorías.')) {
      return;
    }

    try {
      // Primero eliminar subcategorías relacionadas
      const { error: subError } = await supabase
        .from('subcategories')
        .delete()
        .eq('categories_id', id);

      if (subError) throw subError;

      // Luego eliminar la categoría
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategorias(categorias.filter(c => c.id !== id));
      setSubcategorias(subcategorias.filter(s => s.categories_id !== id));
      alert('Categoría eliminada exitosamente');
    } catch (error: any) {
      console.error('Error eliminando categoría:', error);
      if (error?.message?.includes('relation "categories" does not exist') || error?.message?.includes('relation "subcategories" does not exist')) {
        alert('Las tablas no existen en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al eliminar la categoría: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleCreateSubcategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoria.categories_id || !newSubcategoria.nombre.trim() || !newSubcategoria.descripcion.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert([{
          categories_id: newSubcategoria.categories_id,
          nombre: newSubcategoria.nombre,
          descripcion: newSubcategoria.descripcion
        }])
        .select()
        .single();

      if (error) throw error;

      setSubcategorias([...subcategorias, data]);
      setNewSubcategoria({ categories_id: 0, nombre: '', descripcion: '' });
      alert('Subcategoría creada exitosamente');
    } catch (error: any) {
      console.error('Error creando subcategoría:', error);
      if (error?.message?.includes('relation "subcategories" does not exist')) {
        alert('La tabla "subcategories" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.message?.includes('violates foreign key constraint')) {
        alert('Error: La categoría seleccionada no existe. Crea primero una categoría válida.');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al crear la subcategoría: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleUpdateSubcategoria = async (subcategoria: Subcategoria) => {
    if (!subcategoria.nombre.trim() || !subcategoria.descripcion.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const { error } = await supabase
        .from('subcategories')
        .update({
          categories_id: subcategoria.categories_id,
          nombre: subcategoria.nombre,
          descripcion: subcategoria.descripcion
        })
        .eq('id', subcategoria.id);

      if (error) throw error;

      setSubcategorias(subcategorias.map(s => s.id === subcategoria.id ? subcategoria : s));
      setEditingSubcategoria(null);
      alert('Subcategoría actualizada exitosamente');
    } catch (error: any) {
      console.error('Error actualizando subcategoría:', error);
      if (error?.message?.includes('relation "subcategories" does not exist')) {
        alert('La tabla "subcategories" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.message?.includes('violates foreign key constraint')) {
        alert('Error: La categoría seleccionada no existe. Crea primero una categoría válida.');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al actualizar la subcategoría: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleDeleteSubcategoria = async (id: number, categories_id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta subcategoría?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubcategorias(subcategorias.filter(s => s.id !== id));
      alert('Subcategoría eliminada exitosamente');
    } catch (error: any) {
      console.error('Error eliminando subcategoría:', error);
      if (error?.message?.includes('relation "subcategories" does not exist')) {
        alert('La tabla "subcategories" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al eliminar la subcategoría: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const startEditCategoria = (categoria: Categoria) => {
    setEditingCategoria({
      ...categoria,
      imagen_marca1: categoria.imagen_marca1 || '',
      imagen_marca2: categoria.imagen_marca2 || '',
      imagen_marca3: categoria.imagen_marca3 || '',
      categoria_imagen: categoria.categoria_imagen || ''
    });
  };

  const cancelEditCategoria = () => {
    setEditingCategoria(null);
  };

  const startEditSubcategoria = (subcategoria: Subcategoria) => {
    setEditingSubcategoria(subcategoria);
  };

  const cancelEditSubcategoria = () => {
    setEditingSubcategoria(null);
  };

  const handleCreateProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUploading) {
      alert('Espera a que termine de subirse la imagen antes de guardar.');
      return;
    }
    if (!newProducto.subcategorias_id ||
        !newProducto.nombre.trim() ||
        !newProducto.descripcion.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Convertir y validar tamaños
    if (newProducto.tamano && newProducto.tamano.length > 0) {
      // Convertir strings a números
      newProducto.tamano = newProducto.tamano.map(t => ({
        ...t,
        cantidad: typeof t.cantidad === 'string' ? parseFloat(t.cantidad) || 0 : t.cantidad
      }));

      const tamañosValidos = newProducto.tamano.filter(t => t.cantidad > 0);
      if (tamañosValidos.length === 0) {
        alert('Si defines tamaños, al menos uno debe tener una cantidad mayor a 0');
        return;
      }
      // Actualizar solo los tamaños válidos
      newProducto.tamano = tamañosValidos;
    }

    // Convertir y validar precios
    if (newProducto.tamano && newProducto.tamano.length > 0) {
      if (!newProducto.precios || newProducto.precios.length !== newProducto.tamano.length) {
        alert('Debe haber un precio para cada tamaño definido');
        return;
      }
      
      // Convertir strings a números
      newProducto.precios = newProducto.precios.map(p => 
        typeof p === 'string' ? parseFloat(p) || 0 : p
      );

      // Validar que todos los precios sean mayores a 0
      if (newProducto.precios.some(p => p <= 0)) {
        alert('Todos los precios deben ser mayores a 0');
        return;
      }
    }

    // Convertir ProductoForm a Producto para enviar a Supabase
    const productoParaEnviar: Omit<Producto, 'id' | 'created_at' | 'updated_at'> = {
      subcategorias_id: newProducto.subcategorias_id,
      nombre: newProducto.nombre,
      descripcion: newProducto.descripcion,
      imagen_url: newProducto.imagen_url || null,
      descuento: newProducto.descuento || false,
      descuento_valor: newProducto.descuento_valor ? parseFloat(newProducto.descuento_valor) : undefined,
      destacado: newProducto.destacado || false,
      novedad: newProducto.novedad || false,
      id_marca: newProducto.id_marca || null,
      stocks: newProducto.stocks && newProducto.stocks.length > 0 ? newProducto.stocks : null,
      // Campos antiguos mantenidos para compatibilidad durante la transición
      tamano: newProducto.tamano && newProducto.tamano.length > 0 ? newProducto.tamano : null,
      precios: newProducto.precios && newProducto.precios.length > 0 ? newProducto.precios : null
    };

    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([productoParaEnviar])
        .select()
        .single();

      if (error) throw error;

      setProductos([...productos, data]);
      setNewProducto({
        subcategorias_id: 0,
        nombre: '',
        descripcion: '',
        imagen_url: '',
        descuento: false,
        descuento_valor: '',
        destacado: false,
        novedad: false,
        id_marca: 0,
        stocks: [],
        tamano: [],
        precios: []
      } as ProductoForm);
      alert('Producto creado exitosamente');
    } catch (error: any) {
      console.error('Error creando producto:', error);
      if (error?.message?.includes('relation "productos" does not exist')) {
        alert('La tabla "productos" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.message?.includes('violates foreign key constraint')) {
        alert('Error: La subcategoría seleccionada no existe. Selecciona una subcategoría válida.');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al crear el producto: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleUpdateProducto = async (producto: Producto) => {
    if (imageUploading) {
      alert('Espera a que termine de subirse la imagen antes de guardar.');
      return;
    }
    // Validar campos obligatorios
    if (!producto.nombre || !producto.nombre.trim()) {
      alert('Por favor completa el nombre del producto');
      return;
    }

    if (!producto.descripcion || !producto.descripcion.trim()) {
      alert('Por favor completa la descripción del producto');
      return;
    }


    // Convertir y validar tamaños
    if (producto.tamano && producto.tamano.length > 0) {
      // Convertir strings a números
      producto.tamano = producto.tamano.map(t => ({
        ...t,
        cantidad: typeof t.cantidad === 'string' ? parseFloat(t.cantidad) || 0 : t.cantidad
      }));

      const tamañosValidos = producto.tamano.filter(t => t.cantidad > 0);
      if (tamañosValidos.length === 0) {
        alert('Si defines tamaños, al menos uno debe tener una cantidad mayor a 0');
        return;
      }
      // Actualizar solo los tamaños válidos
      producto.tamano = tamañosValidos;
    }

    // Convertir y validar precios
    if (producto.tamano && producto.tamano.length > 0) {
      if (!producto.precios || producto.precios.length !== producto.tamano.length) {
        alert('Debe haber un precio para cada tamaño definido');
        return;
      }
      
      // Convertir strings a números
      producto.precios = producto.precios.map(p => 
        typeof p === 'string' ? parseFloat(p) || 0 : p
      );

      // Validar que todos los precios sean mayores a 0
      if (producto.precios.some(p => p <= 0)) {
        alert('Todos los precios deben ser mayores a 0');
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('productos')
        .update({
          subcategorias_id: producto.subcategorias_id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          imagen_url: producto.imagen_url || null,
          descuento: producto.descuento || false,
          descuento_valor: producto.descuento_valor ? parseFloat(producto.descuento_valor.toString()) : null,
          destacado: producto.destacado || false,
          novedad: producto.novedad || false,
          id_marca: producto.id_marca || null,
          stocks: producto.stocks && producto.stocks.length > 0 ? producto.stocks : null,
          // Campos antiguos mantenidos para compatibilidad durante la transición
          tamano: producto.tamano && producto.tamano.length > 0 ? producto.tamano : null,
          precios: producto.precios && producto.precios.length > 0 ? producto.precios : null
        })
        .eq('id', producto.id);

      if (error) throw error;

      setProductos(productos.map(p => p.id === producto.id ? producto : p));
      setEditingProducto(null);
      alert('Producto actualizado exitosamente');
    } catch (error: any) {
      console.error('Error actualizando producto:', error);
      if (error?.message?.includes('relation "productos" does not exist')) {
        alert('La tabla "productos" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.message?.includes('violates foreign key constraint')) {
        alert('Error: La subcategoría seleccionada no existe. Selecciona una subcategoría válida.');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al actualizar el producto: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleDeleteProducto = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProductos(productos.filter(p => p.id !== id));
      alert('Producto eliminado exitosamente');
    } catch (error: any) {
      console.error('Error eliminando producto:', error);
      if (error?.message?.includes('relation "productos" does not exist')) {
        alert('La tabla "productos" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al eliminar el producto: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  // ========== FUNCIONES CRUD PARA MARCAS ==========

  const handleCreateMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarca.nombre_marca.trim()) {
      alert('Por favor ingresa el nombre de la marca');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('marcas')
        .insert([{ nombre_marca: newMarca.nombre_marca.trim() }])
        .select()
        .single();

      if (error) throw error;

      setMarcas([...marcas, data]);
      setNewMarca({ nombre_marca: '' });
      alert('Marca creada exitosamente');
    } catch (error: any) {
      console.error('Error creando marca:', error);
      if (error?.message?.includes('relation "marcas" does not exist')) {
        alert('La tabla "marcas" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al crear la marca: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleUpdateMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarca || !editingMarca.nombre_marca.trim()) {
      alert('Por favor ingresa el nombre de la marca');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('marcas')
        .update({ nombre_marca: editingMarca.nombre_marca.trim() })
        .eq('id', editingMarca.id)
        .select()
        .single();

      if (error) throw error;

      setMarcas(marcas.map(m => m.id === editingMarca.id ? data : m));
      setEditingMarca(null);
      alert('Marca actualizada exitosamente');
    } catch (error: any) {
      console.error('Error actualizando marca:', error);
      if (error?.message?.includes('relation "marcas" does not exist')) {
        alert('La tabla "marcas" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al actualizar la marca: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleDeleteMarca = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta marca? Los productos asociados seguirán existiendo pero perderán la referencia a esta marca.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('marcas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMarcas(marcas.filter(m => m.id !== id));
      alert('Marca eliminada exitosamente');
    } catch (error: any) {
      console.error('Error eliminando marca:', error);
      if (error?.message?.includes('relation "marcas" does not exist')) {
        alert('La tabla "marcas" no existe en Supabase. Crea las tablas siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al eliminar la marca: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const startEditMarca = (marca: Marca) => {
    setEditingMarca({ ...marca });
  };

  const cancelEditMarca = () => {
    setEditingMarca(null);
  };

  const startEditProducto = (producto: Producto) => {
    // Inicializar stocks si no existe o sincronizar con campos antiguos
    let stocks = producto.stocks || [];

    // Si no hay stocks pero sí tamaños y precios antiguos, crear stocks a partir de ellos
    if (stocks.length === 0 && producto.tamano && producto.tamano.length > 0 && producto.precios) {
      stocks = producto.tamano.map((tamano, index) => ({
        id: `${producto.id}_${index}_${Date.now()}`,  // ID único basado en producto y posición
        cantidad: tamano.cantidad,
        unidad: tamano.unidad,
        precio: producto.precios?.[index] || 0,
        stock: 0  // Valor por defecto, se puede ajustar después
      }));
    }

    setEditingProducto({
      ...producto,
      stocks: stocks,
      tamano: producto.tamano || [],
      precios: producto.precios || []
    });
  };

  const cancelEditProducto = () => {
    setEditingProducto(null);
  };

  // Funciones para manejar tamaños y precios de productos
  const agregarTamano = (producto: ProductoForm | Producto, setProducto: (producto: ProductoForm | Producto) => void) => {
    // Crear nuevo stock con valores por defecto
    const nuevoStock: ProductoStock = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,  // ID único
      cantidad: 0,
      unidad: 'ML',
      precio: 0,
      stock: 0
    };

    const nuevosStocks = [...(producto.stocks || []), nuevoStock];

    // Mantener compatibilidad con campos antiguos durante la transición
    const nuevosTamanos = [...(producto.tamano || []), { unidad: 'ML' as const, cantidad: 0 }];
    const nuevosPrecios = [...(producto.precios || []), 0];

    setProducto({
      ...producto,
      stocks: nuevosStocks,
      tamano: nuevosTamanos,
      precios: nuevosPrecios
    });
  };

  const eliminarTamano = (producto: ProductoForm | Producto, setProducto: (producto: ProductoForm | Producto) => void, index: number) => {
    const nuevosStocks = (producto.stocks || []).filter((_, i) => i !== index);
    const nuevosTamanos = (producto.tamano || []).filter((_, i) => i !== index);
    const nuevosPrecios = (producto.precios || []).filter((_, i) => i !== index);
    setProducto({
      ...producto,
      stocks: nuevosStocks,
      tamano: nuevosTamanos,
      precios: nuevosPrecios
    });
  };

  const actualizarTamano = (producto: ProductoForm | Producto, setProducto: (producto: ProductoForm | Producto) => void, index: number, campo: 'unidad' | 'cantidad', valor: string | number) => {
    const nuevosStocks = [...(producto.stocks || [])];
    const nuevosTamanos = [...(producto.tamano || [])];

    // Si es cantidad y es string, permitir entrada libre (incluyendo punto decimal)
    // Solo convertir a número cuando se guarde el producto
    const valorFinal = campo === 'cantidad' && typeof valor === 'string' ? valor : valor;

    // Actualizar tanto stocks como tamano para mantener sincronización
    nuevosTamanos[index] = { ...nuevosTamanos[index], [campo]: valorFinal } as TamanoProducto;
    nuevosStocks[index] = { ...nuevosStocks[index], [campo]: valorFinal };

    setProducto({
      ...producto,
      stocks: nuevosStocks,
      tamano: nuevosTamanos
    });
  };

  const actualizarPrecio = (producto: ProductoForm | Producto, setProducto: (producto: ProductoForm | Producto) => void, index: number, valor: string | number) => {
    const nuevosStocks = [...(producto.stocks || [])];
    const nuevosPrecios = [...(producto.precios || [])];

    // Permitir entrada libre (incluyendo punto decimal)
    // Solo convertir a número cuando se guarde el producto
    const valorFinal = typeof valor === 'string' ? valor : valor;

    // Actualizar tanto stocks como precios para mantener sincronización
    nuevosPrecios[index] = valorFinal as any;
    nuevosStocks[index] = { ...nuevosStocks[index], precio: valorFinal as any };

    setProducto({
      ...producto,
      stocks: nuevosStocks,
      precios: nuevosPrecios
    });
  };

  const actualizarStock = (producto: ProductoForm | Producto, setProducto: (producto: ProductoForm | Producto) => void, index: number, valor: number) => {
    const nuevosStocks = [...(producto.stocks || [])];
    nuevosStocks[index] = { ...nuevosStocks[index], stock: valor };

    setProducto({
      ...producto,
      stocks: nuevosStocks
    });
  };

  // Función para sanear segmentos de ruta de archivo
  function sanitizePathSegment(input: string) {
    return (input || 'producto')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);
  }

  // Función para subir imagen a Supabase Storage (robusta)
  const uploadImageToStorage = async (file: File, productName: string): Promise<string> => {
    try {
      const safeBase = sanitizePathSegment(productName || 'producto');
      const originalExt = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
      const mimeExt = (file.type || '').split('/').pop() || '';
      const ext = sanitizePathSegment(originalExt || mimeExt || 'jpg') || 'jpg';
      const unique = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
      let filePath = `productos/${safeBase}_${unique}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type || `image/${ext}`,
          upsert: false,
        });

      if (upErr) {
        console.error('Upload error:', upErr, { filePath, contentType: file.type, size: file.size });
        // Reintentar con otro nombre en caso de colisión u otro caso transitorio
        const unique2 = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        filePath = `productos/${safeBase}_${unique2}.${ext}`;
        const { error: retryErr } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            contentType: file.type || `image/${ext}`,
            upsert: false,
          });
        if (retryErr) throw retryErr;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error('Error en upload de imagen:', error);
      throw error;
    }
  };

  // Función para manejar selección de archivo
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, productName: string) => {
    setImageUploading(true);
    const input = event.target;
    const file = input.files?.[0];
    if (!file) { setImageUploading(false); return null; }

    const mime = (file.type || '').toLowerCase();
    if (!mime.startsWith('image/') || mime.includes('heic') || mime.includes('heif')) {
      alert('Por favor selecciona una imagen válida (JPG/PNG/WebP). HEIC/HEIF no soportado.');
      setImageUploading(false);
      input.value = '';
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      setImageUploading(false);
      input.value = '';
      return null;
    }

    try {
      const imageUrl = await uploadImageToStorage(file, productName);
      return imageUrl;
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      alert(`Error al subir la imagen: ${error?.message || 'Desconocido'}`);
      return null;
    } finally {
      setImageUploading(false);
      input.value = '';
    }
  };

  // Función para manejar selección de archivo de marca
  const handleFileSelectMarca = async (event: React.ChangeEvent<HTMLInputElement>, marcaType: string) => {
    setImageUploading(true);
    const input = event.target;
    const file = input.files?.[0];
    if (!file) { setImageUploading(false); return null; }

    const mime = (file.type || '').toLowerCase();
    if (!mime.startsWith('image/') || mime.includes('heic') || mime.includes('heif')) {
      alert('Por favor selecciona una imagen válida (JPG/PNG/WebP). HEIC/HEIF no soportado.');
      setImageUploading(false);
      input.value = '';
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      setImageUploading(false);
      input.value = '';
      return null;
    }

    try {
      const imageUrl = await uploadImageToStorage(file, `marca-${marcaType}`);
      return imageUrl;
    } catch (error) {
      console.error('Error subiendo imagen de marca:', error);
      alert('Error al subir la imagen. Inténtalo de nuevo.');
      return null;
    } finally {
      setImageUploading(false);
      input.value = '';
    }
  };

  // Función para manejar selección de archivo de categoría
  const handleFileSelectCategoria = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploading(true);
    const input = event.target;
    const file = input.files?.[0];
    if (!file) { setImageUploading(false); return null; }

    const mime = (file.type || '').toLowerCase();
    if (!mime.startsWith('image/') || mime.includes('heic') || mime.includes('heif')) {
      alert('Por favor selecciona una imagen válida (JPG/PNG/WebP). HEIC/HEIF no soportado.');
      setImageUploading(false);
      input.value = '';
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      setImageUploading(false);
      input.value = '';
      return null;
    }

    try {
      const imageUrl = await uploadImageToStorage(file, 'categoria-banner');
      return imageUrl;
    } catch (error) {
      console.error('Error subiendo imagen de categoría:', error);
      alert('Error al subir la imagen. Inténtalo de nuevo.');
      return null;
    } finally {
      setImageUploading(false);
      input.value = '';
    }
  };

  // ==================== FUNCIONES PARA UI ====================
  
  // Función para subir archivo (imagen o video) a Supabase Storage en carpeta UI
  const uploadUIFileToStorage = async (file: File, folder: string): Promise<string> => {
    try {
      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}_${Date.now()}.${fileExt}`;
      const filePath = `UI/${fileName}`;

      // Subir archivo al bucket 'images'
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) {
        console.error('Error subiendo archivo:', error);
        throw error;
      }

      // Obtener URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error en upload de archivo UI:', error);
      throw error;
    }
  };

  // Función para manejar selección de archivos UI (imágenes o videos)
  const handleFileSelectUI = async (event: React.ChangeEvent<HTMLInputElement>, folder: string) => {
    setImageUploading(true);
    const file = event.target.files?.[0];
    if (!file) {
      setImageUploading(false);
      return null;
    }

    // Validar que sea una imagen o video
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Por favor selecciona un archivo de imagen o video válido');
      setImageUploading(false);
      return null;
    }

    // Validar tamaño (máximo 50MB para videos, 5MB para imágenes)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`El archivo debe ser menor a ${file.type.startsWith('video/') ? '50MB' : '5MB'}`);
      setImageUploading(false);
      return null;
    }

    try {
      const fileUrl = await uploadUIFileToStorage(file, folder);
      return fileUrl;
    } catch (error) {
      console.error('Error subiendo archivo UI:', error);
      alert('Error al subir el archivo. Inténtalo de nuevo.');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  // Función para crear nuevo elemento UI
  const handleCreateUI = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('ui')
        .insert([newUI])
        .select();

      if (error) throw error;

      if (data) {
        setUiElements([...uiElements, data[0]]);
        setNewUI({
          banner: [],
          hiddenbanner: [],
          popup: null
        });
        alert('Elemento UI creado exitosamente');
      }
    } catch (error: any) {
      console.error('Error creando elemento UI:', error);
      alert(`Error al crear elemento UI: ${error?.message || 'Error desconocido'}`);
    }
  };

  // Función para actualizar elemento UI
  const handleUpdateUI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUI || !editingUI.id) return;

    try {
      const { error } = await supabase
        .from('ui')
        .update({
          banner: editingUI.banner,
          hiddenbanner: editingUI.hiddenbanner,
          popup: editingUI.popup
        })
        .eq('id', editingUI.id);

      if (error) throw error;

      setUiElements(uiElements.map(ui => ui.id === editingUI.id ? editingUI : ui));
      setEditingUI(null);
      alert('Elemento UI actualizado exitosamente');
    } catch (error: any) {
      console.error('Error actualizando elemento UI:', error);
      alert(`Error al actualizar elemento UI: ${error?.message || 'Error desconocido'}`);
    }
  };

  // Función para eliminar elemento UI
  const handleDeleteUI = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento UI?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ui')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUiElements(uiElements.filter(ui => ui.id !== id));
      alert('Elemento UI eliminado exitosamente');
    } catch (error: any) {
      console.error('Error eliminando elemento UI:', error);
      alert(`Error al eliminar elemento UI: ${error?.message || 'Error desconocido'}`);
    }
  };

  const startEditUI = (ui: UI) => {
    setEditingUI({ ...ui });
  };

  const cancelEditUI = () => {
    setEditingUI(null);
  };

  // Funciones para cambiar el orden de elementos en arrays
  const moveArrayItem = (array: any[], fromIndex: number, toIndex: number) => {
    const newArray = [...array];
    const item = newArray.splice(fromIndex, 1)[0];
    newArray.splice(toIndex, 0, item);
    return newArray;
  };

  const moveBannerUp = (index: number) => {
    if (!editingUI || index === 0) return;
    const newBanners = moveArrayItem(editingUI.banner || [], index, index - 1);
    setEditingUI({ ...editingUI, banner: newBanners });
  };

  const moveBannerDown = (index: number) => {
    if (!editingUI || !editingUI.banner || index === editingUI.banner.length - 1) return;
    const newBanners = moveArrayItem(editingUI.banner, index, index + 1);
    setEditingUI({ ...editingUI, banner: newBanners });
  };

  const moveHiddenBannerUp = (index: number) => {
    if (!editingUI || index === 0) return;
    const newHiddenBanners = moveArrayItem(editingUI.hiddenbanner || [], index, index - 1);
    setEditingUI({ ...editingUI, hiddenbanner: newHiddenBanners });
  };

  const moveHiddenBannerDown = (index: number) => {
    if (!editingUI || !editingUI.hiddenbanner || index === editingUI.hiddenbanner.length - 1) return;
    const newHiddenBanners = moveArrayItem(editingUI.hiddenbanner, index, index + 1);
    setEditingUI({ ...editingUI, hiddenbanner: newHiddenBanners });
  };

  // ==================== FUNCIONES PARA SOBRE NOSOTROS ====================

  const handleUpdateSobreNosotros = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSobreNosotros) return;

    try {
      const { error } = await supabase
        .from('sobre_nosotros')
        .update({
          banner_texto: editingSobreNosotros.banner_texto,
          mision_titulo: editingSobreNosotros.mision_titulo,
          mision_parrafo1: editingSobreNosotros.mision_parrafo1,
          mision_parrafo2: editingSobreNosotros.mision_parrafo2,
          vision_titulo: editingSobreNosotros.vision_titulo,
          vision_parrafo1: editingSobreNosotros.vision_parrafo1,
          vision_parrafo2: editingSobreNosotros.vision_parrafo2,
          identidad_titulo: editingSobreNosotros.identidad_titulo,
          identidad_banner_texto: editingSobreNosotros.identidad_banner_texto,
          valores_titulo: editingSobreNosotros.valores_titulo,
          valor1_titulo: editingSobreNosotros.valor1_titulo,
          valor1_descripcion: editingSobreNosotros.valor1_descripcion,
          valor2_titulo: editingSobreNosotros.valor2_titulo,
          valor2_descripcion: editingSobreNosotros.valor2_descripcion,
          valor3_titulo: editingSobreNosotros.valor3_titulo,
          valor3_descripcion: editingSobreNosotros.valor3_descripcion,
          valor4_titulo: editingSobreNosotros.valor4_titulo,
          valor4_descripcion: editingSobreNosotros.valor4_descripcion,
          valor5_titulo: editingSobreNosotros.valor5_titulo,
          valor5_descripcion: editingSobreNosotros.valor5_descripcion,
          valor6_titulo: editingSobreNosotros.valor6_titulo,
          valor6_descripcion: editingSobreNosotros.valor6_descripcion,
        })
        .eq('id', 1);

      if (error) throw error;

      setSobreNosotros(editingSobreNosotros);
      setEditingSobreNosotros(null);
      alert('Contenido de Sobre Nosotros actualizado exitosamente');
    } catch (error: any) {
      console.error('Error actualizando Sobre Nosotros:', error);
      alert(`Error al actualizar Sobre Nosotros: ${error?.message || 'Error desconocido'}`);
    }
  };

  const startEditSobreNosotros = () => {
    if (sobreNosotros) {
      setEditingSobreNosotros({ ...sobreNosotros });
    }
  };

  const cancelEditSobreNosotros = () => {
    setEditingSobreNosotros(null);
  };

  // ==================== FUNCIONES PARA TIENDAS ====================

  const handleCreateTienda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTienda.nombre.trim() || !newTienda.direccion.trim() || !newTienda.ciudad.trim() || 
        !newTienda.telefono.trim() || !newTienda.contacto.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar coordenadas
    if (newTienda.lat === 0 || newTienda.lng === 0) {
      alert('Por favor ingresa coordenadas GPS válidas');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tiendas')
        .insert([newTienda])
        .select()
        .single();

      if (error) throw error;

      setTiendas([...tiendas, data]);
      setNewTienda({
        nombre: '',
        direccion: '',
        ciudad: '',
        telefono: '',
        contacto: '',
        lat: 0,
        lng: 0
      });
      alert('Tienda creada exitosamente');
    } catch (error: any) {
      console.error('Error creando tienda:', error);
      alert(`Error al crear la tienda: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleUpdateTienda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTienda) return;

    if (!editingTienda.nombre.trim() || !editingTienda.direccion.trim() || !editingTienda.ciudad.trim() || 
        !editingTienda.telefono.trim() || !editingTienda.contacto.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar coordenadas
    if (editingTienda.lat === 0 || editingTienda.lng === 0) {
      alert('Por favor ingresa coordenadas GPS válidas');
      return;
    }

    try {
      const { error } = await supabase
        .from('tiendas')
        .update({
          nombre: editingTienda.nombre,
          direccion: editingTienda.direccion,
          ciudad: editingTienda.ciudad,
          telefono: editingTienda.telefono,
          contacto: editingTienda.contacto,
          lat: editingTienda.lat,
          lng: editingTienda.lng
        })
        .eq('id', editingTienda.id);

      if (error) throw error;

      setTiendas(tiendas.map(t => t.id === editingTienda.id ? editingTienda : t));
      setEditingTienda(null);
      alert('Tienda actualizada exitosamente');
    } catch (error: any) {
      console.error('Error actualizando tienda:', error);
      alert(`Error al actualizar la tienda: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleDeleteTienda = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tienda?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tiendas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTiendas(tiendas.filter(t => t.id !== id));
      alert('Tienda eliminada exitosamente');
    } catch (error: any) {
      console.error('Error eliminando tienda:', error);
      alert(`Error al eliminar la tienda: ${error?.message || 'Error desconocido'}`);
    }
  };

  const startEditTienda = (tienda: Tienda) => {
    setEditingTienda({ ...tienda });
  };

  const cancelEditTienda = () => {
    setEditingTienda(null);
  };

  // ==================== FUNCIONES PARA ALIADOS ====================

  const handleCreateAliado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAliado.nombre.trim()) {
      alert('Por favor ingresa el nombre del aliado');
      return;
    }
    if (!newAliado.imagen_url) {
      alert('Por favor selecciona una imagen para el aliado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('aliados')
        .insert([{ nombre: newAliado.nombre.trim(), imagen_url: newAliado.imagen_url }])
        .select()
        .single();

      if (error) throw error;

      setAliados([...aliados, data]);
      setNewAliado({ nombre: '', imagen_url: '' });
      // Recargar aliados en la página principal
      if ((window as any).recargarAliados) {
        (window as any).recargarAliados();
      }
      alert('Aliado creado exitosamente');
    } catch (error: any) {
      console.error('Error creando aliado:', error);
      if (error?.message?.includes('relation "aliados" does not exist')) {
        alert('La tabla "aliados" no existe en Supabase. Crea la tabla siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al crear el aliado: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleUpdateAliado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAliado || !editingAliado.nombre.trim()) {
      alert('Por favor ingresa el nombre del aliado');
      return;
    }
    if (!editingAliado.imagen_url) {
      alert('Por favor selecciona una imagen para el aliado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('aliados')
        .update({ nombre: editingAliado.nombre.trim(), imagen_url: editingAliado.imagen_url })
        .eq('id', editingAliado.id)
        .select()
        .single();

      if (error) throw error;

      setAliados(aliados.map(a => a.id === editingAliado.id ? data : a));
      setEditingAliado(null);
      // Recargar aliados en la página principal
      if ((window as any).recargarAliados) {
        (window as any).recargarAliados();
      }
      alert('Aliado actualizado exitosamente');
    } catch (error: any) {
      console.error('Error actualizando aliado:', error);
      if (error?.message?.includes('relation "aliados" does not exist')) {
        alert('La tabla "aliados" no existe en Supabase. Crea la tabla siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al actualizar el aliado: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const handleDeleteAliado = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este aliado?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('aliados')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAliados(aliados.filter(a => a.id !== id));
      // Recargar aliados en la página principal
      if ((window as any).recargarAliados) {
        (window as any).recargarAliados();
      }
      alert('Aliado eliminado exitosamente');
    } catch (error: any) {
      console.error('Error eliminando aliado:', error);
      if (error?.message?.includes('relation "aliados" does not exist')) {
        alert('La tabla "aliados" no existe en Supabase. Crea la tabla siguiendo las instrucciones del archivo SUPABASE_SETUP.md');
      } else if (error?.code === 'PGRST301') {
        alert('Error de conexión con Supabase. Verifica tu conexión a internet y las credenciales.');
      } else {
        alert(`Error al eliminar el aliado: ${error?.message || 'Error desconocido'}`);
      }
    }
  };

  const startEditAliado = (aliado: {id: number, nombre: string, imagen_url: string}) => {
    setEditingAliado({ ...aliado });
  };

  const cancelEditAliado = () => {
    setEditingAliado(null);
  };

  // Función para subir imagen de aliado a Supabase Storage
  const uploadAliadoImageToStorage = async (file: File, aliadoName: string): Promise<string> => {
    try {
      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${aliadoName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`;
      const filePath = `aliados/${fileName}`;

      // Subir archivo al bucket 'images'
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) {
        console.error('Error subiendo imagen de aliado:', error);
        throw error;
      }

      // Obtener URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error en upload de imagen de aliado:', error);
      throw error;
    }
  };

  // Función para manejar selección de archivo de aliado
  const handleFileSelectAliado = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploading(true);
    const file = event.target.files?.[0];
    if (!file) {
      setImageUploading(false);
      return null;
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      setImageUploading(false);
      return null;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      setImageUploading(false);
      return null;
    }

    try {
      const aliadoName = editingAliado ? editingAliado.nombre : newAliado.nombre || 'aliado';
      const imageUrl = await uploadAliadoImageToStorage(file, aliadoName);
      return imageUrl;
    } catch (error) {
      console.error('Error subiendo imagen de aliado:', error);
      alert('Error al subir la imagen. Inténtalo de nuevo.');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428] mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando dashboard...</p>
      </div>
    );
  }

  // Si las tablas no están configuradas, mostrar mensaje
  if (tablesConfigured === false) {
    return (
      <div className="text-center py-12">
        <div className="max-w-2xl mx-auto">
          <FolderPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tablas no configuradas</h3>
          <p className="text-gray-600 mb-6">
            Las tablas de categorías no están configuradas en la base de datos.
            Consulta el archivo <code className="bg-gray-100 px-2 py-1 rounded">SUPABASE_SETUP.md</code> para ver cómo crearlas.
          </p>
          <button
            onClick={() => {
              setTablesConfigured(null);
              loadData();
            }}
            className="bg-[#196428] hover:bg-[#145020] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Panel de Administración</h2>
        <p className="text-gray-600">Gestiona categorías, subcategorías, productos, marcas, elementos UI, aliados y vacantes del sistema</p>
      </div>

      <Tabs defaultValue="categorias" className="space-y-6">
        <TabsList className="grid w-full grid-cols-10 items-center gap-1.5 max-w-6xl mx-auto rounded-full border border-green-300/50 bg-gradient-to-br from-green-50 to-emerald-50/50 shadow-md backdrop-blur-sm p-1.5 h-12">
          <TabsTrigger 
            value="categorias" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            Categorías
          </TabsTrigger>
          <TabsTrigger 
            value="subcategorias" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            Subcategorías
          </TabsTrigger>
          <TabsTrigger 
            value="productos" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            Productos
          </TabsTrigger>
          <TabsTrigger 
            value="marcas" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            Marcas
          </TabsTrigger>
          <TabsTrigger 
            value="ui" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            UI
          </TabsTrigger>
          <TabsTrigger 
            value="tiendas" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            Tiendas
          </TabsTrigger>
          <TabsTrigger 
            value="aliados" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            Aliados
          </TabsTrigger>
          <TabsTrigger 
            value="vacantes" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            Vacantes
          </TabsTrigger>
          <TabsTrigger 
            value="pedidos" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            Pedidos
          </TabsTrigger>
          <TabsTrigger 
            value="analitica" 
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 data-[state=inactive]:hover:bg-white/60"
          >
            Analitica
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorias" className="space-y-8">
          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-6 space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-700">
                  <FolderPlus className="h-5 w-5" />
                </div>
                Crear Nueva Categoría
              </CardTitle>
              <CardDescription className="text-base text-gray-500 mt-2">
                Agrega una nueva categoría al sistema con toda su información
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleCreateCategoria} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      Nombre de la Categoría
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newCategoria.nombre}
                      onChange={(e) => setNewCategoria({ ...newCategoria, nombre: e.target.value })}
                      placeholder="Ej: Perros, Gatos, etc."
                      required
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      Descripción
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newCategoria.descripcion}
                      onChange={(e) => setNewCategoria({ ...newCategoria, descripcion: e.target.value })}
                      placeholder="Breve descripción de la categoría"
                      required
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Campos para imágenes de marcas */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Imágenes de Marcas</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-900 block">
                        Marca 1 (Royal Canin)
                      </label>
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const imageUrl = await handleFileSelectMarca(e, 'marca1');
                            if (imageUrl) {
                              setNewCategoria({ ...newCategoria, imagen_marca1: imageUrl });
                            }
                          }}
                          className="hidden"
                          id="marca1-upload"
                        />
                        <label
                          htmlFor="marca1-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-green-400 hover:bg-green-50/50 group"
                        >
                          {newCategoria.imagen_marca1 ? (
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                              <Image
                                src={newCategoria.imagen_marca1}
                                alt="Marca 1 Preview"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewCategoria({ ...newCategoria, imagen_marca1: '' });
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="p-3 bg-gray-100 rounded-lg mb-2 group-hover:bg-green-100 transition-colors">
                                <Tag className="h-6 w-6 text-gray-400 group-hover:text-green-600" />
                              </div>
                              <p className="text-xs text-gray-500 text-center px-2">Click para subir</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-900 block">
                        Marca 2 (Purina)
                      </label>
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const imageUrl = await handleFileSelectMarca(e, 'marca2');
                            if (imageUrl) {
                              setNewCategoria({ ...newCategoria, imagen_marca2: imageUrl });
                            }
                          }}
                          className="hidden"
                          id="marca2-upload"
                        />
                        <label
                          htmlFor="marca2-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-green-400 hover:bg-green-50/50 group"
                        >
                          {newCategoria.imagen_marca2 ? (
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                              <Image
                                src={newCategoria.imagen_marca2}
                                alt="Marca 2 Preview"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewCategoria({ ...newCategoria, imagen_marca2: '' });
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="p-3 bg-gray-100 rounded-lg mb-2 group-hover:bg-green-100 transition-colors">
                                <Tag className="h-6 w-6 text-gray-400 group-hover:text-green-600" />
                              </div>
                              <p className="text-xs text-gray-500 text-center px-2">Click para subir</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-900 block">
                        Marca 3
                      </label>
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const imageUrl = await handleFileSelectMarca(e, 'marca3');
                            if (imageUrl) {
                              setNewCategoria({ ...newCategoria, imagen_marca3: imageUrl });
                            }
                          }}
                          className="hidden"
                          id="marca3-upload"
                        />
                        <label
                          htmlFor="marca3-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-green-400 hover:bg-green-50/50 group"
                        >
                          {newCategoria.imagen_marca3 ? (
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                              <Image
                                src={newCategoria.imagen_marca3}
                                alt="Marca 3 Preview"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewCategoria({ ...newCategoria, imagen_marca3: '' });
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="p-3 bg-gray-100 rounded-lg mb-2 group-hover:bg-green-100 transition-colors">
                                <Tag className="h-6 w-6 text-gray-400 group-hover:text-green-600" />
                              </div>
                              <p className="text-xs text-gray-500 text-center px-2">Click para subir</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campo para imagen de categoría */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Layout className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Banner de Categoría</h3>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900 block">
                      Imagen Banner Principal
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const imageUrl = await handleFileSelectCategoria(e);
                          if (imageUrl) {
                            setNewCategoria({ ...newCategoria, categoria_imagen: imageUrl });
                          }
                        }}
                        className="hidden"
                        id="categoria-banner-upload"
                      />
                      <label
                        htmlFor="categoria-banner-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-green-400 hover:bg-green-50/50 group"
                      >
                        {newCategoria.categoria_imagen ? (
                          <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <Image
                              src={newCategoria.categoria_imagen}
                              alt="Categoría Preview"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 100vw"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewCategoria({ ...newCategoria, categoria_imagen: '' });
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="p-4 bg-gray-100 rounded-lg mb-3 group-hover:bg-green-100 transition-colors">
                              <Layout className="h-8 w-8 text-gray-400 group-hover:text-green-600" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Click para subir banner</p>
                            <p className="text-xs text-gray-400 mt-1">Recomendado: 1200x400px</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Crear Categoría
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-6 space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <FolderOpen className="h-5 w-5" />
                </div>
                Categorías Existentes
              </CardTitle>
              <CardDescription className="text-base text-gray-500 mt-2">
                Gestiona y edita las categorías actuales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {categorias.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                    <FolderPlus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No hay categorías registradas</p>
                  <p className="text-sm text-gray-400">Crea tu primera categoría usando el formulario de arriba</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categorias.map((categoria) => (
                    <Card key={categoria.id} className="border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 bg-white">
                      <CardContent className="p-6">
                        {editingCategoria?.id === categoria.id ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Nombre de la Categoría</label>
                                <Input
                                  value={editingCategoria?.nombre || ''}
                                  onChange={(e) => setEditingCategoria({ ...editingCategoria!, nombre: e.target.value })}
                                  placeholder="Ej: Perros, Gatos, etc."
                                  className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Descripción</label>
                                <Input
                                  value={editingCategoria?.descripcion || ''}
                                  onChange={(e) => setEditingCategoria({ ...editingCategoria!, descripcion: e.target.value })}
                                  placeholder="Breve descripción de la categoría"
                                  className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                                />
                              </div>
                            </div>

                            {/* Campos para imágenes de marcas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Imagen Marca 1 (Royal Canin)
                                </label>
                                <div className="space-y-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const imageUrl = await handleFileSelectMarca(e, 'marca1-edit');
                                      if (imageUrl && editingCategoria) {
                                        setEditingCategoria({ ...editingCategoria, imagen_marca1: imageUrl });
                                      }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                                  />
                                  {editingCategoria?.imagen_marca1 && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                                      <div className="relative w-20 h-20">
                                        <Image
                                          src={editingCategoria.imagen_marca1}
                                          alt="Marca 1 Preview"
                                          fill
                                          className="object-cover rounded-lg border border-gray-300"
                                          sizes="80px"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => editingCategoria && setEditingCategoria({ ...editingCategoria, imagen_marca1: '' })}
                                        className="ml-2 text-red-500 text-sm hover:text-red-700"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Imagen Marca 2 (Purina)
                                </label>
                                <div className="space-y-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const imageUrl = await handleFileSelectMarca(e, 'marca2-edit');
                                      if (imageUrl && editingCategoria) {
                                        setEditingCategoria({ ...editingCategoria, imagen_marca2: imageUrl });
                                      }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                                  />
                                  {editingCategoria?.imagen_marca2 && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                                      <div className="relative w-20 h-20">
                                        <Image
                                          src={editingCategoria.imagen_marca2}
                                          alt="Marca 2 Preview"
                                          fill
                                          className="object-cover rounded-lg border border-gray-300"
                                          sizes="80px"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => editingCategoria && setEditingCategoria({ ...editingCategoria, imagen_marca2: '' })}
                                        className="ml-2 text-red-500 text-sm hover:text-red-700"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Imagen Marca 3
                                </label>
                                <div className="space-y-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const imageUrl = await handleFileSelectMarca(e, 'marca3-edit');
                                      if (imageUrl && editingCategoria) {
                                        setEditingCategoria({ ...editingCategoria, imagen_marca3: imageUrl });
                                      }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                                  />
                                  {editingCategoria?.imagen_marca3 && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                                      <div className="relative w-20 h-20">
                                        <Image
                                          src={editingCategoria.imagen_marca3}
                                          alt="Marca 3 Preview"
                                          fill
                                          className="object-cover rounded-lg border border-gray-300"
                                          sizes="80px"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => editingCategoria && setEditingCategoria({ ...editingCategoria, imagen_marca3: '' })}
                                        className="ml-2 text-red-500 text-sm hover:text-red-700"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Campo para imagen de categoría */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Imagen de la Categoría (Banner)
                              </label>
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const imageUrl = await handleFileSelectCategoria(e);
                                    if (imageUrl && editingCategoria) {
                                      setEditingCategoria({ ...editingCategoria, categoria_imagen: imageUrl });
                                    }
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                                />
                                {editingCategoria?.categoria_imagen && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                                    <div className="relative w-32 h-32">
                                      <Image
                                        src={editingCategoria.categoria_imagen}
                                        alt="Categoría Preview"
                                        fill
                                        className="object-cover rounded-lg border border-gray-300"
                                        sizes="128px"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => editingCategoria && setEditingCategoria({ ...editingCategoria, categoria_imagen: '' })}
                                      className="ml-2 text-red-500 text-sm hover:text-red-700"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                              <Button
                                onClick={() => handleUpdateCategoria(editingCategoria!)}
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Cambios
                              </Button>
                              <Button
                                onClick={cancelEditCategoria}
                                variant="outline"
                                size="sm"
                                className="border-gray-300 hover:bg-gray-50"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-6">
                              <div className="flex-1 space-y-4">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    {categoria.categoria_imagen ? (
                                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                        <Image
                                          src={categoria.categoria_imagen}
                                          alt={categoria.nombre}
                                          fill
                                          className="object-cover"
                                          sizes="32px"
                                        />
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-700 text-sm font-bold">
                                        {categoria.nombre.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                    {categoria.nombre.toUpperCase()}
                                  </h3>
                                  <p className="text-gray-600 text-sm leading-relaxed pl-10">
                                    {categoria.descripcion}
                                  </p>
                                </div>
                                
                                {/* Imágenes de Marcas */}
                                {(categoria.imagen_marca1 || categoria.imagen_marca2 || categoria.imagen_marca3) && (
                                  <div className="pl-10 space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marcas Asociadas</p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                      {categoria.imagen_marca1 && (
                                        <div className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                          <Image
                                            src={categoria.imagen_marca1}
                                            alt="Marca 1"
                                            fill
                                            className="object-contain p-2"
                                            sizes="64px"
                                          />
                                        </div>
                                      )}
                                      {categoria.imagen_marca2 && (
                                        <div className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                          <Image
                                            src={categoria.imagen_marca2}
                                            alt="Marca 2"
                                            fill
                                            className="object-contain p-2"
                                            sizes="64px"
                                          />
                                        </div>
                                      )}
                                      {categoria.imagen_marca3 && (
                                        <div className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                          <Image
                                            src={categoria.imagen_marca3}
                                            alt="Marca 3"
                                            fill
                                            className="object-contain p-2"
                                            sizes="64px"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-4 pl-10 text-xs text-gray-500">
                                  <span className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                    ID: <span className="font-medium text-gray-700">{categoria.id}</span>
                                  </span>
                                  {categoria.created_at && !isNaN(new Date(categoria.created_at).getTime()) && (
                                    <span className="flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                      Creado: <span className="font-medium text-gray-700">{new Date(categoria.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  onClick={() => startEditCategoria(categoria)}
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                                <Button
                                  onClick={() => handleDeleteCategoria(categoria.id || 0)}
                                  size="sm"
                                  variant="destructive"
                                  className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategorias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Crear Nueva Subcategoría
              </CardTitle>
              <CardDescription>
                Agrega una nueva subcategoría a una categoría existente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSubcategoria} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={newSubcategoria.categories_id}
                      onChange={(e) => setNewSubcategoria({ ...newSubcategoria, categories_id: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                      required
                    >
                      <option value={0}>Seleccionar categoría</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Subcategoría
                    </label>
                    <Input
                      value={newSubcategoria.nombre}
                      onChange={(e) => setNewSubcategoria({ ...newSubcategoria, nombre: e.target.value })}
                      placeholder="Ej: Comida para perros, Juguetes, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <Input
                      value={newSubcategoria.descripcion}
                      onChange={(e) => setNewSubcategoria({ ...newSubcategoria, descripcion: e.target.value })}
                      placeholder="Breve descripción"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#196428] hover:bg-[#145020] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Subcategoría
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subcategorías Existentes</CardTitle>
              <CardDescription>
                Gestiona las subcategorías actuales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros de búsqueda y categoría */}
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar subcategoría por nombre..."
                      value={busquedaSubcategorias}
                      onChange={(e) => setBusquedaSubcategorias(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={filtroCategoriaSubcategorias.toString()}
                    onValueChange={(value) => setFiltroCategoriaSubcategorias(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todas las categorías</SelectItem>
                      {(() => {
                        const filteredCategorias = categorias.filter((cat): cat is typeof cat & { id: number } => cat.id !== undefined && cat.id !== null);
                        return filteredCategorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id.toString()}>
                            {categoria.nombre}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(() => {
                // Filtrar subcategorías según los filtros
                const subcategoriasFiltradas = subcategorias.filter((subcategoria) => {
                  const coincideCategoria = filtroCategoriaSubcategorias === 0 || subcategoria.categories_id === filtroCategoriaSubcategorias;
                  const coincideBusqueda = busquedaSubcategorias === '' || 
                    subcategoria.nombre.toLowerCase().includes(busquedaSubcategorias.toLowerCase()) ||
                    subcategoria.descripcion?.toLowerCase().includes(busquedaSubcategorias.toLowerCase());
                  return coincideCategoria && coincideBusqueda;
                });

                if (subcategorias.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay subcategorías registradas</p>
                    </div>
                  );
                }

                if (subcategoriasFiltradas.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No se encontraron subcategorías con los filtros aplicados</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {subcategoriasFiltradas.map((subcategoria) => {
                    const categoria = categorias.find(c => c.id === subcategoria.categories_id);
                    return (
                      <Card key={subcategoria.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          {editingSubcategoria?.id === subcategoria.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select
                                  value={editingSubcategoria?.categories_id || ''}
                                  onChange={(e) => setEditingSubcategoria({ ...editingSubcategoria!, categories_id: parseInt(e.target.value) })}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                                >
                                  {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                      {categoria.nombre}
                                    </option>
                                  ))}
                                </select>
                                <Input
                                  value={editingSubcategoria?.nombre || ''}
                                  onChange={(e) => setEditingSubcategoria({ ...editingSubcategoria!, nombre: e.target.value })}
                                  placeholder="Nombre de la subcategoría"
                                />
                                <Input
                                  value={editingSubcategoria?.descripcion || ''}
                                  onChange={(e) => setEditingSubcategoria({ ...editingSubcategoria!, descripcion: e.target.value })}
                                  placeholder="Descripción"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleUpdateSubcategoria(editingSubcategoria!)}
                                  size="sm"
                                  className="bg-[#196428] hover:bg-[#145020] text-white"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Guardar
                                </Button>
                                <Button
                                  onClick={cancelEditSubcategoria}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    {categoria?.nombre}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                  {subcategoria.nombre}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {subcategoria.descripcion}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  ID: {subcategoria.id} • Creado: {new Date(subcategoria.created_at || '').toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  onClick={() => startEditSubcategoria(subcategoria)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteSubcategoria(subcategoria.id || 0, subcategoria.categories_id)}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Crear Nuevo Producto
              </CardTitle>
              <CardDescription>
                Agrega un nuevo producto al catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProducto} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategoría
                    </label>
                    <select
                      value={newProducto.subcategorias_id}
                      onChange={(e) => setNewProducto({ ...newProducto, subcategorias_id: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                      required
                    >
                      <option value={0}>Seleccionar subcategoría</option>
                      {subcategorias.map((subcategoria) => {
                        const categoria = categorias.find(c => c.id === subcategoria.categories_id);
                        return (
                          <option key={subcategoria.id} value={subcategoria.id}>
                            {categoria?.nombre} - {subcategoria.nombre}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Producto
                    </label>
                    <Input
                      value={newProducto.nombre}
                      onChange={(e) => setNewProducto({ ...newProducto, nombre: e.target.value })}
                      placeholder="Ej: Collar para perro, Juguete para gatos, etc."
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <Input
                      value={newProducto.descripcion}
                      onChange={(e) => setNewProducto({ ...newProducto, descripcion: e.target.value })}
                      placeholder="Descripción detallada del producto"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marca
                    </label>
                    <select
                      value={newProducto.id_marca}
                      onChange={(e) => setNewProducto({ ...newProducto, id_marca: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                    >
                      <option value={0}>Seleccionar marca</option>
                      {marcas.map((marca) => (
                        <option key={marca.id} value={marca.id}>
                          {marca.nombre_marca}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="descuento"
                      checked={newProducto.descuento || false}
                      onChange={(e) => setNewProducto({ ...newProducto, descuento: e.target.checked })}
                      className="rounded border-gray-300 text-[#196428] focus:ring-[#196428]"
                    />
                    <label htmlFor="descuento" className="text-sm font-medium text-gray-700">
                      ¿Tiene descuento?
                    </label>
                  </div>
                  {newProducto.descuento && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor del descuento (%)
                      </label>
                      <Input
                        type="text"
                        value={newProducto.descuento_valor}
                        onChange={(e) => setNewProducto({ ...newProducto, descuento_valor: e.target.value })}
                        placeholder="10.50"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="destacado"
                      checked={newProducto.destacado || false}
                      onChange={(e) => setNewProducto({ ...newProducto, destacado: e.target.checked })}
                      className="rounded border-gray-300 text-[#196428] focus:ring-[#196428]"
                    />
                    <label htmlFor="destacado" className="text-sm font-medium text-gray-700">
                      Producto destacado
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="novedad"
                      checked={newProducto.novedad || false}
                      onChange={(e) => setNewProducto({ ...newProducto, novedad: e.target.checked })}
                      className="rounded border-gray-300 text-[#196428] focus:ring-[#196428]"
                    />
                    <label htmlFor="novedad" className="text-sm font-medium text-gray-700">
                      Producto nuevo/novedad
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen del Producto
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const imageUrl = await handleFileSelect(e, newProducto.nombre || 'producto');
                          if (imageUrl) {
                            setNewProducto({ ...newProducto, imagen_url: imageUrl });
                          }
                        }}
                        disabled={imageUploading}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020] disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      {imageUploading && (
                        <p className="text-xs text-gray-500">Subiendo imagen...</p>
                      )}
                      {newProducto.imagen_url && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Imagen seleccionada:</p>
                          <div className="relative w-32 h-32">
                            <Image
                              src={newProducto.imagen_url}
                              alt="Preview"
                              fill
                              className="object-cover rounded-lg border border-gray-300"
                              sizes="128px"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewProducto({ ...newProducto, imagen_url: '' })}
                            className="ml-2 text-red-500 text-sm hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección de Tamaños */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Tamaños del Producto
                    </label>
                    <Button
                      type="button"
                      onClick={() => agregarTamano(newProducto, setNewProducto as any)}
                      variant="outline"
                      size="sm"
                      className="text-[#196428] border-[#196428] hover:bg-[#196428] hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Tamaño
                    </Button>
                  </div>

                  {newProducto.tamano && newProducto.tamano.length > 0 ? (
                    <div className="space-y-3">
                      {newProducto.tamano.map((tamano, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Cantidad
                            </label>
                            <Input
                              type="text"
                              value={tamano.cantidad}
                              onChange={(e) => actualizarTamano(newProducto, setNewProducto as any, index, 'cantidad', e.target.value)}
                              placeholder="500"
                              className="w-full"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Unidad
                            </label>
                            <select
                              value={tamano.unidad}
                              onChange={(e) => actualizarTamano(newProducto, setNewProducto as any, index, 'unidad', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm"
                            >
                              <option value="ML">Mililitros (ML)</option>
                              <option value="L">Litros (L)</option>
                              <option value="G">Gramos (G)</option>
                              <option value="KG">Kilogramos (KG)</option>
                              <option value="MG">Miligramos (MG)</option>
                              <option value="OZ">Onzas (OZ)</option>
                              <option value="LB">Libras (LB)</option>
                              <option value="UI">Unidad Internacional (UI)</option>
                              <option value="Unidad">Unidad</option>
                              <option value="Caja">Caja</option>
                              <option value="Tabletas">Tabletas</option>
                              <option value="Comprimidos">Comprimidos</option>
                              <option value="Sachet">Sachet</option>
                              <option value="Blister">Blister</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Precio ($)
                            </label>
                            <Input
                              type="text"
                              value={newProducto.precios?.[index] || ''}
                              onChange={(e) => actualizarPrecio(newProducto, setNewProducto as any, index, e.target.value)}
                              placeholder="0.00"
                              className="w-full"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Stock
                            </label>
                            <Input
                              type="text"
                              value={newProducto.stocks?.[index]?.stock || 0}
                              onChange={(e) => actualizarStock(newProducto, setNewProducto as any, index, parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => eliminarTamano(newProducto, setNewProducto as any, index)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-300 hover:bg-red-50 hover:border-red-500 mt-5"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      No hay tamaños definidos. Haz clic en &quot;Agregar Tamaño&quot; para añadir tamaños y precios al producto.
                    </div>
                  )}

                  {newProducto.tamano && newProducto.tamano.length > 0 && (
                    <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                      <strong>Ejemplos:</strong> 500 ML - $15.000 (Stock: 50), 1.5 KG - $28.000 (Stock: 25), 250 G - $8.500 (Stock: 100)
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={imageUploading} className="w-full bg-[#196428] hover:bg-[#145020] text-white disabled:opacity-60 disabled:cursor-not-allowed">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Producto
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos Existentes</CardTitle>
              <CardDescription>
                Gestiona los productos del catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros de búsqueda, categoría y subcategoría */}
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar producto por nombre..."
                      value={busquedaProductos}
                      onChange={(e) => setBusquedaProductos(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={filtroCategoriaProductos.toString()}
                    onValueChange={(value) => {
                      setFiltroCategoriaProductos(parseInt(value));
                      setFiltroSubcategoriaProductos(0); // Reset subcategoría cuando cambia la categoría
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todas las categorías</SelectItem>
                      {(() => {
                        const filteredCategorias = categorias.filter((cat): cat is typeof cat & { id: number } => cat.id !== undefined && cat.id !== null);
                        return filteredCategorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id.toString()}>
                            {categoria.nombre}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filtroSubcategoriaProductos.toString()}
                    onValueChange={(value) => setFiltroSubcategoriaProductos(parseInt(value))}
                    disabled={filtroCategoriaProductos === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todas las subcategorías</SelectItem>
                      {(() => {
                        const filteredSubcategorias = subcategorias
                          .filter(sub => filtroCategoriaProductos === 0 || sub.categories_id === filtroCategoriaProductos)
                          .filter((sub): sub is typeof sub & { id: number } => sub.id !== undefined && sub.id !== null);
                        return filteredSubcategorias.map((subcategoria) => {
                          const categoria = categorias.find(c => c.id === subcategoria.categories_id);
                          return (
                            <SelectItem key={subcategoria.id} value={subcategoria.id.toString()}>
                              {categoria?.nombre} - {subcategoria.nombre}
                            </SelectItem>
                          );
                        });
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(() => {
                // Filtrar productos según los filtros
                const productosFiltrados = productos.filter((producto) => {
                  const subcategoria = subcategorias.find(s => s.id === producto.subcategorias_id);
                  const categoria = categorias.find(c => c.id === subcategoria?.categories_id);
                  
                  const coincideNombre = busquedaProductos === '' || 
                    producto.nombre.toLowerCase().includes(busquedaProductos.toLowerCase()) ||
                    producto.descripcion?.toLowerCase().includes(busquedaProductos.toLowerCase());
                  
                  const coincideCategoria = filtroCategoriaProductos === 0 || 
                    subcategoria?.categories_id === filtroCategoriaProductos;
                  
                  const coincideSubcategoria = filtroSubcategoriaProductos === 0 || 
                    producto.subcategorias_id === filtroSubcategoriaProductos;
                  
                  return coincideNombre && coincideCategoria && coincideSubcategoria;
                });

                if (productos.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay productos registrados</p>
                    </div>
                  );
                }

                if (productosFiltrados.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No se encontraron productos con los filtros aplicados</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {productosFiltrados.map((producto) => {
                    const subcategoria = subcategorias.find(s => s.id === producto.subcategorias_id);
                    const categoria = categorias.find(c => c.id === subcategoria?.categories_id);
                    const marca = marcas.find(m => m.id === producto.id_marca);
                    return (
                      <Card key={producto.id} className="border-l-4 border-l-[#196428]">
                        <CardContent className="p-4">
                          {editingProducto?.id === producto.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                  value={editingProducto?.subcategorias_id}
                                  onChange={(e) => editingProducto && setEditingProducto({
                                    ...editingProducto,
                                    subcategorias_id: parseInt(e.target.value)
                                  })}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                                >
                                  {subcategorias.map((subcategoria) => {
                                    const categoria = categorias.find(c => c.id === subcategoria.categories_id);
                                    return (
                                      <option key={subcategoria.id} value={subcategoria.id}>
                                        {categoria?.nombre} - {subcategoria.nombre}
                                      </option>
                                    );
                                  })}
                                </select>
                                <Input
                                  value={editingProducto?.nombre || ''}
                                  onChange={(e) => editingProducto && setEditingProducto({ 
                                    ...editingProducto, 
                                    nombre: e.target.value 
                                  })}
                                  placeholder="Nombre del producto"
                                />
                                <Input
                                  value={editingProducto?.descripcion || ''}
                                  onChange={(e) => editingProducto && setEditingProducto({ 
                                    ...editingProducto, 
                                    descripcion: e.target.value 
                                  })}
                                  placeholder="Descripción"
                                  className="md:col-span-2"
                                />
                                <select
                                  value={editingProducto?.id_marca?.toString() || ''}
                                  onChange={(e) => editingProducto && setEditingProducto({
                                    ...editingProducto,
                                    id_marca: e.target.value ? parseInt(e.target.value) : null
                                  })}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                                >
                                  <option value="">Seleccionar marca</option>
                                  {marcas.map((marca) => (
                                    <option key={marca.id} value={marca.id}>
                                      {marca.nombre_marca}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="edit-descuento"
                                    checked={editingProducto?.descuento || false}
                                    onChange={(e) => editingProducto && setEditingProducto({
                                      ...editingProducto,
                                      descuento: e.target.checked
                                    })}
                                    className="rounded border-gray-300 text-[#196428] focus:ring-[#196428]"
                                  />
                                  <label htmlFor="edit-descuento" className="text-sm font-medium text-gray-700">
                                    ¿Tiene descuento?
                                  </label>
                                </div>
                                {editingProducto?.descuento && (
                                  <Input
                                    type="text"
                                    value={editingProducto?.descuento_valor || ''}
                                    onChange={(e) => editingProducto && setEditingProducto({
                                      ...editingProducto,
                                      descuento_valor: e.target.value
                                    })}
                                    placeholder="10.50"
                                  />
                                )}
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="edit-destacado"
                                    checked={editingProducto?.destacado || false}
                                    onChange={(e) => editingProducto && setEditingProducto({
                                      ...editingProducto,
                                      destacado: e.target.checked
                                    })}
                                    className="rounded border-gray-300 text-[#196428] focus:ring-[#196428]"
                                  />
                                  <label htmlFor="edit-destacado" className="text-sm font-medium text-gray-700">
                                    Producto destacado
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="edit-novedad"
                                    checked={editingProducto?.novedad || false}
                                    onChange={(e) => editingProducto && setEditingProducto({
                                      ...editingProducto,
                                      novedad: e.target.checked
                                    })}
                                    className="rounded border-gray-300 text-[#196428] focus:ring-[#196428]"
                                  />
                                  <label htmlFor="edit-novedad" className="text-sm font-medium text-gray-700">
                                    Producto nuevo/novedad
                                  </label>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Imagen del Producto
                                  </label>
                                  <div className="space-y-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        if (editingProducto) {
                                          const imageUrl = await handleFileSelect(e, editingProducto.nombre || 'producto');
                                          if (imageUrl) {
                                            setEditingProducto({ ...editingProducto, imagen_url: imageUrl });
                                          }
                                        }
                                      }}
                                      disabled={imageUploading}
                                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020] disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                    {imageUploading && (
                                      <p className="text-xs text-gray-500">Subiendo imagen...</p>
                                    )}
                                    {editingProducto?.imagen_url && (
                                      <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                                        <div className="relative w-32 h-32">
                                          <Image
                                            src={editingProducto.imagen_url}
                                            alt="Preview"
                                            fill
                                            className="object-cover rounded-lg border border-gray-300"
                                            sizes="128px"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => editingProducto && setEditingProducto({ ...editingProducto, imagen_url: '' })}
                                          className="ml-2 text-red-500 text-sm hover:text-red-700"
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Sección de Tamaños - Edición */}
                                <div className="md:col-span-2 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Tamaños del Producto
                                    </label>
                                    <Button
                                      type="button"
                                      onClick={() => editingProducto && agregarTamano(editingProducto, setEditingProducto)}
                                      variant="outline"
                                      size="sm"
                                      className="text-[#196428] border-[#196428] hover:bg-[#196428] hover:text-white"
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Agregar Tamaño
                                    </Button>
                                  </div>

                                  {editingProducto?.tamano && editingProducto.tamano.length > 0 ? (
                                    <div className="space-y-3">
                                      {editingProducto.tamano.map((tamano, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                          <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                              Cantidad
                                            </label>
                                            <Input
                                              type="text"
                                              value={tamano.cantidad}
                                              onChange={(e) => editingProducto && actualizarTamano(editingProducto, setEditingProducto, index, 'cantidad', e.target.value)}
                                              placeholder="500"
                                              className="w-full"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                              Unidad
                                            </label>
                                            <select
                                              value={tamano.unidad}
                                              onChange={(e) => editingProducto && actualizarTamano(editingProducto, setEditingProducto, index, 'unidad', e.target.value)}
                                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm"
                                            >
                                              <option value="ML">Mililitros (ML)</option>
                                              <option value="L">Litros (L)</option>
                                              <option value="G">Gramos (G)</option>
                                              <option value="KG">Kilogramos (KG)</option>
                                              <option value="MG">Miligramos (MG)</option>
                                              <option value="OZ">Onzas (OZ)</option>
                                              <option value="LB">Libras (LB)</option>
                                              <option value="UI">Unidad Internacional (UI)</option>
                                              <option value="Unidad">Unidad</option>
                                              <option value="Caja">Caja</option>
                                              <option value="Tabletas">Tabletas</option>
                                              <option value="Comprimidos">Comprimidos</option>
                                              <option value="Sachet">Sachet</option>
                                              <option value="Blister">Blister</option>
                                            </select>
                                          </div>
                                          <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                              Precio ($)
                                            </label>
                                            <Input
                                              type="text"
                                              value={editingProducto.precios?.[index] || ''}
                                              onChange={(e) => editingProducto && actualizarPrecio(editingProducto, setEditingProducto, index, e.target.value)}
                                              placeholder="0.00"
                                              className="w-full"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                              Stock
                                            </label>
                                            <Input
                                              type="text"
                                              value={editingProducto.stocks?.[index]?.stock || 0}
                                              onChange={(e) => editingProducto && actualizarStock(editingProducto, setEditingProducto, index, parseInt(e.target.value) || 0)}
                                              placeholder="0"
                                              className="w-full"
                                            />
                                          </div>
                                          <Button
                                            type="button"
                                            onClick={() => editingProducto && eliminarTamano(editingProducto, setEditingProducto as any, index)}
                                            variant="outline"
                                            size="sm"
                                            className="text-red-500 border-red-300 hover:bg-red-50 hover:border-red-500 mt-5"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                      No hay tamaños definidos. Haz clic en &quot;Agregar Tamaño&quot; para añadir tamaños y precios al producto.
                                    </div>
                                  )}

                                  {editingProducto?.tamano && editingProducto.tamano.length > 0 && (
                                    <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                                      <strong>Ejemplos:</strong> 500 ML - $15.000 (Stock: 50), 1.5 KG - $28.000 (Stock: 25), 250 G - $8.500 (Stock: 100)
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    if (editingProducto) {
                                      handleUpdateProducto(editingProducto);
                                    }
                                  }}
                                  size="sm"
                                  disabled={imageUploading}
                                  className="bg-[#196428] hover:bg-[#145020] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Guardar
                                </Button>
                                <Button
                                  onClick={cancelEditProducto}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-[#196428] bg-green-100 px-2 py-1 rounded">
                                    {categoria?.nombre} - {subcategoria?.nombre}
                                  </span>
                                  {marca && (
                                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      {marca.nombre_marca}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-start gap-4">
                                  {producto.imagen_url && (
                                    <div className="relative w-24 h-24">
                                      <Image 
                                        src={producto.imagen_url} 
                                        alt={producto.nombre}
                                        fill
                                        className="object-cover rounded-lg"
                                        sizes="96px"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                      {producto.nombre}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                      {producto.descripcion}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                      {producto.stocks && producto.stocks.length > 0 && (
                                        <span>Stock total: {producto.stocks.reduce((total, item) => total + item.stock, 0)} unidades</span>
                                      )}
                                      {producto.descuento && (
                                        <span className="text-green-600 font-medium">
                                          Descuento: {producto.descuento_valor}%
                                        </span>
                                      )}
                                      {producto.destacado && (
                                        <span className="text-yellow-600 font-medium">
                                          ⭐ Destacado
                                        </span>
                                      )}
                                      {producto.novedad && (
                                        <span className="text-green-600 font-medium">
                                          🆕 Novedad
                                        </span>
                                      )}
                                    </div>
                                    {producto.tamano && producto.tamano.length > 0 && (
                                      <div className="mt-2">
                                        <span className="text-sm font-medium text-gray-700">Tamaños, Precios y Stock: </span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {producto.tamano.map((tamano, index) => {
                                            const stock = producto.stocks?.[index]?.stock || 0;
                                            return (
                                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                                                {tamano.cantidad} {tamano.unidad} - ${producto.precios?.[index] ? formatPrice(producto.precios[index]) : 'N/A'} (Stock: {stock})
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                      ID: {producto.id} • Creado: {new Date(producto.created_at || '').toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  onClick={() => startEditProducto(producto)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteProducto(producto.id || 0)}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marcas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Crear Nueva Marca
              </CardTitle>
              <CardDescription>
                Agrega una nueva marca al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMarca} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Marca
                  </label>
                  <Input
                    value={newMarca.nombre_marca}
                    onChange={(e) => setNewMarca({ nombre_marca: e.target.value })}
                    placeholder="Ej: Royal Canin, Purina, etc."
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Marca
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Marcas Existentes ({marcas.length})
              </CardTitle>
              <CardDescription>
                Gestiona las marcas existentes en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {marcas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay marcas registradas aún. Crea la primera marca arriba.
                </p>
              ) : (
                <div className="space-y-3">
                  {marcas.map((marca) => (
                    <div key={marca.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        {editingMarca && editingMarca.id === marca.id ? (
                          <form onSubmit={handleUpdateMarca} className="flex items-center gap-3 w-full">
                            <Input
                              value={editingMarca.nombre_marca}
                              onChange={(e) => setEditingMarca({ ...editingMarca, nombre_marca: e.target.value })}
                              className="flex-1"
                              required
                            />
                            <Button type="submit" size="sm">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button type="button" onClick={cancelEditMarca} size="sm" variant="outline">
                              <X className="h-4 w-4" />
                            </Button>
                          </form>
                        ) : (
                          <div>
                            <h4 className="font-medium text-gray-900">{marca.nombre_marca}</h4>
                            <p className="text-xs text-gray-400">
                              ID: {marca.id} • Creado: {marca.created_at ? new Date(marca.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                      {(!editingMarca || editingMarca.id !== marca.id) && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => startEditMarca(marca)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteMarca(marca.id || 0)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PESTAÑA UI */}
        <TabsContent value="ui" className="space-y-6">
          {/* Selector de categoría UI */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              onClick={() => setUiCategory('inicio')}
              variant={uiCategory === 'inicio' ? 'default' : 'outline'}
              className={uiCategory === 'inicio' ? 'bg-[#196428] hover:bg-[#145020]' : ''}
            >
              Inicio (Banners y Popups)
            </Button>
            <Button
              type="button"
              onClick={() => setUiCategory('sobre-nosotros')}
              variant={uiCategory === 'sobre-nosotros' ? 'default' : 'outline'}
              className={uiCategory === 'sobre-nosotros' ? 'bg-[#196428] hover:bg-[#145020]' : ''}
            >
              Sobre Nosotros
            </Button>
          </div>

          {/* Categoría: Inicio (Banners y Popups) */}
          {uiCategory === 'inicio' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Gestionar Elementos UI - Inicio
                  </CardTitle>
                  <CardDescription>
                    Configura banners, banners ocultos y popups del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={editingUI ? handleUpdateUI : handleCreateUI} className="space-y-6">
                {/* Banner - Múltiples archivos */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Banner (Múltiples imágenes/videos)
                  </label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={async (e) => {
                      const url = await handleFileSelectUI(e, 'banner');
                      if (url) {
                        if (editingUI) {
                          setEditingUI({
                            ...editingUI,
                            banner: [...(editingUI.banner || []), url]
                          });
                        } else {
                          setNewUI({
                            ...newUI,
                            banner: [...(newUI.banner || []), url]
                          });
                        }
                      }
                    }}
                    disabled={imageUploading}
                    className="w-full"
                  />
                  {imageUploading && (
                    <p className="text-sm text-blue-600">Subiendo archivo...</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {(editingUI ? editingUI.banner : newUI.banner)?.map((url, index) => (
                      <div key={index} className="relative group">
                        {url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? (
                          <video src={url} className="w-full h-32 object-cover rounded-lg" controls />
                        ) : (
                          <div className="relative w-full h-32">
                            <Image src={url} alt={`Banner ${index + 1}`} fill className="object-cover rounded-lg" sizes="(max-width: 768px) 100vw, 33vw" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="bg-white/80 hover:bg-white"
                            onClick={() => editingUI && moveBannerUp(index)}
                            disabled={!editingUI || index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="bg-white/80 hover:bg-white"
                            onClick={() => editingUI && moveBannerDown(index)}
                            disabled={!editingUI || !editingUI.banner || index === editingUI.banner.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (editingUI) {
                                setEditingUI({
                                  ...editingUI,
                                  banner: editingUI.banner?.filter((_, i) => i !== index) || []
                                });
                              } else {
                                setNewUI({
                                  ...newUI,
                                  banner: newUI.banner?.filter((_, i) => i !== index) || []
                                });
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hidden Banner - Múltiples archivos */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Banner Oculto (Múltiples imágenes/videos)
                  </label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={async (e) => {
                      const url = await handleFileSelectUI(e, 'hiddenbanner');
                      if (url) {
                        if (editingUI) {
                          setEditingUI({
                            ...editingUI,
                            hiddenbanner: [...(editingUI.hiddenbanner || []), url]
                          });
                        } else {
                          setNewUI({
                            ...newUI,
                            hiddenbanner: [...(newUI.hiddenbanner || []), url]
                          });
                        }
                      }
                    }}
                    disabled={imageUploading}
                    className="w-full"
                  />
                  {imageUploading && (
                    <p className="text-sm text-blue-600">Subiendo archivo...</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {(editingUI ? editingUI.hiddenbanner : newUI.hiddenbanner)?.map((url, index) => (
                      <div key={index} className="relative group">
                        {url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? (
                          <video src={url} className="w-full h-32 object-cover rounded-lg" controls />
                        ) : (
                          <div className="relative w-full h-32">
                            <Image src={url} alt={`Hidden Banner ${index + 1}`} fill className="object-cover rounded-lg" sizes="(max-width: 768px) 100vw, 33vw" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="bg-white/80 hover:bg-white"
                            onClick={() => editingUI && moveHiddenBannerUp(index)}
                            disabled={!editingUI || index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="bg-white/80 hover:bg-white"
                            onClick={() => editingUI && moveHiddenBannerDown(index)}
                            disabled={!editingUI || !editingUI.hiddenbanner || index === editingUI.hiddenbanner.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (editingUI) {
                                setEditingUI({
                                  ...editingUI,
                                  hiddenbanner: editingUI.hiddenbanner?.filter((_, i) => i !== index) || []
                                });
                              } else {
                                setNewUI({
                                  ...newUI,
                                  hiddenbanner: newUI.hiddenbanner?.filter((_, i) => i !== index) || []
                                });
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popup - Un solo archivo */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Popup (Una imagen/video)
                  </label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={async (e) => {
                      const url = await handleFileSelectUI(e, 'popup');
                      if (url) {
                        if (editingUI) {
                          setEditingUI({
                            ...editingUI,
                            popup: url
                          });
                        } else {
                          setNewUI({
                            ...newUI,
                            popup: url
                          });
                        }
                      }
                    }}
                    disabled={imageUploading}
                    className="w-full"
                  />
                  {imageUploading && (
                    <p className="text-sm text-blue-600">Subiendo archivo...</p>
                  )}
                  {(editingUI ? editingUI.popup : newUI.popup) && (
                    <div className="relative group mt-3 max-w-md">
                      {(editingUI ? editingUI.popup : newUI.popup)?.includes('.mp4') || 
                       (editingUI ? editingUI.popup : newUI.popup)?.includes('.webm') || 
                       (editingUI ? editingUI.popup : newUI.popup)?.includes('.mov') ? (
                        <video src={editingUI ? editingUI.popup! : newUI.popup!} className="w-full h-48 object-cover rounded-lg" controls />
                      ) : (
                        <div className="relative w-full h-48">
                          <Image src={editingUI ? editingUI.popup! : newUI.popup!} alt="Popup" fill className="object-cover rounded-lg" sizes="(max-width: 768px) 100vw, 400px" />
                        </div>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          if (editingUI) {
                            setEditingUI({
                              ...editingUI,
                              popup: null
                            });
                          } else {
                            setNewUI({
                              ...newUI,
                              popup: null
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={imageUploading}
                    className="bg-[#196428] hover:bg-[#145020] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {editingUI ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Actualizar UI
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear UI
                      </>
                    )}
                  </Button>
                  {editingUI && (
                    <Button 
                      type="button" 
                      onClick={cancelEditUI}
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

              {/* Lista de elementos UI existentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Elementos UI Existentes</CardTitle>
                  <CardDescription>
                    {uiElements.length === 0 ? 'No hay elementos UI configurados' : `${uiElements.length} elemento(s) configurado(s)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uiElements.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hay elementos UI. Crea uno usando el formulario arriba.</p>
                  ) : (
                    <div className="space-y-4">
                      {uiElements.map((ui) => (
                        <div key={ui.id} className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900">Elemento UI #{ui.id}</h4>
                              <p className="text-xs text-gray-400">
                                Creado: {ui.created_at ? new Date(ui.created_at).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => startEditUI(ui)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteUI(ui.id || 0)}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Mostrar Banners */}
                            {ui.banner && ui.banner.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Banners ({ui.banner.length})</h5>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                  {ui.banner.map((url, index) => (
                                    <div key={index} className="relative">
                                      {url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? (
                                        <video src={url} className="w-full h-20 object-cover rounded" />
                                      ) : (
                                        <div className="relative w-full h-20">
                                          <Image src={url} alt={`Banner ${index + 1}`} fill className="object-cover rounded" sizes="(max-width: 768px) 100vw, 25vw" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Mostrar Hidden Banners */}
                            {ui.hiddenbanner && ui.hiddenbanner.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Banners Ocultos ({ui.hiddenbanner.length})</h5>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                  {ui.hiddenbanner.map((url, index) => (
                                    <div key={index} className="relative">
                                      {url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? (
                                        <video src={url} className="w-full h-20 object-cover rounded" />
                                      ) : (
                                        <div className="relative w-full h-20">
                                          <Image src={url} alt={`Hidden Banner ${index + 1}`} fill className="object-cover rounded" sizes="(max-width: 768px) 100vw, 25vw" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Mostrar Popup */}
                            {ui.popup && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Popup</h5>
                                <div className="max-w-xs">
                                  {ui.popup.includes('.mp4') || ui.popup.includes('.webm') || ui.popup.includes('.mov') ? (
                                    <video src={ui.popup} className="w-full h-32 object-cover rounded" controls />
                                  ) : (
                                    <div className="relative w-full h-32">
                                      <Image src={ui.popup} alt="Popup" fill className="object-cover rounded" sizes="(max-width: 768px) 100vw, 320px" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Categoría: Sobre Nosotros */}
          {uiCategory === 'sobre-nosotros' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Editar Contenido de Sobre Nosotros
                </CardTitle>
                <CardDescription>
                  Personaliza los textos de la página Sobre Nosotros
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!sobreNosotros ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay datos de Sobre Nosotros disponibles.</p>
                    <p className="text-sm text-gray-400 mt-2">Ejecuta el archivo database_sobre_nosotros.sql en Supabase.</p>
                  </div>
                ) : !editingSobreNosotros ? (
                  <div className="space-y-4">
                    <Button
                      onClick={startEditSobreNosotros}
                      className="bg-[#196428] hover:bg-[#145020] text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Contenido
                    </Button>
                    
                    <div className="space-y-6 pt-4 border-t">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Banner Principal</h3>
                        <p className="text-gray-900">{sobreNosotros.banner_texto}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Misión</h3>
                        <p className="text-lg font-medium text-gray-900 mb-2">{sobreNosotros.mision_titulo}</p>
                        <p className="text-gray-700 mb-2">{sobreNosotros.mision_parrafo1}</p>
                        <p className="text-gray-700">{sobreNosotros.mision_parrafo2}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Visión</h3>
                        <p className="text-lg font-medium text-gray-900 mb-2">{sobreNosotros.vision_titulo}</p>
                        <p className="text-gray-700 mb-2">{sobreNosotros.vision_parrafo1}</p>
                        <p className="text-gray-700">{sobreNosotros.vision_parrafo2}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Identidad Corporativa</h3>
                        <p className="text-lg font-medium text-gray-900 mb-2">{sobreNosotros.identidad_titulo}</p>
                        <p className="text-gray-700 mb-2">Banner: {sobreNosotros.identidad_banner_texto}</p>
                        <p className="text-gray-700">{sobreNosotros.valores_titulo}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">{sobreNosotros.valor1_titulo}</h4>
                          <p className="text-sm text-gray-600">{sobreNosotros.valor1_descripcion}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">{sobreNosotros.valor2_titulo}</h4>
                          <p className="text-sm text-gray-600">{sobreNosotros.valor2_descripcion}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">{sobreNosotros.valor3_titulo}</h4>
                          <p className="text-sm text-gray-600">{sobreNosotros.valor3_descripcion}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">{sobreNosotros.valor4_titulo}</h4>
                          <p className="text-sm text-gray-600">{sobreNosotros.valor4_descripcion}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">{sobreNosotros.valor5_titulo}</h4>
                          <p className="text-sm text-gray-600">{sobreNosotros.valor5_descripcion}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">{sobreNosotros.valor6_titulo}</h4>
                          <p className="text-sm text-gray-600">{sobreNosotros.valor6_descripcion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateSobreNosotros} className="space-y-6">
                    {/* Banner Principal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto del Banner Principal
                      </label>
                      <Input
                        value={editingSobreNosotros.banner_texto || ''}
                        onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, banner_texto: e.target.value })}
                        placeholder="Comprometidos con la excelencia"
                      />
                    </div>

                    {/* Misión */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900">Misión</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título de Misión
                        </label>
                        <Input
                          value={editingSobreNosotros.mision_titulo || ''}
                          onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, mision_titulo: e.target.value })}
                          placeholder="Misión"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Misión - Párrafo 1
                        </label>
                        <textarea
                          value={editingSobreNosotros.mision_parrafo1 || ''}
                          onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, mision_parrafo1: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                          placeholder="Primer párrafo de la misión..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Misión - Párrafo 2
                        </label>
                        <textarea
                          value={editingSobreNosotros.mision_parrafo2 || ''}
                          onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, mision_parrafo2: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                          placeholder="Segundo párrafo de la misión..."
                        />
                      </div>
                    </div>

                    {/* Visión */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900">Visión</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título de Visión
                        </label>
                        <Input
                          value={editingSobreNosotros.vision_titulo || ''}
                          onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, vision_titulo: e.target.value })}
                          placeholder="Visión"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visión - Párrafo 1
                        </label>
                        <textarea
                          value={editingSobreNosotros.vision_parrafo1 || ''}
                          onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, vision_parrafo1: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                          placeholder="Primer párrafo de la visión..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visión - Párrafo 2
                        </label>
                        <textarea
                          value={editingSobreNosotros.vision_parrafo2 || ''}
                          onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, vision_parrafo2: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428]"
                          placeholder="Segundo párrafo de la visión..."
                        />
                      </div>
                    </div>

                    {/* Identidad Corporativa */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900">Identidad Corporativa</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título de Identidad Corporativa
                        </label>
                        <Input
                          value={editingSobreNosotros.identidad_titulo || ''}
                          onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, identidad_titulo: e.target.value })}
                          placeholder="Identidad Corporativa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Texto del Banner de Identidad
                        </label>
                        <Input
                          value={editingSobreNosotros.identidad_banner_texto || ''}
                          onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, identidad_banner_texto: e.target.value })}
                          placeholder="Nuestros valores en acción"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título de Valores
                        </label>
                        <Input
                          value={editingSobreNosotros.valores_titulo || ''}
                          onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valores_titulo: e.target.value })}
                          placeholder="Valores Corporativos"
                        />
                      </div>
                    </div>

                    {/* Valores Corporativos */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900">Valores Corporativos</h3>
                      
                      {/* Valor 1 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 1 - Título</label>
                          <Input
                            value={editingSobreNosotros.valor1_titulo || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor1_titulo: e.target.value })}
                            placeholder="Trabajo en equipo"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 1 - Descripción</label>
                          <textarea
                            value={editingSobreNosotros.valor1_descripcion || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor1_descripcion: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm"
                            placeholder="Descripción del valor..."
                          />
                        </div>
                      </div>

                      {/* Valor 2 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 2 - Título</label>
                          <Input
                            value={editingSobreNosotros.valor2_titulo || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor2_titulo: e.target.value })}
                            placeholder="Transparencia"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 2 - Descripción</label>
                          <textarea
                            value={editingSobreNosotros.valor2_descripcion || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor2_descripcion: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm"
                            placeholder="Descripción del valor..."
                          />
                        </div>
                      </div>

                      {/* Valor 3 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 3 - Título</label>
                          <Input
                            value={editingSobreNosotros.valor3_titulo || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor3_titulo: e.target.value })}
                            placeholder="Integridad"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 3 - Descripción</label>
                          <textarea
                            value={editingSobreNosotros.valor3_descripcion || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor3_descripcion: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm"
                            placeholder="Descripción del valor..."
                          />
                        </div>
                      </div>

                      {/* Valor 4 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 4 - Título</label>
                          <Input
                            value={editingSobreNosotros.valor4_titulo || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor4_titulo: e.target.value })}
                            placeholder="Sostenibilidad"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 4 - Descripción</label>
                          <textarea
                            value={editingSobreNosotros.valor4_descripcion || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor4_descripcion: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm"
                            placeholder="Descripción del valor..."
                          />
                        </div>
                      </div>

                      {/* Valor 5 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 5 - Título</label>
                          <Input
                            value={editingSobreNosotros.valor5_titulo || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor5_titulo: e.target.value })}
                            placeholder="Responsabilidad"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 5 - Descripción</label>
                          <textarea
                            value={editingSobreNosotros.valor5_descripcion || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor5_descripcion: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm"
                            placeholder="Descripción del valor..."
                          />
                        </div>
                      </div>

                      {/* Valor 6 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 6 - Título</label>
                          <Input
                            value={editingSobreNosotros.valor6_titulo || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor6_titulo: e.target.value })}
                            placeholder="Creatividad"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Valor 6 - Descripción</label>
                          <textarea
                            value={editingSobreNosotros.valor6_descripcion || ''}
                            onChange={(e) => setEditingSobreNosotros({ ...editingSobreNosotros, valor6_descripcion: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm"
                            placeholder="Descripción del valor..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        className="bg-[#196428] hover:bg-[#145020] text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </Button>
                      <Button 
                        type="button" 
                        onClick={cancelEditSobreNosotros}
                        variant="outline"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tiendas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Crear Nueva Tienda
              </CardTitle>
              <CardDescription>
                Agrega una nueva tienda al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTienda} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Tienda *
                    </label>
                    <Input
                      value={newTienda.nombre}
                      onChange={(e) => setNewTienda({ ...newTienda, nombre: e.target.value })}
                      placeholder="Ej: Veterinaria El Hato"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <Input
                      value={newTienda.ciudad}
                      onChange={(e) => setNewTienda({ ...newTienda, ciudad: e.target.value })}
                      placeholder="Ej: Bucaramanga"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <Input
                      value={newTienda.direccion}
                      onChange={(e) => setNewTienda({ ...newTienda, direccion: e.target.value })}
                      placeholder="Ej: Av. Q. seca 21 - 59"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <Input
                      value={newTienda.telefono}
                      onChange={(e) => setNewTienda({ ...newTienda, telefono: e.target.value })}
                      placeholder="Ej: 3112777907"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de Contacto *
                    </label>
                    <Input
                      value={newTienda.contacto}
                      onChange={(e) => setNewTienda({ ...newTienda, contacto: e.target.value })}
                      placeholder="Ej: Marsheri Lozano"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitud (GPS) *
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={newTienda.lat}
                      onChange={(e) => setNewTienda({ ...newTienda, lat: parseFloat(e.target.value) || 0 })}
                      placeholder="Ej: 7.1249"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitud (GPS) *
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={newTienda.lng}
                      onChange={(e) => setNewTienda({ ...newTienda, lng: parseFloat(e.target.value) || 0 })}
                      placeholder="Ej: -73.1229"
                      required
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Puedes obtener las coordenadas GPS desde Google Maps haciendo clic derecho en la ubicación y seleccionando las coordenadas que aparecen.
                </div>
                <Button type="submit" className="w-full bg-[#196428] hover:bg-[#145020] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Tienda
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tiendas Existentes ({tiendas.length})</CardTitle>
              <CardDescription>
                Gestiona las tiendas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tiendas.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay tiendas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tiendas.map((tienda) => (
                    <Card key={tienda.id} className="border-l-4 border-l-[#196428]">
                      <CardContent className="p-4">
                        {editingTienda?.id === tienda.id ? (
                          <form onSubmit={handleUpdateTienda} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={editingTienda?.nombre || ''}
                                onChange={(e) => editingTienda && setEditingTienda({ ...editingTienda, nombre: e.target.value })}
                                placeholder="Nombre de la tienda"
                                required
                              />
                              <Input
                                value={editingTienda?.ciudad || ''}
                                onChange={(e) => editingTienda && setEditingTienda({ ...editingTienda, ciudad: e.target.value })}
                                placeholder="Ciudad"
                                required
                              />
                              <Input
                                value={editingTienda?.direccion || ''}
                                onChange={(e) => editingTienda && setEditingTienda({ ...editingTienda, direccion: e.target.value })}
                                placeholder="Dirección"
                                className="md:col-span-2"
                                required
                              />
                              <Input
                                value={editingTienda?.telefono || ''}
                                onChange={(e) => editingTienda && setEditingTienda({ ...editingTienda, telefono: e.target.value })}
                                placeholder="Teléfono"
                                required
                              />
                              <Input
                                value={editingTienda?.contacto || ''}
                                onChange={(e) => editingTienda && setEditingTienda({ ...editingTienda, contacto: e.target.value })}
                                placeholder="Nombre de contacto"
                                required
                              />
                              <Input
                                type="number"
                                step="any"
                                value={editingTienda?.lat || 0}
                                onChange={(e) => editingTienda && setEditingTienda({ ...editingTienda, lat: parseFloat(e.target.value) || 0 })}
                                placeholder="Latitud"
                                required
                              />
                              <Input
                                type="number"
                                step="any"
                                value={editingTienda?.lng || 0}
                                onChange={(e) => editingTienda && setEditingTienda({ ...editingTienda, lng: parseFloat(e.target.value) || 0 })}
                                placeholder="Longitud"
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                size="sm"
                                className="bg-[#196428] hover:bg-[#145020] text-white"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Guardar
                              </Button>
                              <Button
                                type="button"
                                onClick={cancelEditTienda}
                                variant="outline"
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {tienda.nombre}
                                </h3>
                                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                  {tienda.ciudad}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {tienda.direccion}
                                </p>
                                <p>
                                  <strong>Teléfono:</strong> {tienda.telefono}
                                </p>
                                <p>
                                  <strong>Contacto:</strong> {tienda.contacto}
                                </p>
                                <p className="text-xs text-gray-400">
                                  <strong>GPS:</strong> {tienda.lat.toFixed(6)}, {tienda.lng.toFixed(6)}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  ID: {tienda.id} • Creado: {new Date(tienda.created_at || '').toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => startEditTienda(tienda)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteTienda(tienda.id || 0)}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aliados" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crear Nuevo Aliado
              </CardTitle>
              <CardDescription>
                Agrega una nueva imagen de aliado al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAliado} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Aliado
                    </label>
                    <Input
                      value={newAliado.nombre}
                      onChange={(e) => setNewAliado({ ...newAliado, nombre: e.target.value })}
                      placeholder="Ej: Royal Canin, Purina, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen del Aliado
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const imageUrl = await handleFileSelectAliado(e);
                          if (imageUrl) {
                            setNewAliado({ ...newAliado, imagen_url: imageUrl });
                          }
                        }}
                        disabled={imageUploading}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020] disabled:opacity-60 disabled:cursor-not-allowed"
                        required
                      />
                      {imageUploading && (
                        <p className="text-xs text-gray-500">Subiendo imagen...</p>
                      )}
                      {newAliado.imagen_url && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Imagen seleccionada:</p>
                          <div className="relative w-32 h-20">
                            <Image
                              src={newAliado.imagen_url}
                              alt="Aliado Preview"
                              fill
                              className="object-contain rounded-lg border border-gray-300"
                              sizes="128px"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewAliado({ ...newAliado, imagen_url: '' })}
                            className="ml-2 text-red-500 text-sm hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={imageUploading} className="w-full bg-[#196428] hover:bg-[#145020] text-white disabled:opacity-60 disabled:cursor-not-allowed">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Aliado
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aliados Existentes ({aliados.length})</CardTitle>
              <CardDescription>
                Gestiona las imágenes de aliados del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aliados.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay aliados registrados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aliados.map((aliado) => (
                    <Card key={aliado.id} className="border-l-4 border-l-[#196428]">
                      <CardContent className="p-4">
                        {editingAliado?.id === aliado.id ? (
                          <form onSubmit={handleUpdateAliado} className="space-y-4">
                            <Input
                              value={editingAliado?.nombre || ''}
                              onChange={(e) => editingAliado && setEditingAliado({ ...editingAliado, nombre: e.target.value })}
                              placeholder="Nombre del aliado"
                              required
                            />
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const imageUrl = await handleFileSelectAliado(e);
                                  if (imageUrl && editingAliado) {
                                    setEditingAliado({ ...editingAliado, imagen_url: imageUrl });
                                  }
                                }}
                                disabled={imageUploading}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020] disabled:opacity-60 disabled:cursor-not-allowed"
                              />
                              {imageUploading && (
                                <p className="text-xs text-gray-500">Subiendo imagen...</p>
                              )}
                              {editingAliado?.imagen_url && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                                  <div className="relative w-32 h-20">
                                    <Image
                                      src={editingAliado.imagen_url}
                                      alt="Aliado Preview"
                                      fill
                                      className="object-contain rounded-lg border border-gray-300"
                                      sizes="128px"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => editingAliado && setEditingAliado({ ...editingAliado, imagen_url: '' })}
                                    className="ml-2 text-red-500 text-sm hover:text-red-700"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                size="sm"
                                disabled={imageUploading}
                                className="bg-[#196428] hover:bg-[#145020] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Guardar
                              </Button>
                              <Button
                                type="button"
                                onClick={cancelEditAliado}
                                variant="outline"
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="relative w-16 h-10">
                                  <Image
                                    src={aliado.imagen_url}
                                    alt={aliado.nombre}
                                    fill
                                    className="object-contain rounded-lg border border-gray-300"
                                    sizes="64px"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {aliado.nombre}
                                  </h3>
                                  <p className="text-xs text-gray-400">
                                    ID: {aliado.id} • Creado: {new Date(aliado.created_at || '').toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => startEditAliado(aliado)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteAliado(aliado.id)}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vacantes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Gestión de Vacantes
              </CardTitle>
              <CardDescription>
                Gestiona ofertas laborales y revisa aplicaciones de candidatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista de Trabajos */}
                <div onClick={handleDeselectTrabajo}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Ofertas de Trabajo Disponibles</h3>
                    <button
                      onClick={handleCreateJob}
                      className="bg-[#196428] hover:bg-[#2d7a3d] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nueva Oferta</span>
                    </button>
                  </div>
                  {trabajos.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay ofertas laborales registradas</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trabajos.map((trabajo) => (
                        <div
                          key={trabajo.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedTrabajo?.id === trabajo.id
                              ? 'border-[#196428] bg-green-50/50 ring-1 ring-[#196428]/20'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectTrabajo(trabajo)
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 truncate">{trabajo.titulo}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  trabajo.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {trabajo.activo ? 'Activo' : 'Inactivo'}
                              </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">{trabajo.departamento}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {trabajo.ubicacion}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                {aplicaciones.filter(app => app.trabajo_id === trabajo.id).length}
                              </span>
                                </div>
                                <p className="text-sm font-medium text-green-600">{trabajo.salario}</p>
                              </div>
                            </div>
                            <div className="ml-3 flex-shrink-0 flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  handleEditJob(trabajo)
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar oferta"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  handleDeleteJob(trabajo.id)
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Eliminar oferta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aplicaciones del Trabajo Seleccionado */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {selectedTrabajo ? `Aplicaciones para: ${selectedTrabajo.titulo}` : 'Selecciona una oferta para ver aplicaciones'}
                  </h3>

                  {selectedTrabajo ? (
                    trabajoAplicaciones.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No hay aplicaciones para esta oferta</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {trabajoAplicaciones.map((aplicacion) => (
                          <div key={aplicacion.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 truncate">{aplicacion.nombre_aplicante}</h4>
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                    aplicacion.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                    aplicacion.estado === 'revisando' ? 'bg-blue-100 text-blue-700' :
                                    aplicacion.estado === 'aceptado' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {aplicacion.estado === 'pendiente' ? 'Pendiente' :
                                     aplicacion.estado === 'revisando' ? 'Revisando' :
                                     aplicacion.estado === 'aceptado' ? 'Aceptado' : 'Rechazado'}
                                </span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p className="flex items-center gap-2">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    {aplicacion.email_aplicante}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    {aplicacion.telefono_aplicante}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-3 text-right">
                                <p className="text-xs text-gray-400">
                                  {new Date(aplicacion.fecha_aplicacion).toLocaleDateString()}
                                </p>
                              </div>
                              </div>

                            {/* Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experiencia</span>
                                <p className="text-sm text-gray-900 mt-1">{aplicacion.experiencia_laboral || 'No especificada'}</p>
                                </div>
                                <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Disponibilidad</span>
                                <p className="text-sm text-gray-900 mt-1">{aplicacion.disponibilidad || 'No especificada'}</p>
                                </div>
                              </div>

                              {aplicacion.mensaje && (
                                <div className="mb-3">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mensaje</span>
                                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{aplicacion.mensaje}</p>
                                </div>
                              )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                {aplicacion.cv_url && (
                                  <button
                                    onClick={() => abrirCV(aplicacion.cv_url)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Ver CV
                                  </button>
                                )}
                              </div>

                              {aplicacion.estado === 'pendiente' && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => aceptarCandidato(aplicacion.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Aceptar
                                  </button>
                                  <button
                                    onClick={() => rechazarCandidato(aplicacion.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Rechazar
                                  </button>
                                </div>
                              )}

                              {aplicacion.estado === 'aceptado' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Aceptado
                                </div>
                              )}

                              {aplicacion.estado === 'rechazado' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  Rechazado
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Selecciona una oferta laboral para ver sus aplicaciones</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nueva pestaña de Pedidos */}
        <TabsContent value="pedidos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Gestión de Pedidos
                  </CardTitle>
                  <CardDescription>
                    Visualiza y gestiona todos los pedidos de los clientes
                  </CardDescription>
                </div>
                <Button
                  onClick={loadPedidos}
                  className="bg-[#196428] hover:bg-[#145020] text-white"
                >
                  Recargar Pedidos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pedidos.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No hay pedidos registrados</p>
                  <p className="text-gray-400 text-sm mt-2">Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filtros de Estado */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        Total: {getContadorPedidosPorEstado('todos')} pedido{getContadorPedidosPorEstado('todos') !== 1 ? 's' : ''}
                      </span>
                      </div>

                      {/* Mini buscador por #pedido */}
                      <div className="w-full lg:w-64">
                        <input
                          type="text"
                          value={pedidoSearch}
                          onChange={(e) => {
                            setPedidoSearch(e.target.value);
                            setPaginaPedidos(1); // Resetear a página 1 al buscar
                          }}
                          placeholder="Buscar por #pedido"
                          className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          setFiltroEstadoPedidos('todos');
                          setPaginaPedidos(1);
                        }}
                        className={`text-sm px-4 py-2 rounded-full transition-colors ${getFiltroPedidosColor('todos')}`}
                      >
                        📋 Todos ({getContadorPedidosPorEstado('todos')})
                      </Button>

                      <Button
                        onClick={() => {
                          setFiltroEstadoPedidos('pendiente');
                          setPaginaPedidos(1);
                        }}
                        className={`text-sm px-4 py-2 rounded-full transition-colors ${getFiltroPedidosColor('pendiente')}`}
                      >
                        ⏳ Pendientes ({getContadorPedidosPorEstado('pendiente')})
                      </Button>

                      <Button
                        onClick={() => {
                          setFiltroEstadoPedidos('pagado');
                          setPaginaPedidos(1);
                        }}
                        className={`text-sm px-4 py-2 rounded-full transition-colors ${getFiltroPedidosColor('pagado')}`}
                      >
                        💳 Pagados ({getContadorPedidosPorEstado('pagado')})
                      </Button>

                      <Button
                        onClick={() => {
                          setFiltroEstadoPedidos('enviado');
                          setPaginaPedidos(1);
                        }}
                        className={`text-sm px-4 py-2 rounded-full transition-colors ${getFiltroPedidosColor('enviado')}`}
                      >
                        📦 Enviados ({getContadorPedidosPorEstado('enviado')})
                      </Button>

                      <Button
                        onClick={() => {
                          setFiltroEstadoPedidos('entregado');
                          setPaginaPedidos(1);
                        }}
                        className={`text-sm px-4 py-2 rounded-full transition-colors ${getFiltroPedidosColor('entregado')}`}
                      >
                        ✅ Entregados ({getContadorPedidosPorEstado('entregado')})
                      </Button>

                      <Button
                        onClick={() => {
                          setFiltroEstadoPedidos('cancelado');
                          setPaginaPedidos(1);
                        }}
                        className={`text-sm px-4 py-2 rounded-full transition-colors ${getFiltroPedidosColor('cancelado')}`}
                      >
                        ❌ Cancelados ({getContadorPedidosPorEstado('cancelado')})
                      </Button>
                    </div>
                  </div>

                  {/* Mostrar mensaje si no hay pedidos para el filtro seleccionado */}
                  {getPedidosFiltrados().length === 0 ? (
                    <div className="text-center py-12">
                      <div className={`p-4 rounded-full mx-auto mb-4 w-fit ${
                        filtroEstadoPedidos === 'pendiente' ? 'bg-yellow-100' :
                        filtroEstadoPedidos === 'pagado' ? 'bg-blue-100' :
                        filtroEstadoPedidos === 'enviado' ? 'bg-purple-100' :
                        filtroEstadoPedidos === 'entregado' ? 'bg-green-100' :
                        filtroEstadoPedidos === 'cancelado' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        <span className="text-3xl">
                          {filtroEstadoPedidos === 'pendiente' && '⏳'}
                          {filtroEstadoPedidos === 'pagado' && '💳'}
                          {filtroEstadoPedidos === 'enviado' && '📦'}
                          {filtroEstadoPedidos === 'entregado' && '✅'}
                          {filtroEstadoPedidos === 'cancelado' && '❌'}
                          {filtroEstadoPedidos === 'todos' && '📋'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-lg">
                        No hay pedidos {filtroEstadoPedidos === 'todos' ? '' : getEstadoNombre(filtroEstadoPedidos).toLowerCase() + 's'}
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Cambia el filtro para ver otros pedidos
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Agrupar pedidos por pedido_id, ordenar por fecha y paginar */}
                      {(() => {
                        // Agrupar pedidos por pedido_id
                        const pedidosAgrupados = getPedidosFiltrados().reduce((acc: any, pedido: any) => {
                          if (!acc[pedido.pedido_id]) {
                            acc[pedido.pedido_id] = {
                              pedido_id: pedido.pedido_id,
                              nombre: pedido.nombre,
                              correo: pedido.correo,
                              telefono: pedido.telefono,
                              direccion: pedido.direccion,
                              estado_pedido: pedido.estado_pedido,
                              fecha: pedido.fecha,
                              total: pedido.total,
                              productos: []
                            };
                          }
                          acc[pedido.pedido_id].productos.push({
                            id_detalle_pedido: pedido.id_detalle_pedido,
                            producto_id: pedido.producto_id,
                            nombre_producto: pedido.nombre_producto,
                            imagen_producto: pedido.imagen_producto,
                            cantidad: pedido.cantidad,
                            subtotal: pedido.subtotal
                          });
                          return acc;
                        }, {});

                        // Convertir a array y ordenar por fecha descendente
                        const pedidosArray = Object.entries(pedidosAgrupados)
                          .filter(([pedidoId]) => {
                            const needle = (pedidoSearch || '').replace(/[^0-9]/g, '').trim();
                            if (!needle) return true;
                            return pedidoId.toString().includes(needle);
                          })
                          .sort(([, a]: [string, any], [, b]: [string, any]) => {
                            const fechaA = new Date(a.fecha).getTime();
                            const fechaB = new Date(b.fecha).getTime();
                            return fechaB - fechaA; // Descendente (más reciente primero)
                          });

                        // Aplicar paginación
                        const inicio = (paginaPedidos - 1) * pedidosPorPagina;
                        const fin = inicio + pedidosPorPagina;
                        const pedidosPaginados = pedidosArray.slice(inicio, fin);
                        const totalPaginas = Math.ceil(pedidosArray.length / pedidosPorPagina);

                        return (
                          <>
                            {pedidosPaginados.map(([pedidoId, pedido]: [string, any], ordenIndex: number) => (
                    <Card key={pedidoId} className="border-l-4 border-l-[#196428] shadow-lg">
                      <CardContent className="p-6">
                        {/* Header del Pedido */}
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                

                                
                                <div>
                                  <h3 className="text-2xl font-bold text-gray-900">Pedido #{pedido.pedido_id}</h3>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm text-gray-600">
                                      {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                    {(() => {
                                      const diasTranscurridos = calcularDiasTranscurridos(pedido.fecha);
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

                            {/* Información del Cliente */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <h4 className="font-semibold text-gray-900 mb-3">Información del Cliente</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Nombre:</span>
                                  <span className="ml-2 font-medium text-gray-900">{pedido.nombre}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Correo:</span>
                                  <span className="ml-2 font-medium text-gray-900">{pedido.correo}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Teléfono:</span>
                                  <span className="ml-2 font-medium text-gray-900">{pedido.telefono}</span>
                                </div>
                                <div className="md:col-span-2">
                                  <span className="text-gray-600">Dirección de entrega:</span>
                                  <span className="ml-2 font-medium text-gray-900">{pedido.direccion}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Total y Estado */}
                          <div className="text-center">
                            <div className="bg-[#196428] text-white px-4 py-2 rounded-lg shadow-lg mb-4">
                              <p className="text-xs font-medium text-green-100 mb-1">Total del Pedido</p>
                              <p className="font-black text-2xl">${formatPrice(pedido.total || 0)}</p>
                            </div>

                            {/* Selector de Estado */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Estado del Pedido:</p>
                              <Select
                                value={pedido.estado_pedido}
                                onValueChange={(value) => handleUpdateEstadoPedido(pedido.pedido_id, value)}
                              >
                                <SelectTrigger className="w-full text-sm">
                                  <SelectValue>
                                    <span className={`font-semibold ${getEstadoColor(pedido.estado_pedido)}`}>
                                      {pedido.estado_pedido === 'pendiente' && '⏳ '}
                                      {pedido.estado_pedido === 'pagado' && '💳 '}
                                      {pedido.estado_pedido === 'enviado' && '📦 '}
                                      {pedido.estado_pedido === 'entregado' && '✅ '}
                                      {pedido.estado_pedido === 'cancelado' && '❌ '}
                                      {getEstadoNombre(pedido.estado_pedido)}
                                    </span>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendiente">
                                    <span className="flex items-center gap-2">
                                      ⏳ <span className="text-yellow-600 font-medium">Pendiente</span>
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="pagado">
                                    <span className="flex items-center gap-2">
                                      💳 <span className="text-blue-600 font-medium">Pagado</span>
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="enviado">
                                    <span className="flex items-center gap-2">
                                      📦 <span className="text-purple-600 font-medium">Enviado</span>
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="entregado">
                                    <span className="flex items-center gap-2">
                                      ✅ <span className="text-green-600 font-medium">Entregado</span>
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="cancelado">
                                    <span className="flex items-center gap-2">
                                      ❌ <span className="text-red-600 font-medium">Cancelado</span>
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Separador */}
                        <div className="relative mb-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Productos del Pedido</span>
                          </div>
                        </div>

                        {/* Lista de Productos */}
                        <div className="space-y-3">
                          {pedido.productos.map((producto: any, index: number) => (
                            <div
                              key={producto.id_detalle_pedido}
                              className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#196428] hover:shadow-md transition-all duration-200"
                            >
                              <div className="bg-green-50 text-[#196428] p-2 rounded-lg font-bold text-sm">
                                {index + 1}
                              </div>
                              
                              {producto.imagen_producto && (
                                <div className="relative w-16 h-16">
                                  <Image
                                    src={producto.imagen_producto}
                                    alt={producto.nombre_producto}
                                    fill
                                    className="object-cover rounded-lg border border-gray-200"
                                    sizes="64px"
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{producto.nombre_producto}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Cantidad: {producto.cantidad}
                                  </span>
                                  {producto.cantidad > 1 && (
                                    <span className="text-xs text-gray-500">
                                      (${formatPrice(producto.subtotal / producto.cantidad)} c/u)
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <span className="font-bold text-[#196428] text-lg">${formatPrice(producto.subtotal)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span className="font-medium">
                              {pedido.productos.length} producto{pedido.productos.length !== 1 ? 's' : ''} en este pedido
                            </span>
                            <span className="font-medium">
                              Estado: <span className={`font-bold ${getEstadoColor(pedido.estado_pedido)}`}>
                                {getEstadoNombre(pedido.estado_pedido)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                            ))}
                            
                            {/* Controles de Paginación */}
                            {totalPaginas > 1 && (
                              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200 gap-4">
                                <div className="text-sm text-gray-600">
                                  Mostrando {inicio + 1} - {Math.min(fin, pedidosArray.length)} de {pedidosArray.length} pedidos
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => setPaginaPedidos(paginaPedidos - 1)}
                                    disabled={paginaPedidos === 1}
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <ChevronUp className="h-4 w-4 mr-1 rotate-[-90deg]" />
                                    Anterior
                                  </Button>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                                      <Button
                                        key={num}
                                        onClick={() => setPaginaPedidos(num)}
                                        variant={paginaPedidos === num ? "default" : "outline"}
                                        size="sm"
                                        className={`${
                                          paginaPedidos === num
                                            ? "bg-[#196428] hover:bg-[#145020] text-white"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        {num}
                                      </Button>
                                    ))}
                                  </div>
                                  <Button
                                    onClick={() => setPaginaPedidos(paginaPedidos + 1)}
                                    disabled={paginaPedidos === totalPaginas}
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Siguiente
                                    <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analitica" className="space-y-6">
          {(() => {
            const metricasPedidos = calcularMetricasPedidos();
            const metricasProductos = calcularMetricasProductos();

            return (
              <>
                {/* Métricas Clave de Pedidos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Métricas de Pedidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Total de Pedidos */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-sm font-medium text-black mb-2">Total de Pedidos</p>
                          <p className="text-3xl font-bold text-black">{formatNumber(metricasPedidos.totalPedidos)}</p>
                        </div>
                      </div>

                      {/* Ingresos Totales */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-sm font-medium text-black mb-2">Ingresos Totales</p>
                          <p className="text-3xl font-bold text-black">${formatNumber(metricasPedidos.ingresosTotales)}</p>
                        </div>
                      </div>

                      {/* Promedio por Pedido */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-sm font-medium text-black mb-2">Promedio por Pedido</p>
                          <p className="text-3xl font-bold text-black">${formatNumber(metricasPedidos.promedioValor)}</p>
                        </div>
                      </div>

                      {/* Tasa de Cancelación */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-sm font-medium text-black mb-2">Tasa de Cancelación</p>
                          <p className="text-3xl font-bold text-black">{Math.round(metricasPedidos.tasaCancelacion)}%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pedidos por Estado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Pedidos por Estado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.entries(metricasPedidos.pedidosPorEstado).map(([estado, cantidad]: [string, any]) => {
                        const getEstadoBgColor = (estado: string) => {
                          switch (estado) {
                            case 'pendiente': return 'bg-yellow-500';
                            case 'pagado': return 'bg-blue-500';
                            case 'enviado': return 'bg-purple-500';
                            case 'entregado': return 'bg-green-500';
                            case 'cancelado': return 'bg-red-500';
                            default: return 'bg-gray-500';
                          }
                        };
                        return (
                          <div key={estado} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-600 mb-1">{getEstadoNombre(estado)}</p>
                            <p className="text-2xl font-bold text-gray-900">{cantidad}</p>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getEstadoBgColor(estado)}`}
                                  style={{ width: `${(cantidad / metricasPedidos.totalPedidos) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Pedidos por Mes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Pedidos por Mes (Últimos 6 meses)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(metricasPedidos.pedidosPorMes).map(([mes, cantidad]: [string, any]) => {
                        const maxCantidad = Math.max(...Object.values(metricasPedidos.pedidosPorMes) as number[]);
                        const porcentaje = maxCantidad > 0 ? (cantidad / maxCantidad) * 100 : 0;
                        return (
                          <div key={mes} className="flex items-center gap-4">
                            <div className="w-24 text-sm font-medium text-gray-700">{mes}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                              <div 
                                className="bg-[#196428] h-6 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${porcentaje}%` }}
                              >
                                {cantidad > 0 && (
                                  <span className="text-xs font-semibold text-white">{cantidad}</span>
                                )}
                              </div>
                            </div>
                            <div className="w-16 text-right text-sm font-semibold text-gray-900">{cantidad}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Métricas de Productos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Métricas de Productos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-sm font-medium text-black mb-2">Total Unidades Vendidas</p>
                          <p className="text-3xl font-bold text-black">{formatNumber(metricasProductos.totalUnidades)}</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-sm font-medium text-black mb-2">Productos Únicos</p>
                          <p className="text-3xl font-bold text-black">{formatNumber(metricasProductos.totalProductosUnicos)}</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-sm font-medium text-black mb-2">Promedio por Producto</p>
                          <p className="text-3xl font-bold text-black">
                            {metricasProductos.totalProductosUnicos > 0 
                              ? formatNumber(Math.round(metricasProductos.totalUnidades / metricasProductos.totalProductosUnicos))
                              : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Productos por Cantidad */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Top 10 Productos Más Vendidos (por Cantidad)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metricasProductos.topProductosCantidad.length > 0 ? (
                        metricasProductos.topProductosCantidad.map((producto, index) => (
                          <div key={producto.producto_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#196428] transition-colors">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#196428] text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{producto.nombre}</p>
                              <p className="text-sm text-gray-600">ID: {producto.producto_id}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#196428] text-lg">{producto.cantidad} unidades</p>
                              <p className="text-sm text-gray-600">${formatNumber(producto.ingresos)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No hay productos vendidos aún</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Productos por Ingresos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Top 10 Productos por Ingresos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metricasProductos.topProductosIngresos.length > 0 ? (
                        metricasProductos.topProductosIngresos.map((producto, index) => (
                          <div key={producto.producto_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{producto.nombre}</p>
                              <p className="text-sm text-gray-600">ID: {producto.producto_id}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-lg">${formatNumber(producto.ingresos)}</p>
                              <p className="text-sm text-gray-600">{producto.cantidad} unidades</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No hay productos vendidos aún</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* Modal para mostrar CV */}
      <Dialog open={cvModalOpen} onOpenChange={setCvModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] w-full h-full">
          <DialogHeader>
            <DialogTitle>Curriculum Vitae</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {currentCvUrl && (
              <iframe
                src={currentCvUrl}
                className="w-full h-full min-h-[60vh] border-0 rounded-md"
                title="CV del aplicante"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulario integrado para crear/editar trabajo */}
      {isJobFormOpen && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingJob ? 'Editar Oferta de Trabajo' : 'Crear Nueva Oferta de Trabajo'}
            </h3>
            <button
              onClick={resetJobForm}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmitJob} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del puesto *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={jobFormData.titulo}
                  onChange={handleJobInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#196428] focus:border-transparent text-sm"
                  placeholder="Ej: Desarrollador Frontend"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento *
                </label>
                <select
                  name="departamento"
                  value={jobFormData.departamento}
                  onChange={handleJobInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#196428] focus:border-transparent text-sm"
                >
                  <option value="">Seleccionar departamento</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Operaciones">Operaciones</option>
                  <option value="Finanzas">Finanzas</option>
                  <option value="Atención al Cliente">Atención al Cliente</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={jobFormData.ubicacion}
                  onChange={handleJobInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#196428] focus:border-transparent text-sm"
                  placeholder="Ej: Madrid, España"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de contrato *
                </label>
                <select
                  name="tipo_contrato"
                  value={jobFormData.tipo_contrato}
                  onChange={handleJobInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#196428] focus:border-transparent text-sm"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Tiempo completo">Tiempo completo</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Por horas">Por horas</option>
                  <option value="Temporal">Temporal</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salario *
              </label>
              <input
                type="text"
                name="salario"
                value={jobFormData.salario}
                onChange={handleJobInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#196428] focus:border-transparent text-sm"
                placeholder="Ej: 30.000 - 35.000 €/año"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del puesto *
              </label>
              <textarea
                name="descripcion"
                value={jobFormData.descripcion}
                onChange={handleJobInputChange}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#196428] focus:border-transparent text-sm"
                placeholder="Describe las responsabilidades y funciones del puesto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos (uno por línea)
                </label>
                <textarea
                  value={jobFormData.requisitos.join('\n')}
                  onChange={handleRequisitosChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#196428] focus:border-transparent text-sm"
                  placeholder="Experiencia mínima de 2 años&#10;Conocimientos de JavaScript&#10;Licenciatura en Informática"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficios (uno por línea)
                </label>
                <textarea
                  value={jobFormData.beneficios.join('\n')}
                  onChange={handleBeneficiosChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#196428] focus:border-transparent text-sm"
                  placeholder="Seguro médico&#10;Flexibilidad horaria&#10;Formación continua"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={jobFormData.activo}
                onChange={(e) => setJobFormData(prev => ({ ...prev, activo: e.target.checked }))}
                className="h-4 w-4 text-[#196428] focus:ring-[#196428] border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                Publicar oferta inmediatamente
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#196428] hover:bg-[#2d7a3d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>{editingJob ? 'Actualizando...' : 'Creando...'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    <span>{editingJob ? 'Actualizar Oferta' : 'Crear Oferta'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetJobForm}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium py-2.5 px-4 rounded-md transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

