#!/bin/sh
set -e

MODEL="${OLLAMA_PRELOAD_MODEL:-mxbai-embed-large}"

echo "[entrypoint] starting ollama serve"
ollama serve &
PID=$!

# Wait for the API to respond (Railway boots can be slow).
for i in $(seq 1 60); do
  if curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "[entrypoint] ollama API ready after ${i}s"
    break
  fi
  sleep 1
done

# Idempotent: no-op if the model is already cached in the persistent volume.
echo "[entrypoint] ensuring model is present: ${MODEL}"
ollama pull "${MODEL}"

# Warm-up: trigger one embedding so the model is loaded into RAM right after
# boot (combines with OLLAMA_KEEP_ALIVE=-1 to keep it loaded indefinitely).
echo "[entrypoint] warming model"
curl -s -X POST http://localhost:11434/api/embeddings \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"${MODEL}\",\"prompt\":\"warmup\"}" >/dev/null || true

echo "[entrypoint] ready; handing control to ollama serve"
wait "$PID"
