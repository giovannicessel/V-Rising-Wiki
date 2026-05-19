# Publicar no GitHub Pages

O deploy **só funciona** depois de ativar o Pages **uma vez** nas configurações do repositório.

## Passo obrigatório (faça no navegador)

1. Abra: https://github.com/giovannicessel/V-Rising-Wiki/settings/pages  
2. Em **Build and deployment** → **Source**, escolha **GitHub Actions** (não “Deploy from a branch”).  
3. Salve se aparecer botão de salvar.

## Disparar o deploy

1. Abra: https://github.com/giovannicessel/V-Rising-Wiki/actions  
2. Workflow **Deploy GitHub Pages** → **Run workflow** (ou faça um novo push na `main`).

## URL do site

https://giovannicessel.github.io/V-Rising-Wiki/

O build leva alguns minutos (muitos assets em `client/public/assets`).

## Erro “Failed to create deployment (status: 404)”

Significa que o **Pages ainda não está ativado** com fonte **GitHub Actions**. Repita o passo obrigatório acima e rode o workflow de novo.
