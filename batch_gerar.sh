#!/bin/bash
# Roda o pipeline (roteiro -> áudio -> imagens -> render -> QA automático) em --dry-run
# repetidas vezes pra engordar .historico_geracoes.json (alimenta _selecionar_parametros_xtts
# com mais pontos de cada knob, já que XTTS_AUTOTUNE=1 foi ligado pra esta rodada).
# Para sozinho depois de MAX_FAILS falhas consecutivas (quota de API, etc.) pra não girar
# em loop de erro sem parar.
cd "/home/vinycius/Área de trabalho/PROJETOS/instagram-reels" || exit 1
LOG="batch_log.txt"
MAX_RUNS=10
MAX_FAILS=3
fails=0

echo "=== BATCH INICIADO $(date) ===" >> "$LOG"
for run in $(seq 1 "$MAX_RUNS"); do
  echo "--- run $run/$MAX_RUNS $(date) ---" >> "$LOG"
  if python3 post_reel.py --dry-run >> "$LOG" 2>&1; then
    echo "run $run: OK" >> "$LOG"
    fails=0
  else
    fails=$((fails + 1))
    echo "run $run: FALHOU ($fails/$MAX_FAILS)" >> "$LOG"
    if [ "$fails" -ge "$MAX_FAILS" ]; then
      echo "=== PARANDO: $MAX_FAILS falhas consecutivas ===" >> "$LOG"
      exit 1
    fi
  fi
done
echo "=== BATCH FINALIZADO: $MAX_RUNS execuções ($(date)) ===" >> "$LOG"
