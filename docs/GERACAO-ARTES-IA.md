# Geração de artes com Google Gemini (IA)

## Por que NÃO colar a chave no chat

- O histórico do chat pode **guardar a chave** mesmo depois de revogar.
- Qualquer pessoa com acesso ao log vê a chave.
- O fluxo correto é: chave só no arquivo **`.env`** (já está no `.gitignore`).

## Passo a passo

1. Crie a chave em [Google AI Studio](https://aistudio.google.com/apikey).
2. Copie `.env.example` → `.env` na raiz do projeto.
3. Cole a chave: `GOOGLE_API_KEY=AIza...`
4. Teste sem gastar crédito (só lista prompts):

   ```bash
   npm run generate:wiki-art -- --dry-run
   ```

5. Gere **uma** imagem de teste:

   ```bash
   npm run generate:wiki-art -- --only=hero-home
   ```

6. Se ficar boa, gere todas (~10 imagens, ~1–2 min entre cada):

   ```bash
   npm run generate:wiki-art
   ```

7. Revogue ou restrinja a chave no Google Cloud / AI Studio.

## Rate limit

- Padrão: **8 segundos** entre requisições (`GOOGLE_AI_DELAY_MS=8000`).
- Se aparecer erro `429` ou `RESOURCE_EXHAUSTED`, suba para `12000` ou `15000`.
- Limites exatos: [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) (variam por conta).

## Arquivos

| Arquivo | Função |
|---------|--------|
| `client/src/data/wiki-art-prompts.json` | Prompts por seção |
| `client/src/data/wiki-art.json` | URLs usadas na Home (atualizado pelo script) |
| `client/public/assets/wiki/` | Imagens geradas |
| `scripts/generate-wiki-art.mjs` | Gerador |

## Ajustar prompts

Edite `wiki-art-prompts.json` e rode de novo com `--force`:

```bash
npm run generate:wiki-art -- --only=section-map --force
```

## Custo e plano gratuito

No tier **gratuito**, a cota de geração de imagem costuma ser **0** (`limit: 0` para `gemini-2.5-flash-image`). Mensagens típicas:

- `Quota exceeded ... free_tier_requests, limit: 0`
- `Imagen 3 is only available on paid plans`

**Solução:** ativar billing em [Google AI / AI Studio](https://ai.google.dev/) e rodar `npm run generate:wiki-art` de novo.

Se não quiser pagar agora, use artes já colocadas em `client/public/assets/wiki/` (manifesto em `wiki-art.json`).

## SynthID

Imagens do Gemini incluem marca d’água SynthID (política Google). Adequado para wiki de fã; evite uso comercial sem revisar termos.
