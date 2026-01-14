# Sistema de Notificaciones Automáticas

## 📋 Descripción

El sistema de notificaciones automáticas verifica periódicamente el estado del vivero y genera alertas para:

- ⚠️ **Stock Bajo**: Items con stock ≤ mínimo
- 🚨 **Stock Crítico**: Items agotados (stock = 0)
- 📅 **Tareas Vencidas**: Tareas no completadas con fecha pasada
- 🔔 **Tareas Próximas**: Tareas programadas para los próximos 3 días
- 🌱 **Plantas Enfermas**: Plantas que requieren atención

## 🚀 Configuración

### Opción 1: Vercel Cron Jobs (Recomendado)

El proyecto ya incluye `vercel.json` con la configuración de cron:

```json
{
  "crons": [
    {
      "path": "/api/notifications/check",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Horario actual:** Todos los días a las 9:00 AM UTC

#### Modificar el horario:

Edita `vercel.json` y cambia el `schedule` usando formato cron:

```
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── día del mes (1 - 31)
│ │ │ ┌───────────── mes (1 - 12)
│ │ │ │ ┌───────────── día de la semana (0 - 6) (Domingo = 0)
│ │ │ │ │
* * * * *
```

**Ejemplos:**
- `0 9 * * *` - Diariamente a las 9:00 AM
- `0 */6 * * *` - Cada 6 horas
- `0 9,15 * * *` - A las 9:00 AM y 3:00 PM
- `0 9 * * 1-5` - Lunes a Viernes a las 9:00 AM

**Nota:** Vercel Cron Jobs requieren plan Pro o superior.

---

### Opción 2: Servicios Externos de Cron

Si no tienes Vercel Pro, puedes usar servicios gratuitos:

#### **EasyCron** (https://www.easycron.com)
1. Crear cuenta gratuita
2. Agregar nuevo cron job
3. URL: `https://tu-dominio.vercel.app/api/notifications/check`
4. Frecuencia: Diaria a las 9:00 AM

#### **cron-job.org** (https://cron-job.org)
1. Crear cuenta gratuita
2. Crear nuevo cron job
3. URL: `https://tu-dominio.vercel.app/api/notifications/check`
4. Horario: `0 9 * * *`

#### **GitHub Actions** (Gratis)
Crear `.github/workflows/notifications.yml`:

```yaml
name: Check Notifications

on:
  schedule:
    - cron: '0 9 * * *'  # Diariamente a las 9:00 AM UTC
  workflow_dispatch:  # Permite ejecución manual

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notification check
        run: |
          curl -X GET https://tu-dominio.vercel.app/api/notifications/check
```

---

### Opción 3: Ejecución Manual

#### Desde el Dashboard:
1. Ir a `/dashboard`
2. Click en botón "Verificar Notificaciones"

#### Desde la Terminal:
```bash
curl https://tu-dominio.vercel.app/api/notifications/check
```

#### Desde el Navegador:
```
https://tu-dominio.vercel.app/api/notifications/check
```

---

## 🔧 API Endpoint

### `GET /api/notifications/check`

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Notification checks completed successfully",
  "timestamp": "2026-01-14T14:30:00.000Z"
}
```

**Respuesta con error:**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-01-14T14:30:00.000Z"
}
```

---

## 📊 Tipos de Notificaciones Generadas

| Tipo | Icono | Condición | Frecuencia Máxima |
|------|-------|-----------|-------------------|
| `stock_bajo` | ⚠️ | Stock ≤ Mínimo | 1 cada 24h |
| `stock_critico` | 🚨 | Stock = 0 | 1 cada 24h |
| `tarea_vencida` | 📅 | Fecha < Hoy | 1 por tarea |
| `tarea_proxima` | 🔔 | Fecha en 3 días | 1 cada 24h |
| `planta_enferma` | 🌱 | Estado = enferma | 1 cada 24h |

---

## 🎯 Mejores Prácticas

### Frecuencia Recomendada:

- **Producción:** 1-2 veces al día (9:00 AM y 6:00 PM)
- **Desarrollo:** Manual o cada 6 horas
- **Testing:** Manual desde el dashboard

### Prevención de Spam:

El sistema ya incluye lógica para evitar notificaciones duplicadas:
- Verifica notificaciones no leídas de las últimas 24 horas
- No crea notificación si ya existe una similar

### Monitoreo:

Revisar logs en Vercel/Railway:
```bash
vercel logs
```

---

## 🐛 Troubleshooting

### Las notificaciones no se generan:

1. **Verificar que el cron job esté activo:**
   - Vercel: Dashboard → Settings → Cron Jobs
   - Servicio externo: Verificar logs del servicio

2. **Probar manualmente:**
   ```bash
   curl https://tu-dominio.vercel.app/api/notifications/check
   ```

3. **Revisar logs del servidor:**
   - Buscar errores en la consola
   - Verificar autenticación de usuarios

### Las notificaciones se duplican:

- Verificar que solo haya un cron job activo
- Revisar la lógica de prevención de spam en `notification-generator.ts`

---

## 📝 Notas

- Las notificaciones requieren que los usuarios estén autenticados
- Solo se generan para usuarios del tenant correspondiente
- Las notificaciones se marcan como no leídas por defecto
- Click en la notificación lleva a la página relevante

---

## 🔄 Actualizar Configuración

Para cambiar la frecuencia de verificación:

1. Editar `vercel.json`
2. Commit y push a Git
3. Vercel desplegará automáticamente
4. Los nuevos horarios se aplicarán en el próximo deploy

---

## 📚 Referencias

- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru/)
- [GitHub Actions Cron](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
