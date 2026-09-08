# Archivo — Frontend (React + Vite + Cognito + S3)

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

Sistema monocromo (tinta `#0d0d0c` sobre papel `#f4f3ef`), sin color y sin
esquinas redondeadas. Tres tipografías: Instrument Serif para los títulos,
Archivo para el texto e IBM Plex Mono para etiquetas y metadatos. Los tokens
viven en el bloque `@theme` de `src/index.css`, así que para cambiar la paleta
o las fuentes solo hay que tocar ese archivo.

Las miniaturas se muestran en escala de grises y recuperan su color al pasar
el cursor; el visor a pantalla completa siempre las enseña en color.

## Estructura

```
src/
  components/   LoginForm, SignUpForm, ConfirmSignUp, Header, FileList,
                FileUploadButton, UploadProgress, ImagePreview, FileIcon, ...
  context/      AuthContext (sesión + tokens), ToastContext (avisos)
  hooks/        useApi (inyecta el idToken y maneja 401/403)
  pages/        DrivePage
  services/     cognito.js, api.js
  config.js
  App.jsx
  main.jsx
```
