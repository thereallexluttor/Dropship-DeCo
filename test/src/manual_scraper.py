from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
import time

def get_product_data(url, base_class, wait_time=60, output_file="female_accesories.txt"):
    # Configurar las opciones de Chrome
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--lang=de-DE")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    chrome_options.add_argument("--enable-unsafe-swiftshader")
    chrome_options.add_argument("--disable-software-rasterizer")

    # Configurar el servicio de ChromeDriver con un puerto específico
    service = Service(port=9515)

    # Iniciar el navegador
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        print(f"Navegando a: {url}")
        driver.get(url)
        
        # Hacer scroll para cargar más productos (lazy loading)
        print("Haciendo scroll para cargar más productos...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)  # Esperar a que se carguen los nuevos productos
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
        
        # Construir el XPath para buscar elementos con la clase base
        xpath = f"//*[contains(@class, '{base_class}')]"
        
        # Esperar a que los elementos estén presentes
        print(f"Esperando elementos con la clase base: {base_class}")
        WebDriverWait(driver, wait_time).until(
            EC.presence_of_all_elements_located((By.XPATH, xpath))
        )
        
        # Extraer todos los elementos de productos
        product_items = driver.find_elements(By.XPATH, xpath)
        print(f"Se encontraron {len(product_items)} productos.")
        
        # Lista para almacenar los datos de los productos
        products_data = []
        
        for index, item in enumerate(product_items, start=1):
            try:
                # Extraer datos específicos del producto
                thumbnail = item.find_element(By.CLASS_NAME, "c-product-card__thumbnail")
                image_src = thumbnail.get_attribute("src") or thumbnail.get_attribute("data-src") or "N/A"
                
                text = item.find_element(By.CLASS_NAME, "c-product-card__text").text if item.find_elements(By.CLASS_NAME, "c-product-card__text") else "N/A"
                label = item.find_element(By.CLASS_NAME, "c-product-card__text--label.u-font-theta.c-product-card__label").text if item.find_elements(By.CLASS_NAME, "c-product-card__text--label.u-font-theta.c-product-card__label") else "N/A"
                
                # NUEVO: Extraer la URL del producto
                link_producto = "N/A"
                try:
                    # Método 1: Extraer el atributo href directamente del elemento a dentro del item
                    link_element = item.find_element(By.XPATH, './/a')
                    link_producto = link_element.get_attribute('href')
                except Exception as link_error:
                    print(f"Error al extraer el link del producto usando método 1: {link_error}")
                    try:
                        # Método 2: Buscar usando el XPath proporcionado pero generalizado
                        all_links = driver.find_elements(By.XPATH, 
                            '//*[@id="vue-root"]/div[4]/div/div[2]/div[2]/div[3]/ul/li/a')
                        if index <= len(all_links):
                            link_producto = all_links[index-1].get_attribute('href')
                    except Exception as link_error2:
                        print(f"Error al extraer el link del producto usando método 2: {link_error2}")
                
                # MODIFICADO: Intentar múltiples métodos para extraer el precio
                sale_price = "N/A"
                price_methods = [
                    # Método 1: XPath relativo 1 (span)
                    lambda i: item.find_element(By.XPATH, './/a/div[3]/span[1]').text,
                    
                    # Método 2: XPath relativo 2 (strong)
                    lambda i: item.find_element(By.XPATH, './/a/strong').text,
                    
                    # Método 3: Búsqueda global por índice (span)
                    lambda i: driver.find_elements(By.XPATH, 
                        f'//*[@id="vue-root"]/div[4]/div/div[2]/div[2]/div[3]/ul/li/a/div[3]/span[1]')[i-1].text 
                    if i <= len(driver.find_elements(By.XPATH, 
                        f'//*[@id="vue-root"]/div[4]/div/div[2]/div[2]/div[3]/ul/li/a/div[3]/span[1]')) else None,
                    
                    # Método 4: Búsqueda global por índice (strong)
                    lambda i: driver.find_elements(By.XPATH, 
                        f'//*[@id="vue-root"]/div[4]/div/div[2]/div[2]/div[3]/ul/li/a/strong')[i-1].text 
                    if i <= len(driver.find_elements(By.XPATH, 
                        f'//*[@id="vue-root"]/div[4]/div/div[2]/div[2]/div[3]/ul/li/a/strong')) else None,
                    
                    # Método 5: Selector CSS específico
                    lambda i: item.find_element(By.CSS_SELECTOR, "span.c-product-card__sale-price").text
                ]
                
                # Probar cada método hasta que uno funcione
                for method_num, price_method in enumerate(price_methods, 1):
                    try:
                        price_result = price_method(index)
                        if price_result:
                            sale_price = price_result
                            print(f"Precio extraído con método {method_num}: {sale_price}")
                            break
                    except Exception as e:
                        continue
                
                # Guardar los datos del producto
                product_data = {
                    "image": image_src,
                    "text": text,
                    "label": label,
                    "sale_price": sale_price,
                    "link_producto": link_producto  # Nuevo campo añadido
                }
                products_data.append(product_data)
                
                print(f"Producto {index} extraído: {product_data}")
            except Exception as e:
                print(f"No se pudieron extraer los datos del producto {index}: {e}")
        
        # Guardar la información en un archivo de texto
        with open(output_file, 'w', encoding='utf-8') as file:
            for idx, product in enumerate(products_data, start=1):
                file.write(f"Producto {idx}:\n")
                file.write(f"  Imagen: {product['image']}\n")
                file.write(f"  Texto: {product['text']}\n")
                file.write(f"  Etiqueta: {product['label']}\n")
                file.write(f"  Precio de venta: {product['sale_price']}\n")
                file.write(f"  Link del producto: {product['link_producto']}\n")  # Nuevo campo en el output
                file.write("\n")
        
        print(f"Los datos de los productos se han guardado en el archivo: {output_file}")
        
    except Exception as e:
        print("Ocurrió un error:", e)
    finally:
        # Espera adicional si es necesario (15 segundos)
        time.sleep(15)
        driver.quit()

# URL de la página de TK Maxx
url = "https://www.tkmaxx.com/de/de/damen/accessories/c/31040000?st=&sort=&facets=is_flash_event:%22false%22&page=9"
# Clase base para buscar productos
base_class = "c-product-grid__item lovelist-product-item lovelist_"

get_product_data(url, base_class)