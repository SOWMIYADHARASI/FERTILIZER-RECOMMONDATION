# Use standard lightweight python base image
FROM python:3.10-slim

# Set environment paths and variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Run the machine learning pipeline to build & dump the best Random Forest classifier model.pkl
RUN python model/train_model.py

# Expose running port
EXPOSE 5000

# Start production server with 4 Gunicorn workers
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "app:app"]
