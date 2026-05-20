# Tradução do conteúdo para português

## Importar do markdown (recomendado — sem API)

1. Export PT em `docs/TRADUCAO-PT-BR.md` (o script também busca em `Downloads/*Tradu*Completa*.md`).
2. Execute:

```bash
npm run import:md
```

Atualiza `entities.json`, `weapons-catalog.json`, `jewelry-catalog.json` e o cache PT.

**Cobertura típica após import:** ~60 chefes, ~48 feitiços, catálogo de armas e jewelry; guias de luta longos e modificadores de joias de feitiço podem permanecer em inglês (não vêm no export da UI).

## Pré-requisitos (API Gemini — opcional)

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
