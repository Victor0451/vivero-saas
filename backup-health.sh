#!/bin/bash
#source /etc/backup.env

#if ! mountpoint -q "$BACKUP_DIR"; then
#  /usr/local/bin/telegram_notify.sh "❌ ALERTA: /backup NO está montado"
#  exit 1
#fi

#FREE=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $5}' | tr -d '%')

#if [ "$FREE" -ge 90 ]; then
#  /usr/local/bin/telegram_notify.sh "⚠️ ALERTA: Disco /backup al ${FREE}%"
#  exit 0
#fi

# Si llegamos aquí, todo está OK
#HOSTNAME=$(hostname)
#/usr/local/bin/telegram_notify.sh "✅ Server OK: Servidor $HOSTNAME - /backup montado correctamente (${FREE}% usado)"



#!/bin/bash
source /etc/backup.env

# Variables de umbrales
DISK_THRESHOLD=90
RAM_THRESHOLD=90
CPU_THRESHOLD=80
LOAD_THRESHOLD=4
TEMP_THRESHOLD=80
CONNECTIONS_THRESHOLD=1000
SSH_FAILS_THRESHOLD=50

# Servicios críticos a monitorear
CRITICAL_SERVICES=("sshd" "cron" "rsyslog")

HOSTNAME=$(hostname)
ALERTS=""
STATUS="✅"

# 1. Verificar montaje de backup
if ! mountpoint -q "$BACKUP_DIR"; then
  /usr/local/bin/telegram_notify.sh "❌ CRÍTICO: $HOSTNAME - /backup NO está montado"
  exit 1
fi

# 2. Uso de disco /backup
DISK_USED=$(df "$BACKUP_DIR" | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USED" -ge "$DISK_THRESHOLD" ]; then
  ALERTS="${ALERTS}⚠️ Disco /backup: ${DISK_USED}%"$'\n'
  STATUS="⚠️"
fi

# 3. Uso de RAM
RAM_USED=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
RAM_FREE=$(free | awk 'NR==2 {printf "%.0f", $4/$2 * 100}')
RAM_AVAILABLE=$(free -h | awk 'NR==2 {print $7}')
if [ "$RAM_USED" -ge "$RAM_THRESHOLD" ]; then
  ALERTS="${ALERTS}⚠️ RAM crítica: ${RAM_USED}%"$'\n'
  STATUS="⚠️"
fi

# 4. Uso de CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | awk '{print int($1)}')
if [ "$CPU_USAGE" -ge "$CPU_THRESHOLD" ]; then
  ALERTS="${ALERTS}⚠️ CPU alta: ${CPU_USAGE}%"$'\n'
  STATUS="⚠️"
fi

# 5. Load Average
LOAD_1=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $1}' | xargs)
LOAD_5=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $2}' | xargs)
LOAD_15=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $3}' | xargs)
LOAD_1_INT=$(echo "$LOAD_1" | cut -d'.' -f1)
if [ ! -z "$LOAD_1_INT" ] && [ "$LOAD_1_INT" -ge "$LOAD_THRESHOLD" ]; then
  ALERTS="${ALERTS}⚠️ Load alto: ${LOAD_1}"$'\n'
  STATUS="⚠️"
fi

# 6. Uso de disco raíz /
ROOT_USED=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$ROOT_USED" -ge "$DISK_THRESHOLD" ]; then
  ALERTS="${ALERTS}⚠️ Disco raíz /: ${ROOT_USED}%"$'\n'
  STATUS="⚠️"
fi

# 7. Uptime
UPTIME=$(uptime -p | sed 's/up //')

# 8. Procesos zombie
ZOMBIES=$(ps aux | awk '{if ($8=="Z") print}' | wc -l)
if [ "$ZOMBIES" -gt 5 ]; then
  ALERTS="${ALERTS}⚠️ Procesos zombie: ${ZOMBIES}"$'\n'
  STATUS="⚠️"
fi

# 9. Espacio disponible en /backup
BACKUP_FREE=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $4}')

# 10. Temperatura CPU
TEMP="N/A"
if command -v sensors &> /dev/null; then
  TEMP_RAW=$(sensors 2>/dev/null | grep -i 'Package id 0\|Tdie\|temp1' | head -1 | awk '{print $3}' | tr -d '+°C' | cut -d'.' -f1)
  if [ ! -z "$TEMP_RAW" ] && [ "$TEMP_RAW" -ge "$TEMP_THRESHOLD" ] 2>/dev/null; then
    ALERTS="${ALERTS}🔥 Temperatura alta: ${TEMP_RAW}°C"$'\n'
    STATUS="⚠️"
  fi
  [ ! -z "$TEMP_RAW" ] && TEMP="${TEMP_RAW}°C"
elif [ -f /sys/class/thermal/thermal_zone0/temp ]; then
  TEMP_RAW=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null)
  if [ ! -z "$TEMP_RAW" ]; then
    TEMP_RAW=$((TEMP_RAW / 1000))
    if [ "$TEMP_RAW" -ge "$TEMP_THRESHOLD" ]; then
      ALERTS="${ALERTS}🔥 Temperatura alta: ${TEMP_RAW}°C"$'\n'
      STATUS="⚠️"
    fi
    TEMP="${TEMP_RAW}°C"
  fi
fi

# 11. Verificar servicios críticos
SERVICES_DOWN=""
for service in "${CRITICAL_SERVICES[@]}"; do
  if ! systemctl is-active --quiet "$service" 2>/dev/null; then
    SERVICES_DOWN="${SERVICES_DOWN}${service} "
    ALERTS="${ALERTS}🔴 Servicio caído: ${service}"$'\n'
    STATUS="⚠️"
  fi
