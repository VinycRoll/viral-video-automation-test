---
step: 3
name: "Seleção do Ângulo"
type: checkpoint
outputFile: "squads/reels-financas/output/angulo-escolhido.md"
on_reject: "2"
---

# Checkpoint 3: Seleção do Ângulo

## Propósito

Apresentar ao usuário os 3-5 ângulos candidatos que Victor Viral propôs em
`squads/reels-financas/output/padroes-virais.md`, explicar a recomendação, e aguardar a escolha
explícita de qual ângulo seguir para o Reel de hoje. Este é o gate que decide a perspectiva
emocional/estrutural do conteúdo antes de qualquer tema ser definido.

## Pergunta ao usuário (via AskUserQuestion)

**Pergunta**: "Victor Viral encontrou estes ângulos virais. Qual você quer usar no Reel de hoje?"

**Opções**: os nomes dos ângulos candidatos de `padroes-virais.md` (ex.: "Erro/confissão numérica",
"Aversão à perda", "Mito x realidade", "Comparação numérica/infográfico"), destacando qual Victor
recomendou. Se houver mais de 4 ângulos candidatos, priorizar nas opções os 3 com confiança mais
alta e oferecer os demais via "Other".

## Ação após resposta

1. Se o usuário escolher um ângulo listado: salvar o ângulo escolhido, o padrão de origem e o
   exemplo de hook citado por Victor Viral em `squads/reels-financas/output/angulo-escolhido.md`.
2. Se o usuário rejeitar todos os ângulos (pedir novas opções): voltar para o Pipeline Step 2
   (`on_reject: "2"`), instruindo Victor Viral a pesquisar em categorias de fonte diferentes das já
   usadas.

## Formato de saída

```
ÂNGULO ESCOLHIDO

Ângulo: <nome do ângulo>
Padrão de origem: <descrição citada por Victor Viral>
Exemplo de hook de referência: "<hook>"
Escolhido pelo usuário em: <data>
```

## Avança para

Pipeline Step 4 (Ângela Ângulo — Definição de Tema e Legenda).
