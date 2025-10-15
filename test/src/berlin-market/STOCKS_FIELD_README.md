# Nuevo Campo Stocks en Productos

## Descripción del Cambio

Se ha implementado un nuevo sistema de gestión de stocks que reemplaza completamente los campos separados (`tamano`, `precios`, `stock`) con un único campo `stocks` de tipo `jsonb` que almacena toda la información relacionada con cada combinación de tamaño, precio y stock disponible.

## Estructura del Campo Stocks

```typescript
interface ProductoStock {
  id?: string  // identificador único para cada combinación
  cantidad: number  // cantidad del tamaño
  unidad: 'ML' | 'L' | 'G' | 'KG' | 'MG' | 'OZ' | 'LB'
  precio: number   // precio para este tamaño
  stock: number    // stock disponible para este tamaño
}
```

## Ejemplo de Datos

```json
{
  "stocks": [
    {
      "id": "prod_1_500_ml_123456789",
      "cantidad": 500,
      "unidad": "ML",
      "precio": 15000,
      "stock": 50
    },
    {
      "id": "prod_1_1_5_kg_123456790",
      "cantidad": 1.5,
      "unidad": "KG",
      "precio": 28000,
      "stock": 25
    },
    {
      "id": "prod_1_250_g_123456791",
      "cantidad": 250,
      "unidad": "G",
      "precio": 8500,
      "stock": 100
    }
  ]
}
```

## Ventajas del Nuevo Sistema

1. **Relaciones Claras**: Cada combinación de tamaño tiene su propio precio y stock asociado
2. **Flexibilidad**: Fácil añadir nuevos campos en el futuro (ej: stock mínimo, ubicación, etc.)
3. **Consultas Eficientes**: Índice GIN para búsquedas rápidas por cualquier campo del JSON
4. **Consistencia**: Un solo campo mantiene toda la información relacionada
5. **Escalabilidad**: Soporta productos con múltiples variaciones fácilmente

## Funcionalidades Implementadas

### Formulario de Creación
- Campo adicional "Stock" en cada fila de tamaño
- Validación automática de que cada tamaño tenga cantidad, precio y stock
- Sincronización automática entre campos nuevos y antiguos (para compatibilidad)

### Formulario de Edición
- Los productos existentes se cargan con el campo stocks inicializado
- Si un producto antiguo no tiene stocks, se crean automáticamente a partir de tamaños y precios
- Campo de stock editable para cada tamaño

### Visualización
- Los productos muestran tamaños, precios y stock en una sola línea
- Ejemplo: "500 ML - $15.000 (Stock: 50)"

## Campos Mantenidos para Compatibilidad

Durante la transición, se mantienen los campos antiguos (`tamano`, `precios`) para:
- Permitir rollback si es necesario
- Mantener funcionalidad con código existente
- Migración gradual de datos

⚠️ **Nota**: El campo `stock` ha sido completamente eliminado de la tabla productos y del código.

## Próximos Pasos

1. **Ejecutar migración actualizada**: Usa el archivo `database_migration.sql` en Supabase (ahora elimina el campo stock antiguo)
2. **Probar funcionalidades**: Crear y editar productos con el nuevo sistema
3. **Verificar datos**: Asegurar que los productos existentes se muestren correctamente
4. **Limpieza futura**: Una vez confirmado que todo funciona, se pueden remover los campos antiguos

## Consideraciones Técnicas

- El stock total del producto se calcula automáticamente como la suma de todos los stocks individuales del campo `stocks`
- Cada combinación de tamaño tiene un ID único generado automáticamente
- El sistema mantiene sincronización entre campos nuevos y antiguos durante la edición
- Los índices GIN mejoran significativamente el rendimiento de consultas sobre el campo JSONB
- El campo `stock` antiguo ha sido completamente eliminado de la tabla productos

## Soporte

Si encuentras problemas o necesitas ajustes adicionales, revisa:
1. El archivo de migración SQL
2. Los logs de errores en la consola del navegador
3. La estructura de datos en Supabase
