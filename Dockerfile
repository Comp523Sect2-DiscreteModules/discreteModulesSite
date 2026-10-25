FROM node:22-slim AS build
WORKDIR /app
COPY frontend/package*.json frontend/
RUN npm --prefix frontend ci
COPY frontend frontend
RUN npm --prefix frontend run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY backend/package*.json backend/
RUN npm --prefix backend ci --omit=dev
COPY backend backend
COPY --from=build /app/frontend/dist frontend/dist
# OpenShift runs with a random UID in group 0; keep files readable by it.
RUN chgrp -R 0 /app && chmod -R g=u /app
USER 1001
EXPOSE 8080
CMD ["node", "backend/src/server.js"]
