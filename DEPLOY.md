# Deploy no Coolify

Este guia documenta como publicar o **dynaform-demo** em produção usando [Coolify](https://coolify.io/).

## Arquivos de infraestrutura

| Arquivo | Finalidade |
|---------|-----------|
| `Dockerfile` | Build multi-stage: Node 22 compila o Angular, nginx serve os arquivos estáticos |
| `nginx.conf` | Serve a SPA com fallback para `index.html` (necessário para rotas como `/builder`) |
| `.dockerignore` | Exclui `node_modules` e `dist` do contexto de build |

## Pré-requisitos

- Repositório no GitHub, GitLab ou Gitea
- Instância do Coolify rodando e acessível
- Domínio apontando para o servidor do Coolify

## Passo a passo

### 1. Faça push do código

```bash
git add Dockerfile nginx.conf .dockerignore
git commit -m "chore: add Dockerfile and nginx config for production deploy"
git push
```

### 2. Crie um novo projeto no Coolify

- **Projects → New Project**
- Dê um nome (ex: `dyna-form`)

### 3. Adicione um novo Resource

- **Add New Resource → Application**
- Escolha seu Git source (GitHub / GitLab / Gitea)
- Selecione o repositório e a branch `main`

### 4. Configure o build

| Campo | Valor |
|-------|-------|
| Build Pack | Dockerfile |
| Dockerfile Location | `./Dockerfile` |
| Port | `80` |

> O Coolify detecta o `Dockerfile` automaticamente se ele estiver na raiz.

### 5. Configure o domínio

- Em **Domains**, adicione seu domínio (ex: `dynaform.seudominio.com`)
- O SSL via Let's Encrypt é provisionado automaticamente pelo Coolify

### 6. Deploy

Clique em **Deploy**. O Coolify irá:

1. Clonar o repositório
2. Executar o build Docker (`npm ci` + `ng build`)
3. Subir o container nginx
4. Configurar o reverse proxy com SSL

## Deploy automático (CI/CD)

Para acionar um novo deploy a cada `git push`:

1. No Coolify, vá em **Configuration → Webhooks** e copie a URL do webhook
2. No seu provedor Git, adicione esse URL como webhook de evento `push` na branch `main`

## Verificação pós-deploy

Após o deploy, confirme que as seguintes rotas funcionam — inclusive ao recarregar a página:

| URL | Página esperada |
|-----|----------------|
| `https://seudominio.com/` | Demo component |
| `https://seudominio.com/builder` | Dictionary Builder |

## Observações

- **Primeiro build**: ~3–5 min (npm instala todas as dependências do zero)
- **Builds subsequentes**: mais rápidos, pois o Docker cacheia a layer de `node_modules` enquanto o `package.json` não muda
- O nginx está configurado com gzip e cache de longa duração para assets com hash no nome (gerados automaticamente pelo Angular em produção)
