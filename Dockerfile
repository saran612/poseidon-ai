# Stage 1: Build React frontend_temp
FROM node:20-alpine AS frontend_temp-builder
WORKDIR /frontend_temp
COPY frontend_temp/package*.json ./
RUN npm install
COPY frontend_temp/ ./
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
# Copy compiled frontend_temp from Stage 1 into /app/frontend_temp/dist
COPY --from=frontend_temp-builder /frontend_temp/dist /app/frontend_temp/dist
RUN pip install --no-cache-dir -e . --no-build-isolation

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
