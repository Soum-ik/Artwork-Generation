# Use a base Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (Spaces expects this)
EXPOSE 7860

# Default command to run app
CMD ["python", "app.py"]

