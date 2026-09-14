# Bahía — Frontend (React + Vite + Cognito + S3)

Gestor de archivos tipo Google Drive que consume un backend serverless en AWS
(API Gateway + Lambda + S3), con autenticación Cognito.

## Requisitos

Node 18+.

## Uso local

```bash
npm install
npm run dev     # http://localhost:3000  (puerto fijo: es la callback URL registrada en Cognito)
npm run build   # genera dist/
npm run preview # sirve dist/ en :3000
```

## Configuración

Todos los valores del backend están en `src/config.js` (Cognito user pool,
client id, región y base URL de la API). No se usan variables de entorno.

## Endpoints consumidos

Todos con `Authorization: Bearer {idToken}`:

| Acción             | Método | Endpoint                  |
| ------------------ | ------ | ------------------------- |
| URL de subida      | POST   | `/upload-url`             |
| Listar archivos    | GET    | `/files?folderId=root`    |
| URL de descarga    | GET    | `/download-url/{fileId}`  |
| Eliminar archivo   | DELETE | `/files/{fileId}`         |

La subida es en dos pasos: se pide la presigned URL al backend y luego se hace
un `PUT` directo a S3 (con `Content-Type` igual al `fileType` enviado), sin
pasar por la Lambda. El `PUT` usa `XMLHttpRequest` para poder mostrar barra de
progreso. Al terminar se refresca la lista con `GET /files`.

Cualquier respuesta 401/403 cierra la sesión y redirige a `/login`
(ver `src/hooks/useApi.js`).

## Manejo de tokens

Los tokens viven en el estado de React (`src/context/AuthContext.jsx`), no en
`localStorage`. El SDK de Cognito usa un `Storage` personalizado en memoria
(`MemoryStorage` en `src/services/cognito.js`).

Para poder restaurar la sesión al recargar la página, ese storage espeja
**solo el refreshToken y el nombre del último usuario** en `sessionStorage`
(se borra al cerrar la pestaña; el idToken y el accessToken nunca se
persisten). Si prefieres cero persistencia, pon `PERSIST_REFRESH_TOKEN = false`
en `src/services/cognito.js`: todo quedará únicamente en memoria y cada recarga
pedirá login de nuevo.

## Rutas

- `/login` — inicio de sesión
- `/signup` — registro
- `/confirm` — confirmación con el código enviado por email
- `/` — vista principal del Drive (protegida)

## Despliegue en AWS Amplify Hosting

`amplify.yml` en la raíz ya contiene la build estándar de Vite
(`npm ci` → `npm run build` → artefactos en `dist/`).

Como es una SPA con React Router, añade en la consola de Amplify
(**App settings → Rewrites and redirects**) la regla:

```
Source:  </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>
Target:  /index.html
Type:    200 (Rewrite)
```

Recuerda también añadir el dominio de Amplify a las callback URLs del App
Client de Cognito y, cuando el backend deje de usar `Access-Control-Allow-Origin: *`,
incluirlo en la lista de orígenes permitidos.

## Diseño

Panel de instrumentos oscuro: grafito frío (`#0b0c0e`) con texto cálido y un
único color de señal, el ámbar `#f0b429`, reservado para el estado activo (la
acción principal, la ubicación seleccionada, la barra de progreso, el foco de
teclado). El rojo `#e0574f` sólo aparece en errores y en el borrado. El fondo
oscuro no es sólo estética: la app previsualiza imágenes, y sobre grafito se
juzgan mejor que sobre papel.

Dos tipografías, con papeles separados:

- **Familjen Grotesk** para la interfaz: una grotesca con carácter, legible a
  tamaños pequeños.
- **Spline Sans Mono** para todo lo que es dato tabulable — tamaños, fechas,
  tipos, contadores, identificadores. Va con `tabular-nums` y cero con barra,
  así que las columnas se alinean solas.

Los tokens (colores y familias) viven en el bloque `@theme` de `src/index.css`;
`.mono` y `.tag` son las dos únicas utilidades tipográficas de la casa.

## Layout

La vista principal es un armazón de aplicación, no una columna de lectura:

- **Columna izquierda fija** (`Rail`, 248 px): identidad, región, ubicación
  actual, resumen del contenido por tipo y espacio en disco, y el botón de
  subida anclado abajo. Bajo `lg` se reduce a una barra superior (`MobileBar`).
- **Barra de herramientas fija**: título, contador `visibles/total`, filtro por
  nombre, conmutador lista/rejilla y recarga.
- **Área central**: sólo la tabla. En lista es una rejilla de seis columnas
  (n.º, nombre, tipo, tamaño, fecha, acciones) con cabeceras ordenables; en
  rejilla, tarjetas con miniatura. La vista elegida se recuerda en
  `localStorage`.

Interacciones que sustituyen a las anteriores:

- **Arrastrar y soltar** sobre el área central sube archivos; el botón acepta
  selección múltiple y la cola se procesa en serie (un fallo no cancela el resto).
- **Borrado en dos toques dentro de la propia fila**, en lugar del
  `window.confirm` del navegador.
- El **tamaño** se lee de `size`, `fileSize` o `contentLength` (lo que devuelva
  el backend) y se muestra un guion si no viene ninguno.

La animación se limita a una entrada escalonada rápida de las filas y a las
transiciones de estado; todo se desactiva con `prefers-reduced-motion`.

## Estructura

```
src/
  components/   LoginForm, SignUpForm, ConfirmSignUp, AuthLayout, Rail (+MobileBar),
                FileList, FileUploadButton, UploadProgress, ImagePreview,
                FileIcon, Backdrop, Button, Field, ErrorMessage
  context/      AuthContext (sesión + tokens), ToastContext (avisos)
  hooks/        useApi (inyecta el idToken y maneja 401/403)
  lib/          format.js (bytes, fechas, tamaño defensivo)
  pages/        DrivePage
  services/     cognito.js, api.js
  config.js
  App.jsx
  main.jsx
```
