FROM oven/bun:1 as base
WORKDIR /usr/src/app

FROM base AS install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile && \
    cp -r node_modules /tmp/dev_modules && \
    bun install --frozen-lockfile --production && \
    cp -r node_modules /tmp/prod_modules

FROM base AS prerelease
COPY --from=install /tmp/dev_modules ./node_modules
COPY . .

FROM base AS release
COPY --from=install /tmp/prod_modules ./node_modules
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/package.json .

ENV NODE_ENV=production \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gnupg \
    wget \
    && wget -q -O- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && chown -R bun:bun /usr/src/app/node_modules

USER bun
ENTRYPOINT [ "bun", "start" ]