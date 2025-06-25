# app.py

import os
import base64
import uuid
from io import BytesIO
import time
from flask import Flask, jsonify, url_for
from flask_cors import CORS
from werkzeug.exceptions import InternalServerError
from PIL import Image
from gradio_client import Client
from dotenv import load_dotenv

# --- Load Environment Variables ---
load_dotenv()

# --- Application Configuration ---
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)
app.config['JSON_SORT_KEYS'] = False

# --- HF Space API Configuration ---
HF_SPACE_FOR_CLIENT = os.environ.get("GRADIO_HF_SPACE_NAME")
GRADIO_API_NAME_FOR_PREDICT = "/infer"
HF_TOKEN_ENV = os.environ.get("HF_TOKEN")

if not HF_SPACE_FOR_CLIENT:
    app.logger.warning("GRADIO_HF_SPACE_NAME not set in .env file.")
if not HF_TOKEN_ENV:
    app.logger.warning("HF_TOKEN not set in .env file.")

# --- Static Directory for Generated Images ---
STATIC_IMAGE_DIR_NAME = 'generated_images'
STATIC_IMAGE_DIR_PATH = os.path.join(app.static_folder, STATIC_IMAGE_DIR_NAME)
os.makedirs(STATIC_IMAGE_DIR_PATH, exist_ok=True)

# --- General Constants ---
DEFAULT_NEGATIVE_PROMPT = (
    "low quality, worst quality, bad anatomy, bad hands, text, error, missing fingers, "
    "extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, "
    "username, blurry, artist name, deformed, ugly"
)
BASE_IMAGE_PROMPT = "crumpled white paper texture, top-down view, soft shadows, folds, wrinkles, high detail, realistic texture, neutral background"

# --- Helper Functions ---
def call_hf_space_for_image(prompt: str, negative_prompt: str) -> str:
    if not HF_SPACE_FOR_CLIENT or not HF_TOKEN_ENV:
        raise InternalServerError("Image generation service is not configured on the server.")

    try:
        app.logger.info(f"Connecting to Gradio client at: {HF_SPACE_FOR_CLIENT}")
        client = Client(HF_SPACE_FOR_CLIENT, hf_token=HF_TOKEN_ENV)

        result = client.predict(
            prompt,
            negative_prompt,
            api_name=GRADIO_API_NAME_FOR_PREDICT
        )
        app.logger.info("Prediction successful. Processing result...")

        if isinstance(result, tuple) and len(result) > 0:
            image_filepath = result[0]
            app.logger.info(f"API returned a tuple. Extracted image path: {image_filepath}")
        else:
            image_filepath = result

        if not image_filepath or not isinstance(image_filepath, str):
            raise InternalServerError("Image generation did not return a valid file path.")

        with open(image_filepath, "rb") as image_file:
            image_bytes = image_file.read()

        base64_encoded_image = base64.b64encode(image_bytes).decode('utf-8')
        pil_img = Image.open(BytesIO(image_bytes))
        image_format = pil_img.format.lower() if pil_img.format else "png"

        return f"data:image/{image_format};base64,{base64_encoded_image}"

    except Exception as e:
        app.logger.error(f"Error calling Gradio client for '{HF_SPACE_FOR_CLIENT}': {e}", exc_info=True)
        raise InternalServerError(f"The image generation service failed. Details: {str(e)}")


def save_base64_image_and_get_url(base64_string: str) -> str:
    try:
        if not base64_string.startswith("data:image"):
            raise ValueError("Invalid base64 image string format.")

        header, encoded = base64_string.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0]
        image_type = mime_type.split("/")[1] or "png"
        image_data = base64.b64decode(encoded)

        filename = f"{uuid.uuid4()}.{image_type}"
        filepath = os.path.join(STATIC_IMAGE_DIR_PATH, filename)

        with Image.open(BytesIO(image_data)) as image:
            if image_type.lower() in ['jpeg', 'jpg'] and image.mode != 'RGB':
                image = image.convert('RGB')
            image.save(filepath)

        url_path_for_static = f"{STATIC_IMAGE_DIR_NAME}/{filename}"
        return url_for('static', filename=url_path_for_static, _external=True)

    except Exception as e:
        app.logger.error(f"Error saving base64 image: {e}", exc_info=True)
        raise InternalServerError("Failed to process and save the generated image.")


# --- API Endpoints ---

@app.route('/api/v1/generate-base-image', methods=['POST'])
def generate_base_image():
    try:
        start_time = time.time()
        app.logger.info(f"Generating base image with prompt: '{BASE_IMAGE_PROMPT}'")
        base64_image = call_hf_space_for_image(BASE_IMAGE_PROMPT, DEFAULT_NEGATIVE_PROMPT)
        image_url = save_base64_image_and_get_url(base64_image)
        app.logger.info(f"Image saved. URL: {image_url}")
        end_time = time.time()
        time_taken = end_time - start_time

        return jsonify({"imageUrl": image_url, "prompt": BASE_IMAGE_PROMPT, "timeTaken": f"{time_taken:.2f} seconds"}), 200

    except InternalServerError as e:
        return jsonify({"error": e.name, "message": str(e.description)}), 500
    except Exception as e:
        app.logger.error(f"An unexpected error occurred: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred on the server."}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
