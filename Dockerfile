# ==================================================
# Estágio 1: Build (Compilação do Vite)
# ==================================================
FROM node:20-alpine AS builder
WORKDIR /app

# 🏆 ARGUMENTOS PARA RECEBER AS VARIÁVEIS VITE_ DURANTE A BUILD
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_EMBED_DEV_API
ARG VITE_API_BASE_URL

# 🏆 CRITICAMENTE: Injeta as variáveis no ambiente ANTES da build
# Isso permite que o Vite as leia durante o yarn build
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_EMBED_DEV_API=$VITE_EMBED_DEV_API
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Instala o Yarn globalmente (se necessário)
RUN corepack enable

# Copia package.json primeiro
COPY package.json ./

# Copia yarn.lock se existir (será copiado no COPY . . abaixo se existir no contexto)
# Por enquanto, instala sem --frozen-lockfile
RUN yarn install

# Copia o código-fonte completo (incluindo yarn.lock se existir no contexto)
# Agora as variáveis VITE_ estarão disponíveis durante a build
COPY . .

# Se yarn.lock foi copiado, reinstala com --frozen-lockfile para garantir consistência
RUN if [ -f yarn.lock ] && [ -s yarn.lock ]; then \
        echo "yarn.lock encontrado, reinstalando com --frozen-lockfile para garantir consistência"; \
        yarn install --frozen-lockfile; \
    fi

RUN yarn build 

# ==================================================
# Estágio 2: Produção (Serve os arquivos estáticos)
# ==================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Instala o 'serve' globalmente para rodar o comando de preview/start
RUN npm install -g serve

# Copia a saída da build (dist)
COPY --from=builder /app/dist /app/dist 

# Define a porta e o comando de inicialização
ENV PORT 8080
EXPOSE 8080

# Comando de inicialização: serve -s dist -p 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
