# Hilo Rojo — Artesanías

Sitio web de **Hilo Rojo — Artesanías**, emprendimiento de velas decorativas y aromáticas, objetos decorativos en yeso, bandejas de yeso y resina, y souvenirs, hechos a mano.

Es una vitrina de una sola página: muestra los tipos de piezas y la historia de la marca, y lleva a WhatsApp (catálogo, stock y souvenirs) e Instagram. No tiene carrito ni precios.

- WhatsApp: +54 9 2246 48-6699
- Instagram: [@artesaniashilorojo](https://www.instagram.com/artesaniashilorojo/)

Sitio estático: HTML, CSS y JavaScript, sin dependencias ni paso de compilación.

## Estructura

```
index.html      página principal
404.html        página de error
css/styles.css  estilos (colores y tipografías en :root)
js/main.js      configuración (CONFIG) y animaciones
assets/         imágenes, fuentes e íconos
netlify.toml    configuración de publicación en Netlify
robots.txt
```

## Cómo abrirlo

Doble clic en `index.html` sirve para mirarlo, pero con `file://` el navegador puede bloquear las fuentes. Mejor con un servidor local simple, desde esta carpeta:

```
npx serve
```

y abrir la dirección que muestre.

## Cómo editar textos, enlaces y tagline

- **Tagline del inicio, firma de la historia y enlaces** (catálogo, stock, souvenirs, Instagram): objeto `CONFIG` al principio de `js/main.js`. Los botones toman el enlace de ahí.
- **Textos**: directamente en `index.html`, por sección (inicio, qué hacemos, nuestra historia, souvenirs, envíos, contacto, pie de página).
- **Colores y tipografías**: variables en `:root` al principio de `css/styles.css`.
- **Imágenes**: están optimizadas en `assets/img/` (WebP con JPG de respaldo, en varios tamaños).

## Cómo actualizar la URL del sitio

Las metas con dirección absoluta (`canonical`, `og:url`, `og:image` y `twitter:image`, en `index.html`) usan un único valor provisorio:

```
https://REEMPLAZAR-URL-DEL-SITIO
```

Cuando se conozca la dirección definitiva (la de Netlify o un dominio propio), reemplazalo en un solo paso: en el editor, buscar y reemplazar todo `https://REEMPLAZAR-URL-DEL-SITIO` por la dirección, **sin barra final** (por ejemplo `https://mi-sitio.netlify.app`). Con la dirección definitiva, además:

1. Crear `sitemap.xml` con la dirección de la página principal.
2. Descomentar y completar la línea `Sitemap:` de `robots.txt`.

## Cómo desplegar en Netlify

**Desde GitHub (recomendado)**

1. En https://app.netlify.com: **Add new site → Import an existing project**.
2. Elegir GitHub y autorizar el acceso al repositorio.
3. Configuración de compilación: dejar **Build command** vacío y **Publish directory** en `.` (ya está definido en `netlify.toml`).
4. **Deploy**. Cada cambio que se suba a la rama `main` se publica solo.

**Arrastrando la carpeta**

1. En **Add new site → Deploy manually**, arrastrar la carpeta del proyecto.

Después, para usar un dominio propio: **Domain management → Add a domain** y seguir las instrucciones de DNS. Cuando la dirección sea definitiva, hacer el reemplazo de la sección anterior y volver a publicar.

`netlify.toml` define el caché de los archivos y encabezados de seguridad básicos.

---

© Hilo Rojo — Artesanías. Todos los derechos reservados.
