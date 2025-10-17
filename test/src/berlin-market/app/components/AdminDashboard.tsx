"use client";

import { useState, useEffect } from 'react';
import supabase, { Categoria, Subcategoria, Producto, Marca, TamanoProducto, ProductoStock, UI } from '@/lib/supabase';

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
import { Plus, Edit, Trash2, Save, X, FolderPlus, FolderOpen, Package, Tag, Layout, ChevronUp, ChevronDown } from 'lucide-react';

const AdminDashboard = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [uiElements, setUiElements] = useState<UI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tablesConfigured, setTablesConfigured] = useState<boolean | null>(null);

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
  const [imageUploading, setImageUploading] = useState(false);

  // Forzar actualización de tipos
  useEffect(() => {}, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar categorías
      const { data: categoriasData, error: categoriasError } = await supabase
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
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      if (error?.message?.includes('relation "categories" does not exist') ||
          error?.message?.includes('relation "subcategories" does not exist') ||
          error?.message?.includes('relation "productos" does not exist') ||
          error?.message?.includes('relation "usuarios" does not exist') ||
          error?.message?.includes('relation "marcas" does not exist')) {
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
        .eq('categoria_id', id);

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

  // Función para subir imagen a Supabase Storage
  const uploadImageToStorage = async (file: File, productName: string): Promise<string> => {
    try {
      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${productName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      // Subir archivo al bucket 'images'
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) {
        console.error('Error subiendo imagen:', error);
        throw error;
      }

      // Obtener URL pública de la imagen
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
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      const imageUrl = await uploadImageToStorage(file, productName);
      return imageUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen. Inténtalo de nuevo.');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  // Función para manejar selección de archivo de marca
  const handleFileSelectMarca = async (event: React.ChangeEvent<HTMLInputElement>, marcaType: string) => {
    setImageUploading(true);
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
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
    }
  };

  // Función para manejar selección de archivo de categoría
  const handleFileSelectCategoria = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploading(true);
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
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
        <p className="text-gray-600">Gestiona categorías, subcategorías, productos, marcas y elementos UI del sistema</p>
      </div>

      <Tabs defaultValue="categorias" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
          <TabsTrigger value="categorias" className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="subcategorias" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Subcategorías
          </TabsTrigger>
          <TabsTrigger value="productos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="marcas" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Marcas
          </TabsTrigger>
          <TabsTrigger value="ui" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            UI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Crear Nueva Categoría
              </CardTitle>
              <CardDescription>
                Agrega una nueva categoría al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCategoria} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Categoría
                    </label>
                    <Input
                      value={newCategoria.nombre}
                      onChange={(e) => setNewCategoria({ ...newCategoria, nombre: e.target.value })}
                      placeholder="Ej: Perros, Gatos, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <Input
                      value={newCategoria.descripcion}
                      onChange={(e) => setNewCategoria({ ...newCategoria, descripcion: e.target.value })}
                      placeholder="Breve descripción de la categoría"
                      required
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
                          const imageUrl = await handleFileSelectMarca(e, 'marca1');
                          if (imageUrl) {
                            setNewCategoria({ ...newCategoria, imagen_marca1: imageUrl });
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                      />
                      {newCategoria.imagen_marca1 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Imagen seleccionada:</p>
                          <img
                            src={newCategoria.imagen_marca1}
                            alt="Marca 1 Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setNewCategoria({ ...newCategoria, imagen_marca1: '' })}
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
                          const imageUrl = await handleFileSelectMarca(e, 'marca2');
                          if (imageUrl) {
                            setNewCategoria({ ...newCategoria, imagen_marca2: imageUrl });
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                      />
                      {newCategoria.imagen_marca2 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Imagen seleccionada:</p>
                          <img
                            src={newCategoria.imagen_marca2}
                            alt="Marca 2 Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setNewCategoria({ ...newCategoria, imagen_marca2: '' })}
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
                          const imageUrl = await handleFileSelectMarca(e, 'marca3');
                          if (imageUrl) {
                            setNewCategoria({ ...newCategoria, imagen_marca3: imageUrl });
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                      />
                      {newCategoria.imagen_marca3 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Imagen seleccionada:</p>
                          <img
                            src={newCategoria.imagen_marca3}
                            alt="Marca 3 Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setNewCategoria({ ...newCategoria, imagen_marca3: '' })}
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
                        if (imageUrl) {
                          setNewCategoria({ ...newCategoria, categoria_imagen: imageUrl });
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                    />
                    {newCategoria.categoria_imagen && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Imagen seleccionada:</p>
                        <img
                          src={newCategoria.categoria_imagen}
                          alt="Categoría Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setNewCategoria({ ...newCategoria, categoria_imagen: '' })}
                          className="ml-2 text-red-500 text-sm hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#196428] hover:bg-[#145020] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Categoría
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorías Existentes</CardTitle>
              <CardDescription>
                Gestiona las categorías actuales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categorias.length === 0 ? (
                <div className="text-center py-8">
                  <FolderPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay categorías registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categorias.map((categoria) => (
                    <Card key={categoria.id} className="border-l-4 border-l-[#196428]">
                      <CardContent className="p-4">
                        {editingCategoria?.id === categoria.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={editingCategoria?.nombre || ''}
                                onChange={(e) => setEditingCategoria({ ...editingCategoria!, nombre: e.target.value })}
                                placeholder="Nombre de la categoría"
                              />
                              <Input
                                value={editingCategoria?.descripcion || ''}
                                onChange={(e) => setEditingCategoria({ ...editingCategoria!, descripcion: e.target.value })}
                                placeholder="Descripción"
                              />
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
                                      <img
                                        src={editingCategoria.imagen_marca1}
                                        alt="Marca 1 Preview"
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                      />
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
                                      <img
                                        src={editingCategoria.imagen_marca2}
                                        alt="Marca 2 Preview"
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                      />
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
                                      <img
                                        src={editingCategoria.imagen_marca3}
                                        alt="Marca 3 Preview"
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                      />
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
                                    <img
                                      src={editingCategoria.categoria_imagen}
                                      alt="Categoría Preview"
                                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                    />
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

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleUpdateCategoria(editingCategoria!)}
                                size="sm"
                                className="bg-[#196428] hover:bg-[#145020] text-white"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Guardar
                              </Button>
                              <Button
                                onClick={cancelEditCategoria}
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
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {categoria.nombre}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {categoria.descripcion}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                ID: {categoria.id} • Creado: {new Date(categoria.created_at || '').toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => startEditCategoria(categoria)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteCategoria(categoria.id || 0)}
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
              {subcategorias.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay subcategorías registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subcategorias.map((subcategoria) => {
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
              )}
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
                          <img
                            src={newProducto.imagen_url}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          />
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
                      No hay tamaños definidos. Haz clic en "Agregar Tamaño" para añadir tamaños y precios al producto.
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
              {productos.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay productos registrados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {productos.map((producto) => {
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
                                        <img
                                          src={editingProducto.imagen_url}
                                          alt="Preview"
                                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                        />
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
                                      No hay tamaños definidos. Haz clic en "Agregar Tamaño" para añadir tamaños y precios al producto.
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
                                    <img 
                                      src={producto.imagen_url} 
                                      alt={producto.nombre}
                                      className="w-24 h-24 object-cover rounded-lg"
                                    />
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
                                                {tamano.cantidad} {tamano.unidad} - ${producto.precios?.[index] ? producto.precios[index].toLocaleString('es-CO') : 'N/A'} (Stock: {stock})
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
              )}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Gestionar Elementos UI
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
                          <img src={url} alt={`Banner ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
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
                          <img src={url} alt={`Hidden Banner ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
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
                        <img src={editingUI ? editingUI.popup! : newUI.popup!} alt="Popup" className="w-full h-48 object-cover rounded-lg" />
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
                                    <img src={url} alt={`Banner ${index + 1}`} className="w-full h-20 object-cover rounded" />
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
                                    <img src={url} alt={`Hidden Banner ${index + 1}`} className="w-full h-20 object-cover rounded" />
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
                                <img src={ui.popup} alt="Popup" className="w-full h-32 object-cover rounded" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
