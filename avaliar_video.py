#!/usr/bin/env python3
"""
avaliar_video.py — Dá nota manual (1-5) aos vídeos gerados pelo gerar_motion.py,
alimentando o histórico (.historico_geracoes.json) usado pelo XTTS_AUTOTUNE.

Não importa gerar_motion.py de propósito: evitaria carregar TTS/torch só pra
listar e salvar nota.

Uso:
    python3 avaliar_video.py              # avalia as 10 últimas gerações sem nota
    python3 avaliar_video.py --todas      # avalia todas as gerações sem nota
"""
import sys
import json
from pathlib import Path

HISTORICO = Path(__file__).parent / ".historico_geracoes.json"


def carregar() -> list:
    if HISTORICO.exists():
        try:
            return json.loads(HISTORICO.read_text())
        except Exception:
            pass
    return []


def salvar(historico: list) -> None:
    HISTORICO.write_text(json.dumps(historico, ensure_ascii=False, indent=2))


def main():
    historico = carregar()
    pendentes = [g for g in historico if g.get("rating") is None and g.get("video_path")]
    if not pendentes:
        print("✅ Nada pendente de avaliação.")
        return

    pendentes.sort(key=lambda g: g.get("timestamp", ""), reverse=True)
    if "--todas" not in sys.argv:
        pendentes = pendentes[:10]

    print(f"📋 {len(pendentes)} vídeo(s) pendente(s) de nota (1-5, 'q' sai, enter pula):\n")
    for g in pendentes:
        qa = g.get("qa") or {}
        flags = [k for k, v in qa.items() if v is True]
        print(f"— {g['tema']}")
        print(f"  {g.get('timestamp', '')} | {g['video_path']}")
        if flags:
            print(f"  ⚠️  QA: {', '.join(flags)}")

        while True:
            resposta = input("  Nota (1-5): ").strip().lower()
            if resposta == "q":
                print("Saindo.")
                return
            if resposta == "":
                break
            if resposta in {"1", "2", "3", "4", "5"}:
                g["rating"] = int(resposta)
                salvar(historico)
                break
            print("  Nota inválida — digite 1 a 5, enter pra pular, ou 'q' pra sair.")
        print()


if __name__ == "__main__":
    main()
