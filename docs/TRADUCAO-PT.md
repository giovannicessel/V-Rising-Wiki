# Tradução do conteúdo para português

## Pré-requisitos

1. Chave em `.env`: `GOOGLE_API_KEY=` (crie em https://aistudio.google.com/apikey)
2. **Nunca** commite `.env` nem cole a chave em arquivos públicos.

## Pipeline recomendado

```bash
# 1. Atualizar dados da Fandom (inclui seções Crafting)
npm run sync:entities

# 2. Gerar entities.json + receitas estruturadas
npm run build:entities

# 3. Catálogo de joias (tiers 1–4) e anéis/pingentes
npm run fetch:jewels

# 4. Traduzir textos em inglês (lotes via Gemini)
npm run translate:pt
npm run translate:pt:apply
```

Ou tudo de uma vez (após sync):

```bash
npm run wiki:full
```

## Opções do tradutor

| Comando | Descrição |
|---------|-----------|
| `npm run translate:pt` | Traduz e grava cache em `client/src/data/content-pt-cache.json` |
| `npm run translate:pt:apply` | Aplica o cache em `entities.json` |
| `--limit=50` | Só N blocos (teste) |
| `--dry-run` | Lista o que seria traduzido |
| `--force` | Re-traduz mesmo com cache |

Variáveis: `GOOGLE_TEXT_MODEL`, `GOOGLE_TRANSLATE_BATCH`, `GOOGLE_TRANSLATE_DELAY_MS`.

## Craft de itens

Após `sync:entities`, itens com seção **Crafting** na Fandom ganham `meta.craftRecipe` (materiais + estrutura) no build.
