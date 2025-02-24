from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
import re

def download_webpage_with_complete_loading(url, output_file="tkmaxx_page_complete.html", wait_time=30):
    """
    Descarga el contenido HTML de una página web usando Selenium y espera a que
    todos los productos se carguen completamente.
    
    Args:
        url (str): La URL de la página web a descargar.
        output_file (str): El nombre del archivo donde guardar el HTML.
        wait_time (int): Tiempo máximo de espera para que la página cargue completamente.
        
    Returns:
        bool: True si la descarga fue exitosa, False en caso contrario.
    """
    print(f"Iniciando descarga con espera completa: {url}")
    
    # Configurar opciones del navegador
    chrome_options = Options()
    # Comentamos el modo headless para poder ver el proceso si es necesario
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--lang=de-DE")  # Configurar idioma alemán
    
    # Agregar un User-Agent realista
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    try:
        # Iniciar el navegador
        print("Iniciando el navegador Chrome...")
        driver = webdriver.Chrome(options=chrome_options)
        
        start_time = time.time()
        
        # Navegar a la URL
        print("Navegando a la página...")
        driver.get(url)
        
        # Esperar inicialmente a que la página cargue básicamente
        print("Esperando a que la página comience a cargar...")
        WebDriverWait(driver, wait_time).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Intentar identificar contenedores de productos
        print(f"Esperando a que los productos se carguen (máximo {wait_time} segundos)...")
        try:
            # Posibles selectores donde podrían estar los productos
            product_selectors = [
                "div.product-tile", 
                ".product-grid", 
                ".product-list",
                "li.product-item",
                "div[data-testid='product-card']",
                ".product-card",
                "div.product",
                "article.product"
            ]
            
            # Intentar con diferentes selectores
            products_found = False
            for selector in product_selectors:
                try:
                    # Esperar hasta que aparezca al menos un producto
                    WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                    products = driver.find_elements(By.CSS_SELECTOR, selector)
                    if products:
                        print(f"Productos encontrados usando selector: {selector}")
                        print(f"Número de productos cargados: {len(products)}")
                        products_found = True
                        break
                except:
                    continue
            
            if not products_found:
                print("No se encontraron productos con los selectores predefinidos. Esperando tiempo adicional...")
                # Si no encontramos productos, esperamos un tiempo adicional para asegurar la carga
                time.sleep(10)
            
            # Hacer scroll hacia abajo para asegurar que todos los elementos lazy-load se carguen
            print("Haciendo scroll para cargar todos los elementos...")
            last_height = driver.execute_script("return document.body.scrollHeight")
            while True:
                # Scroll hasta el fondo
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                
                # Esperar a que cargue la página
                time.sleep(2)
                
                # Calcular nueva altura y comparar con la última altura
                new_height = driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    print("Se ha llegado al final de la página.")
                    break
                last_height = new_height
            
            # Esperar un poco más para asegurar que todos los elementos AJAX se han cargado
            print("Esperando que todas las solicitudes AJAX terminen...")
            time.sleep(5)
            
        except Exception as e:
            print(f"Advertencia durante la espera de productos: {e}")
            print("Continuando de todos modos...")
        
        # Obtener el HTML de la página
        print("Obteniendo el HTML completo...")
        html_content = driver.page_source
        
        # Guardar el HTML en un archivo
        with open(output_file, 'w', encoding='utf-8') as file:
            file.write(html_content)
        
        elapsed_time = time.time() - start_time
        print(f"Descarga completada en {elapsed_time:.2f} segundos")
        
        # Verificar si el archivo se guardó correctamente
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file) / 1024
            print(f"Archivo guardado: {output_file} ({file_size:.2f} KB)")
            
            # Verificar si el contenido parece tener productos
            product_patterns = [
                r'product-tile', 
                r'product-grid',
                r'product-list',
                r'product-item',
                r'product-card'
            ]
            
            has_products = False
            for pattern in product_patterns:
                if re.search(pattern, html_content, re.IGNORECASE):
                    print(f"El HTML contiene elementos de producto ({pattern}).")
                    has_products = True
                    break
            
            if not has_products:
                print("Advertencia: No se encontraron patrones de productos en el HTML.")
            
            return True
            
        else:
            print("Error: No se pudo guardar el archivo.")
            return False
        
    except Exception as e:
        print(f"Error al usar Selenium: {e}")
        return False
        
    finally:
        # Opcional: capturar una captura de pantalla antes de cerrar
        try:
            driver.save_screenshot("tkmaxx_screenshot.png")
            print("Captura de pantalla guardada como tkmaxx_screenshot.png")
        except:
            pass
            
        # Cerrar el navegador
        if 'driver' in locals():
            print("Cerrando el navegador...")
            driver.quit()

# Función para analizar el HTML y verificar si se cargaron los productos
def verify_products_in_html(html_file):
    """
    Analiza el archivo HTML y verifica si contiene productos.
    
    Args:
        html_file (str): Ruta al archivo HTML.
        
    Returns:
        int: Número aproximado de productos encontrados.
    """
    try:
        with open(html_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Patrones para encontrar productos en el HTML
        product_patterns = [
            r'<div[^>]*class="[^"]*product-tile[^"]*"',
            r'<div[^>]*class="[^"]*product-card[^"]*"',
            r'<li[^>]*class="[^"]*product-item[^"]*"',
            r'<article[^>]*class="[^"]*product[^"]*"'
        ]
        
        total_products = 0
        for pattern in product_patterns:
            matches = re.findall(pattern, content)
            if matches:
                print(f"Encontrados {len(matches)} productos con patrón: {pattern}")
                total_products += len(matches)
        
        return total_products
        
    except Exception as e:
        print(f"Error al verificar productos en HTML: {e}")
        return 0

# URL de la página web de TK Maxx
url = "https://www.tkmaxx.com/de/de/herren/bekleidung/c/32020000"

# Descargar la página con espera completa
success = download_webpage_with_complete_loading(url)

if success:
    print("\nVerificando productos en el HTML descargado...")
    product_count = verify_products_in_html("tkmaxx_page_complete.html")
    
    if product_count > 0:
        print(f"Éxito! Se encontraron aproximadamente {product_count} productos en el HTML.")
    else:
        print("No se encontraron productos en el HTML. Es posible que la página utilice un formato diferente o que la carga no fue completa.")
        print("Puedes abrir el archivo HTML descargado para verificar manualmente.")
else:
    print("La descarga falló.")