FROM python:3.14-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY backend/ .

# Build frontend
COPY frontend/ frontend/
RUN cd frontend && npm install && npm run build
RUN cp -r frontend/dist/* .

# Expose port
EXPOSE 8000

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
