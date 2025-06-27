# Use a base Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install required system dependencies for OpenCV and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy all files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (Spaces expects this)
EXPOSE 7860

# Default command to run app
CMD ["python", "app.py"]

