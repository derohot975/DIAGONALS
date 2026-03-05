#!/bin/bash

TOKEN="${GITHUB_TOKEN:-$1}"

if [ -z "$TOKEN" ]; then
  echo "Errore: TOKEN mancante."
  echo "Uso: ./deploy.sh <TOKEN>  oppure  GITHUB_TOKEN=xxx ./deploy.sh"
  exit 1
fi

echo "Push in corso verso GitHub..."
git push "https://derohot975:${TOKEN}@github.com/derohot975/DIAGONALS.git" HEAD:main

if [ $? -eq 0 ]; then
  echo "Push completato con successo."
else
  echo "Errore durante il push."
  exit 1
fi