done

# 12. Conexiones de red activas
CONNECTIONS=$(ss -tan 2>/dev/null | grep ESTAB | wc -l)
if [ -z "$CONNECTIONS" ] || [ "$CONNECTIONS" -eq 0 ]; then
  CONNECTIONS=$(netstat -an 2>/dev/null | grep ESTABLISHED | wc -l)
fi
if [ "$CONNECTIONS" -ge "$CONNECTIONS_THRESHOLD" ]; then
  ALERTS="${ALERTS}⚠️ Conexiones altas: ${CONNECTIONS}"$'\n'
  STATUS="⚠️"
fi

# 13. Últimos logins fallidos
FAILED_LOGINS=$(journalctl -u sshd --since today 2>/dev/null | grep "Failed password" | wc -l)
if [ -z "$FAILED_LOGINS" ] || [ "$FAILED_LOGINS" -eq 0 ]; then
  FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log 2>/dev/null | grep "$(date '+%b %e')" | wc -l)
fi
if [ "$FAILED_LOGINS" -gt "$SSH_FAILS_THRESHOLD" ]; then
  ALERTS="${ALERTS}🔒 Intentos fallidos SSH hoy: ${FAILED_LOGINS}"$'\n'
  STATUS="⚠️"
fi

# 14. Espacio en swap
SWAP_TOTAL=$(free | awk 'NR==3 {print $2}')
if [ "$SWAP_TOTAL" -gt 0 ]; then
  SWAP_USED=$(free | awk 'NR==3 {printf "%.0f", $3/$2 * 100}')
  if [ "$SWAP_USED" -gt 50 ] 2>/dev/null; then
    ALERTS="${ALERTS}⚠️ Swap en uso: ${SWAP_USED}%"$'\n'
    STATUS="⚠️"
  fi
  SWAP_INFO="${SWAP_USED}%"
else
  SWAP_INFO="Sin swap"
fi

# 15. Número de cores
CORES=$(nproc)

# Construir mensaje con formato HTML para Telegram
if [ "$STATUS" = "⚠️" ]; then
  MESSAGE="$STATUS <b>ALERTAS DETECTADAS</b>"$'\n'
  MESSAGE="${MESSAGE}Servidor: <b>${HOSTNAME}</b>"$'\n\n'
  MESSAGE="${MESSAGE}${ALERTS}"$'\n'
  MESSAGE="${MESSAGE}━━━━━━━━━━━━━━━━━━━━━━━━"$'\n\n'
else
  MESSAGE="$STATUS <b>TODO OPERATIVO</b>"$'\n'
  MESSAGE="${MESSAGE}Servidor: <b>${HOSTNAME}</b>"$'\n\n'
  MESSAGE="${MESSAGE}━━━━━━━━━━━━━━━━━━━━━━━━"$'\n\n'
fi

MESSAGE="${MESSAGE}💾 <b>ALMACENAMIENTO</b>"$'\n'
MESSAGE="${MESSAGE}   Disco raíz:    ${ROOT_USED}%"$'\n'
MESSAGE="${MESSAGE}   Backup:        ${DISK_USED}% (${BACKUP_FREE} libre)"$'\n\n'

MESSAGE="${MESSAGE}🧠 <b>RECURSOS</b>"$'\n'
MESSAGE="${MESSAGE}   RAM:           ${RAM_USED}% usado (${RAM_AVAILABLE} libre)"$'\n'
MESSAGE="${MESSAGE}   Swap:          ${SWAP_INFO}"$'\n'
MESSAGE="${MESSAGE}   CPU:           ${CPU_USAGE}% (${CORES} cores)"$'\n'
MESSAGE="${MESSAGE}   Temperatura:   ${TEMP}"$'\n'
MESSAGE="${MESSAGE}   Load avg:      ${LOAD_1}, ${LOAD_5}, ${LOAD_15}"$'\n\n'

MESSAGE="${MESSAGE}🔧 <b>SISTEMA</b>"$'\n'
MESSAGE="${MESSAGE}   Uptime:        ${UPTIME}"$'\n'
MESSAGE="${MESSAGE}   Zombies:       ${ZOMBIES} procesos"$'\n\n'

MESSAGE="${MESSAGE}🌐 <b>RED &amp; SEGURIDAD</b>"$'\n'
MESSAGE="${MESSAGE}   Conexiones:    ${CONNECTIONS} activas"$'\n'
if [ "$FAILED_LOGINS" -gt "$SSH_FAILS_THRESHOLD" ]; then
  MESSAGE="${MESSAGE}   SSH fallidos:  ⚠️ ${FAILED_LOGINS} intentos"$'\n\n'
else
  MESSAGE="${MESSAGE}   SSH fallidos:  ${FAILED_LOGINS} intentos"$'\n\n'
fi

MESSAGE="${MESSAGE}⚙️ <b>SERVICIOS</b>"$'\n'
if [ -z "$SERVICES_DOWN" ]; then
  MESSAGE="${MESSAGE}   Estado:        ✅ Todos operativos"$'\n\n'
else
  MESSAGE="${MESSAGE}   Caídos:        🔴 ${SERVICES_DOWN}"$'\n\n'
fi

MESSAGE="${MESSAGE}━━━━━━━━━━━━━━━━━━━━━━━━"$'\n'
MESSAGE="${MESSAGE}📅 $(date '+%d/%m/%Y %H:%M:%S')"

# Enviar notificación
/usr/local/bin/telegram_notify.sh "$MESSAGE"

exit 0
