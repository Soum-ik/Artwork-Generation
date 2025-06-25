# app.py

import os
import base64
import uuid
from io import BytesIO
import time
from flask import Flask, request, jsonify, render_template, url_for
from flask_cors import CORS
from werkzeug.exceptions import BadRequest, InternalServerError
from PIL import Image
# We DO NOT need handle_file. The client provides a direct path.
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
DEFAULT_NEGATIVE_PROMPT = ("low quality, worst quality, bad anatomy, bad hands, text, error, missing fingers, "
                           "extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, "
                           "username, blurry, artist name, deformed, ugly")
PROMPT_ENHANCER = "cinematic, high detail, photorealistic, 4k, professional photography"


# --- Helper Functions ---

def call_hf_space_for_image(prompt: str, negative_prompt: str) -> str:
    """
    Calls the configured Hugging Face Space to generate an image.
    This version correctly handles the result format based on the user's working example.
    """
    if not HF_SPACE_FOR_CLIENT or not HF_TOKEN_ENV:
        raise InternalServerError("Image generation service is not configured on the server.")

    try:
        app.logger.info(f"Connecting to Gradio client at: {HF_SPACE_FOR_CLIENT}")
        client = Client(HF_SPACE_FOR_CLIENT, hf_token=HF_TOKEN_ENV)
        
        # The predict method signature varies between Spaces.
        result = client.predict(
            prompt,
            negative_prompt,
            api_name=GRADIO_API_NAME_FOR_PREDICT
        )
        app.logger.info("Prediction successful. Processing result...")

        # --- CORRECTED LOGIC ---
        # Following the user's working code: check if the result is a tuple.
        # If it is, the file path is the first element.
        if isinstance(result, tuple) and len(result) > 0:
            image_filepath = result[0]
            app.logger.info(f"API returned a tuple. Extracted image path: {image_filepath}")
        else:
            # If it's not a tuple, assume the result itself is the filepath string.
            image_filepath = result
        
        # We now have a direct string path, just like in the original working code.
        # We DO NOT use handle_file().
        
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
    """
    Saves a base64 encoded image to the static directory and returns its public URL.
    """
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

@app.route('/')
def home():
    """Serves the main chat page."""
    return render_template('index.html')

@app.route('/test')
def test():
    """Serves the main chat page."""
    return "Server running"


@app.route('/api/v1/generate-image', methods=['POST'])
def generate_image_endpoint():
    """API endpoint to handle image generation requests."""
    if not request.is_json:
        raise BadRequest("Request must be JSON.")
    
    data = request.get_json()
    user_prompt = data.get("prompt")
    if not user_prompt:
        raise BadRequest("Missing 'prompt' in request body.")

    try:
        # Start timing
        start_time = time.time()

        # Enhance the user's prompt for better quality
        enhanced_prompt = f"{user_prompt}, {PROMPT_ENHANCER}"
        
        # Call the HF Space
        app.logger.info(f"Generating image for prompt: '{enhanced_prompt}'")
        base64_image = call_hf_space_for_image(enhanced_prompt, DEFAULT_NEGATIVE_PROMPT)
        
        # Save the image and get its URL
        image_url = save_base64_image_and_get_url(base64_image)
        app.logger.info(f"Image saved. URL: {image_url}")
        
        # End timing
        end_time = time.time()
        time_taken = end_time - start_time
        app.logger.info(f"Time taken for image generation: {time_taken:.2f} seconds")
        
        return jsonify({"imageUrl": image_url, "prompt": user_prompt, "timeTaken": f"{time_taken:.2f} seconds"}), 200

    except (BadRequest, ValueError) as e:
        return jsonify({"error": "Bad Request", "message": str(e)}), 400
    except InternalServerError as e:
         return jsonify({"error": e.name, "message": str(e.description)}), 500
    except Exception as e:
        app.logger.error(f"An unexpected error occurred: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred on the server."}), 500


# --- Error Handlers ---
@app.errorhandler(404)
def resource_not_found(e):
    if request.path.startswith('/api/'):
        return jsonify(error="Not Found", message="This API endpoint does not exist."), 404
    return render_template('index.html'), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)