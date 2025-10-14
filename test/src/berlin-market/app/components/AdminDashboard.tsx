"use client";

import { useState, useEffect } from 'react';
import { supabase, Categoria, Subcategoria } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Save, X, FolderPlus, FolderOpen } from 'lucide-react';

const AdminDashboard = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tablesConfigured, setTablesConfigured] = useState<boolean | null>(null);

  // Estados para formularios
  const [newCategoria, setNewCategoria] = useState({ nombre: '', descripcion: '' });
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [newSubcategoria, setNewSubcategoria] = useState({ categories_id: 0, nombre: '', descripcion: '' });
  const [editingSubcategoria, setEditingSubcategoria] = useState<Subcategoria | null>(null);

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
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      if (error?.message?.includes('relation "categories" does not exist') || error?.message?.includes('relation "subcategories" does not exist')) {
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
          descripcion: newCategoria.descripcion
        }])
        .select()
        .single();

      if (error) throw error;

      setCategorias([...categorias, data]);
      setNewCategoria({ nombre: '', descripcion: '' });
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
          descripcion: categoria.descripcion
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
    setEditingCategoria(categoria);
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
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="categorias" className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="subcategorias" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Subcategorías
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
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
