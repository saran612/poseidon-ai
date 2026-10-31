# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /ui
COPY ui/package*.json ./
RUN npm install
COPY ui/ ./
RUN npm run build

# Stage 2: Python Backend Server
FROM python:3.13-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt pyproject.toml README.md ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Copy compiled frontend from Stage 1 into /app/ui/dist
COPY --from=frontend-builder /ui/dist /app/ui/dist
RUN pip install --no-cache-dir -e . --no-build-isolation

EXPOSE 8000

CMD ["uvicorn", "poseidon.main:app", "--host", "0.0.0.0", "--port", "8000"]
