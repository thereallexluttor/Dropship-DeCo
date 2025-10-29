# Configuración de Plantilla de Email de Confirmación - Unisantander

## Descripción
Esta guía explica cómo configurar la plantilla de correo de confirmación de cuenta en Supabase para que coincida con la identidad visual de Unisantander.

## Pasos para Configurar

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Inicia sesión en tu [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Navega a **Authentication** → **Email Templates** en el menú lateral
4. Busca la plantilla **"Confirm signup"**
5. Copia el contenido del archivo `supabase-email-confirmation-template.html`
6. Pega el contenido en el editor de la plantilla
7. Guarda los cambios

### Opción 2: Usando la CLI de Supabase

Si tienes configurada la CLI de Supabase:

```bash
supabase link --project-ref tu-project-ref
supabase db push
```

Luego actualiza la configuración de la plantilla desde el dashboard.

## Personalización de Variables

La plantilla utiliza las siguientes variables de Supabase:

- `{{ .ConfirmationURL }}` - URL de confirmación generada por Supabase
- `{{ .Email }}` - Dirección de correo del usuario
- `{{ .SiteURL }}` - URL base del sitio

**Nota:** Asegúrate de mantener estas variables en el código HTML para que funcione correctamente.

## Elementos de Diseño Incluidos

✅ Logo y nombre de Unisantander  
✅ Color verde característico (#196428)  
✅ Diseño responsivo y profesional  
✅ Botón de llamada a la acción destacado  
✅ Enlace alternativo por si el botón no funciona  
✅ Aviso de seguridad  
✅ Información de contacto  
✅ Footer con información de la empresa  

## Colores de la Marca

- **Verde Principal:** `#196428`
- **Verde Oscuro:** `#1f2937`
- **Gris Suave:** `#6b7280`
- **Fondo:** `#f9f9f9`

## Prueba la Plantilla

1. Registra una nueva cuenta de prueba en tu aplicación
2. Revisa el correo recibido
3. Verifica que:
   - El diseño se vea correctamente
   - El botón funcione
   - El enlace alternativo funcione
   - Todos los elementos estén alineados correctamente

## Actualizar Información de Contacto

Si necesitas cambiar la información de contacto:

```html
<!-- Busca estas líneas en el archivo HTML: -->
<a href="mailto:sistemas@unisander.com">sistemas@unisander.com</a>
<a href="https://wa.me/3152255019">3152255019</a>
```

## Soporte

Para problemas con la configuración:
- Consulta la [documentación de Supabase](https://supabase.com/docs/guides/auth/auth-email-templates)
- Revisa los logs en el dashboard de Supabase

## Notas Importantes

⚠️ **No elimines las variables `{{ }}`** - Son necesarias para que Supabase inyecte los valores correctos

⚠️ **Mantén el formato HTML** - Asegúrate de copiar todo el código incluyendo las etiquetas de cierre

⚠️ **Prueba antes de producción** - Siempre prueba con una cuenta de prueba antes de usar en producción

