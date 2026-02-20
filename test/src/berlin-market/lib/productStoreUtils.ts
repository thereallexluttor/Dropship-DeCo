/**
 * Utilidades para filtrar productos por tienda.
 * Considera: Producto.Tienda, stocks[].tienda y stocks[].tiendas (JSONB).
 */

export interface ProductoConStocks {
  Tienda?: number | null
  stocks?: Array<{
    tienda?: number
    tiendas?: number[]
    cantidad?: number
    unidad?: string
    precio?: number
    stock?: number
  }> | null
  tamano?: Array<{ cantidad: number; unidad: string }> | null
  precios?: number[] | null
}

/**
 * Verifica si un producto está disponible en la tienda seleccionada.
 * Considera Tienda a nivel producto, stocks.tienda y stocks.tiendas (varios por stock).
 * @param product Producto con Tienda y stocks (JSONB)
 * @param storeId 0 = Todas las tiendas, >0 = tienda específica
 */
export const productAvailableInStore = (
  product: ProductoConStocks,
  storeId: number
): boolean => {
  if (storeId === 0) return true

  // 1. Tienda a nivel producto
  if (product.Tienda === storeId) return true

  // 2. Revisar stocks (pueden ser largos y contener varias tiendas)
  const stocks = product.stocks
  if (stocks && Array.isArray(stocks) && stocks.length > 0) {
    for (const stock of stocks) {
      if (stock.tienda === storeId) return true
      if (stock.tiendas && Array.isArray(stock.tiendas) && stock.tiendas.includes(storeId)) return true
    }
  }

  // 3. Producto sin asignación: mostrar si no hay tiendas en stocks (producto general)
  const hasStoreInStocks = stocks?.some(
    (s) => s.tienda != null || (s.tiendas && Array.isArray(s.tiendas) && s.tiendas.length > 0)
  )
  if ((product.Tienda == null || product.Tienda === undefined) && !hasStoreInStocks) return true

  return false
}

/**
 * Filtra tamano, precios y stocks de un producto para mostrar solo la info de la tienda seleccionada.
 * Los arrays tamano, precios y stocks comparten índices (stocks[i] ↔ tamano[i] ↔ precios[i]).
 * @param product Producto con tamano, precios, stocks
 * @param storeId 0 = Todas las tiendas (sin filtrar), >0 = solo datos de esa tienda
 */
export const filterProductDataByStore = <T extends ProductoConStocks>(
  product: T,
  storeId: number
): T => {
  if (storeId === 0) return product

  const stocks = product.stocks
  if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
    return product
  }

  const indicesForStore: number[] = []
  stocks.forEach((stock, index) => {
    const match =
      stock.tienda === storeId ||
      (stock.tiendas && Array.isArray(stock.tiendas) && stock.tiendas.includes(storeId))
    if (match) indicesForStore.push(index)
  })

  if (indicesForStore.length === 0) return product

  const filteredStocks = indicesForStore.map((i) => stocks[i])
  const filteredTamano =
    product.tamano && product.tamano.length > 0
      ? indicesForStore.map((i) => product.tamano![i])
      : null
  const filteredPrecios =
    product.precios && product.precios.length > 0
      ? indicesForStore.map((i) => product.precios![i])
      : null

  return {
    ...product,
    tamano: filteredTamano,
    precios: filteredPrecios,
    stocks: filteredStocks
  }
}
