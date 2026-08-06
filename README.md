# IA BOT ALCALDÍA DIGITAL — v1.2.6

Pizarra institucional para Consejos de Gobierno con carga automática de configuración desde Supabase.

## Novedad principal: Supabase automático

La aplicación puede usar Supabase como fuente central de configuración. Al abrirla en cualquier laptop, navegador o dispositivo:

1. Lee `cloud-bootstrap.js`.
2. Se conecta a Supabase.
3. Busca la fila correspondiente al `boardId` en `presentation_boards`.
4. Descarga el JSON antes de iniciar la presentación.
5. Guarda una copia local para contingencia.
6. Si Supabase o internet no están disponibles, utiliza la última copia local.

Ya no es necesario introducir URL, clave pública e ID del pizarrón en cada navegador.

## Configuración única

### Opción A — PowerShell

Ejecuta desde la carpeta del proyecto:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\CONFIGURAR-CONEXION-AUTOMATICA-SUPABASE.ps1
```

Introduce:

- URL del proyecto Supabase.
- Publishable key (`sb_publishable_...`) o clave `anon` heredada.
- ID exacto del pizarrón.

El script actualizará `cloud-bootstrap.js`. Después publica nuevamente el proyecto en GitHub.

### Opción B — Desde el panel

1. Abre el panel administrativo en el dispositivo que ya tiene la conexión.
2. Ve a **Persistencia en la nube**.
3. Pulsa **Descargar conexión automática para GitHub**.
4. Reemplaza el archivo `cloud-bootstrap.js` de la raíz del repositorio por el descargado.
5. Publica los cambios.

## Seguridad

La Publishable key está diseñada para usarse en aplicaciones web cuando RLS está habilitado. Nunca coloques en `cloud-bootstrap.js`:

- Secret key (`sb_secret_...`).
- `service_role`.
- Contraseña de la base de datos.

La lectura pública puede permitirse mediante RLS. Para una versión institucional definitiva, la escritura debe restringirse a administradores autenticados con Supabase Auth.

## Prioridad de carga

1. Configuración remota de Supabase.
2. Última configuración guardada localmente.
3. Configuración predeterminada del sistema.

El JSON anterior continúa siendo compatible. La importación y exportación manual siguen disponibles.

## Archivos nuevos o modificados

- `cloud-bootstrap.js` — conexión pública de arranque.
- `CONFIGURAR-CONEXION-AUTOMATICA-SUPABASE.ps1` — asistente para crear la conexión.
- `app.js` — sincronización automática y fallback local.
- `sw.js` — caché actualizada para v1.1.8.


## Corrección v1.1.8 — sincronización automática

- Supabase se activa antes de la consulta, sin depender del selector local.
- Tres intentos automáticos y ruta REST de respaldo.
- `cloud-bootstrap.js` se obtiene sin caché.
- Indicador visible NUBE: CONECTANDO / SINCRONIZADA / ERROR.
- Diagnóstico: `diagnostico-supabase.html`.


## v1.2.6 — Control visual del agente IA

- El código embed continúa administrándose desde el backend; no existe un `agent-id` hardcodeado.
- Controles de escala general de 25% a 350%, escala horizontal y escala vertical.
- Posición X/Y, desplazamientos finos, dimensiones base y origen de transformación.
- Modos columna derecha, flotante libre y pantalla completa.
- Ajustes Manual, Contener, Cubrir y Rellenar.
- Panel exterior y cabecera opcionales.
- Detección dinámica de ElevenLabs con opción de forzar `variant=expanded`.
- Toda la configuración visual se guarda en laptop, JSON y Supabase dentro de `embedPresentation`.
