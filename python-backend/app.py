# app.py
import tempfile
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
import cv2
import numpy as np
from flask import request
from werkzeug.exceptions import BadRequest
import requests
import boto3
from botocore.exceptions import BotoCoreError, ClientError

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

# --- S3 Configuration ---
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.environ.get("AWS_REGION")
AWS_BUCKET_NAME = os.environ.get("AWS_BUCKET_NAME")

if not HF_SPACE_FOR_CLIENT:
    app.logger.warning("GRADIO_HF_SPACE_NAME not set in .env file.")
if not HF_TOKEN_ENV:
    app.logger.warning("HF_TOKEN not set in .env file.")

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

# --- API Endpoints ---

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for AWS App Runner"""
    return jsonify({
        "status": "healthy", 
        "service": "artwork-mapping-api",
        "version": "1.0.0"
    }), 200

@app.route('/api/v1/generate-base-image', methods=['POST'])
def generate_base_image():
    try:
        start_time = time.time()
        app.logger.info(f"Generating base image with prompt: '{BASE_IMAGE_PROMPT}'")
        base64_image =  call_hf_space_for_image(BASE_IMAGE_PROMPT, DEFAULT_NEGATIVE_PROMPT)
        app.logger.info(f"Base image generated as base64.")
        end_time = time.time()
        time_taken = end_time - start_time

        return jsonify({"base64Image": base64_image, "prompt": BASE_IMAGE_PROMPT, "timeTaken": f"{time_taken:.2f} seconds"}), 200

    except InternalServerError as e:
        return jsonify({"error": e.name, "message": str(e.description)}), 500
    except Exception as e:
        app.logger.error(f"An unexpected error occurred: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred on the server."}), 500


@app.route('/api/v1/map-artwork', methods=['POST'])
def map_artwork():
    try:
        if not AWS_BUCKET_NAME:
            raise InternalServerError("S3 bucket name is not configured on the server.")

        data = request.get_json()
        if not data:
            raise BadRequest("Missing JSON payload.")
        start_time = time.time()
        base_img_url = data.get("baseImageUrl")
        art_img_url = data.get("artworkUrl")
        rotation = data.get("rotation", 0)

        if not base_img_url or not art_img_url:
            raise BadRequest("Both 'baseImageUrl' and 'artworkUrl' are required.")

        # Download images from URLs
        base_img_arr = np.asarray(bytearray(requests.get(base_img_url).content), dtype=np.uint8)
        art_img_arr = np.asarray(bytearray(requests.get(art_img_url).content), dtype=np.uint8)
        base_img = cv2.imdecode(base_img_arr, cv2.IMREAD_COLOR)
        art_img = cv2.imdecode(art_img_arr, cv2.IMREAD_COLOR)

        if base_img is None or art_img is None:
            raise InternalServerError("Failed to decode one or both images. Check image URLs or format.")

        # --- Create a transparent layer for the artwork ---
        h, w = base_img.shape[:2]
        art_layer = np.zeros((h, w, 4), dtype=np.uint8)

        # --- Resize artwork to fit the base image dimensions ---
        resized_art = cv2.resize(art_img, (w, h))

        # --- Place resized artwork onto the center of the transparent layer ---
        x_offset = 0
        y_offset = 0
        
        # Create a 4-channel version of the resized artwork if it's 3-channel
        if resized_art.shape[2] == 3:
            resized_art_bgra = cv2.cvtColor(resized_art, cv2.COLOR_BGR2BGRA)
        else:
            resized_art_bgra = resized_art

        art_layer[y_offset:y_offset+h, x_offset:x_offset+w] = resized_art_bgra
        
        # --- Apply rotation transformations ---
        center = (w // 2, h // 2)
        transform_matrix = cv2.getRotationMatrix2D(center, rotation, 1.0)
        transformed_art_layer = cv2.warpAffine(art_layer, transform_matrix, (w, h))

        # --- Blend the transformed artwork with the base image ---
        # Extract the alpha mask and color channels from the transformed artwork
        alpha_mask = transformed_art_layer[:, :, 3] / 255.0
        art_color = transformed_art_layer[:, :, :3]

        # Blend the artwork onto the base image
        blended_img = base_img.copy()
        for c in range(3):
            blended_img[:, :, c] = (1 - alpha_mask) * base_img[:, :, c] + alpha_mask * art_color[:, :, c]

        # --- Apply illumination mapping ---
        base_gray = cv2.cvtColor(base_img, cv2.COLOR_BGR2GRAY)
        illumination_mask = cv2.normalize(base_gray, None, 0.3, 1.0, cv2.NORM_MINMAX, dtype=cv2.CV_32F)

        # Apply the illumination mask to the blended image
        final_img_float = blended_img.astype(np.float32) / 255.0
        for c in range(3):
            final_img_float[:, :, c] = final_img_float[:, :, c] * illumination_mask
        
        mapped_img_uint8 = np.clip(final_img_float * 255, 0, 255).astype(np.uint8)

        # --- Add Vignette Effect ---
        vignette_strength = 0.9 # How dark the edges are (0.0=black, 1.0=no change)
        vignette_smoothness = 1.2 # How gradually it fades (0.1=sharp, 0.7=very smooth)
        
        kernel_x = cv2.getGaussianKernel(w, int(w * vignette_smoothness))
        kernel_y = cv2.getGaussianKernel(h, int(h * vignette_smoothness))
        kernel = kernel_y * kernel_x.T
        mask = cv2.normalize(kernel, None, 1.0, vignette_strength, cv2.NORM_MINMAX)

        vignetted_img = np.copy(mapped_img_uint8)
        for i in range(3):
            vignetted_img[:, :, i] = vignetted_img[:, :, i] * mask
        
        # --- Encode and upload ---
        is_success, buffer = cv2.imencode(".png", vignetted_img)
        if not is_success:
            raise InternalServerError("Failed to encode the output image.")
        base64_image = base64.b64encode(buffer).decode("utf-8")
        base64_string = f"data:image/png;base64,{base64_image}"
        
        # Upload to S3
        filename = f"{uuid.uuid4().hex}.png"
        temp_dir = tempfile.gettempdir()
        local_path = os.path.join(temp_dir, filename)
        s3_key = f"artwork-testing/{filename}"

        with open(local_path, "wb") as f:
            f.write(buffer)

        s3_client = boto3.client("s3", region_name=AWS_REGION)
        s3_url = ""
        try:
            s3_client.upload_file(local_path, AWS_BUCKET_NAME, s3_key, ExtraArgs={"ContentType": "image/png"})
            s3_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
            app.logger.info(f"Image uploaded to S3: {s3_url}")
        except (BotoCoreError, ClientError) as s3_error:
            app.logger.error(f"Failed to upload to S3: {s3_error}")
            raise InternalServerError("Image upload to S3 failed.")
        finally:
            if os.path.exists(local_path):
                os.remove(local_path)

        time_taken = time.time() - start_time
        app.logger.info(f"Image mapping completed in {time_taken:.2f} seconds.")
        return jsonify({
            "s3Url": s3_url,
            "timeTaken": f"{time_taken:.2f} seconds"
        }), 200

    except BadRequest as e:
        return jsonify({"error": "Bad Request", "message": str(e)}), 400
    except InternalServerError as e:
        return jsonify({"error": e.name, "message": str(e.description)}), 500
    except Exception as e:
        app.logger.error(f"Image mapping failed: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "Image mapping process failed."}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
