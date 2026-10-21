# syntax=docker/dockerfile:1

# ---- build stage -----------------------------------------------------------
# Match this Node major to whatever the Playwright runtime image ships:
#   docker run --rm mcr.microsoft.com/playwright:v1.62.1-noble node -v
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime stage ---------------------------------------------------------
# This tag MUST match your installed playwright version exactly. The image
# ships browsers built for that release; a mismatch fails at launch with
# "Executable doesn't exist at /ms-playwright/...".
FROM mcr.microsoft.com/playwright:v1.62.1-noble AS runtime

# dumb-init becomes PID 1 and reaps the zombie processes Chromium leaves
# behind. Without it those accumulate until the container hits its PID limit.
USER root
RUN apt-get update \
    && apt-get install --no-install-recommends -y dumb-init \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    HEADLESS=true \
    PORT=8080

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# pwuser ships with the Playwright image and already owns /ms-playwright.
RUN chown -R pwuser:pwuser /app
USER pwuser

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--enable-source-maps", "dist/server.js"]