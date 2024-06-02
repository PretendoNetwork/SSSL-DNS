# syntax=docker/dockerfile:1

# * Base Node.js image
FROM node:20-alpine AS base
WORKDIR /home/node/app


# * Installing production dependencies
FROM base AS dependencies

RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=package-lock.json,target=package-lock.json \
	--mount=type=cache,target=/root/.npm \
	npm ci --omit=dev


# * Installing development dependencies and building the application
FROM dependencies AS build

RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=package-lock.json,target=package-lock.json \
	--mount=type=cache,target=/root/.npm \
	npm ci

COPY . .
RUN npm run build


# * Running the final application
FROM base AS final

RUN npm install -g pm2

ENV NODE_ENV production
USER node

COPY package.json .

COPY --from=dependencies /home/node/app/node_modules ./node_modules
COPY --from=build /home/node/app/dist ./dist

CMD pm2 start . --no-daemon
