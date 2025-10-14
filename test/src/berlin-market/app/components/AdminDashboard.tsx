"use client";

import { useState, useEffect } from 'react';
import supabase, { Categoria, Subcategoria, Producto } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Save, X, FolderPlus, FolderOpen, Package } from 'lucide-react';

const AdminDashboard = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
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
  const [newProducto, setNewProducto] = useState({
    subcategorias_id: 0,
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen_url: '',
    descuento: false,
    descuento_valor: '',
    destacado: false
  });
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

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
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      if (error?.message?.includes('relation "categories" does not exist') ||
          error?.message?.includes('relation "subcategories" does not exist') ||
          error?.message?.includes('relation "productos" does not exist')) {
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
    if (!newProducto.subcategorias_id ||
        !newProducto.nombre.trim() ||
        !newProducto.descripcion.trim() ||
        !newProducto.precio.trim() ||
        !newProducto.stock.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([{
          subcategorias_id: newProducto.subcategorias_id,
          nombre: newProducto.nombre,
          descripcion: newProducto.descripcion,
          precio: parseFloat(newProducto.precio),
          stock: parseInt(newProducto.stock),
          imagen_url: newProducto.imagen_url || null,
          descuento: newProducto.descuento || false,
          descuento_valor: newProducto.descuento_valor ? parseFloat(newProducto.descuento_valor) : null,
          destacado: newProducto.destacado || false
        }])
        .select()
        .single();

      if (error) throw error;

      setProductos([...productos, data]);
      setNewProducto({
        subcategorias_id: 0,
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        imagen_url: '',
        descuento: false,
        descuento_valor: '',
        destacado: false
      });
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
    if (!producto.nombre.trim() || 
        !producto.descripcion.trim() || 
        !producto.precio || 
        !producto.stock) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const { error } = await supabase
        .from('productos')
        .update({
          subcategorias_id: producto.subcategorias_id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: parseFloat(producto.precio.toString()),
          stock: parseInt(producto.stock.toString()),
          imagen_url: producto.imagen_url || null,
          descuento: producto.descuento || false,
          descuento_valor: producto.descuento_valor ? parseFloat(producto.descuento_valor.toString()) : null,
          destacado: producto.destacado || false
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

  const startEditProducto = (producto: Producto) => {
    setEditingProducto(producto);
  };

  const cancelEditProducto = () => {
    setEditingProducto(null);
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
    }
  };

  // Función para manejar selección de archivo de marca
  const handleFileSelectMarca = async (event: React.ChangeEvent<HTMLInputElement>, marcaType: string) => {
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
    }
  };

  // Función para manejar selección de archivo de categoría
  const handleFileSelectCategoria = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        <p className="text-gray-600">Gestiona categorías y subcategorías del sistema</p>
      </div>

      <Tabs defaultValue="categorias" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto">
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
                      Precio
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProducto.precio}
                      onChange={(e) => setNewProducto({ ...newProducto, precio: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={newProducto.stock}
                      onChange={(e) => setNewProducto({ ...newProducto, stock: e.target.value })}
                      placeholder="0"
                      required
                    />
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
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                      />
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
                <Button type="submit" className="w-full bg-[#196428] hover:bg-[#145020] text-white">
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
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editingProducto?.precio || ''}
                                  onChange={(e) => editingProducto && setEditingProducto({ 
                                    ...editingProducto, 
                                    precio: e.target.value 
                                  })}
                                  placeholder="Precio"
                                />
                                <Input
                                  type="number"
                                  min="0"
                                  value={editingProducto?.stock || ''}
                                  onChange={(e) => editingProducto && setEditingProducto({
                                    ...editingProducto,
                                    stock: e.target.value
                                  })}
                                  placeholder="Stock"
                                />
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
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
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
                                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#196428] file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-[#196428] file:text-white hover:file:bg-[#145020]"
                                    />
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
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    if (editingProducto) {
                                      handleUpdateProducto({
                                        ...editingProducto,
                                        subcategorias_id: editingProducto.subcategorias_id || 0,
                                        nombre: editingProducto.nombre || '',
                                        descripcion: editingProducto.descripcion || '',
                                        precio: editingProducto.precio || 0,
                                        stock: editingProducto.stock || 0,
                                        descuento: editingProducto.descuento || false,
                                        descuento_valor: editingProducto.descuento_valor || 0,
                                        destacado: editingProducto.destacado || false
                                      });
                                    }
                                  }}
                                  size="sm"
                                  className="bg-[#196428] hover:bg-[#145020] text-white"
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
                                    <div className="flex gap-4 text-sm text-gray-500">
                                      <span>Precio: ${producto.precio}</span>
                                      <span>Stock: {producto.stock} unidades</span>
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
                                    </div>
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
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
