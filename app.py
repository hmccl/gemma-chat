from flask import (
    Flask,
    render_template,
    request,
    Response,
    stream_with_context,
    jsonify,
)
from werkzeug.utils import secure_filename
from PIL import Image
import io
from dotenv import load_dotenv
import os

from google import genai

# Load environment variables from .env file
load_dotenv()

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
chat_session = client.chats.create(model="gemini-2.0-flash-lite")

app = Flask(__name__, static_folder="static", template_folder="templates")

next_message = ""
next_image = ""


def allowed_file(filename):
    """Returns if a filename is supported via its extension"""
    _, ext = os.path.splitext(filename)
    return ext.lstrip(".").lower() in ALLOWED_EXTENSIONS


@app.route("/upload", methods=["POST"])
def upload_file():
    """Takes in a file, checks if it is valid,
    and saves it for the next request to the API
    """
    global next_image

    if "file" not in request.files:
        return jsonify(success=False, message="Sem arquivo")

    file = request.files["file"]

    if file.filename == "":
        return jsonify(success=False, message="Nenhum arquivo selecionado")
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)

        # Read the file stream into a BytesIO object
        file_stream = io.BytesIO(file.read())
        file_stream.seek(0)
        next_image = Image.open(file_stream)

        return jsonify(
            success=True,
            message="Arquivo anexado com sucesso",
            filename=filename,
        )
    return jsonify(success=False, message="Tipo de arquivo não permitido")


@app.route("/", methods=["GET"])
def index():
    """Renders the main homepage for the app"""
    return render_template("index.html", chat_history=chat_session.get_history())


@app.route("/chat", methods=["POST"])
def chat():
    """
    Takes in the message the user wants to send
    to the Gemini API, saves it
    """
    global next_message
    next_message = request.json["message"]
    print(chat_session.get_history())

    return jsonify(success=True)


@app.route("/stream", methods=["GET"])
def stream():
    """
    Streams the response from the server for
    both multi-modal and plain text requests
    """

    def generate():
        global next_message
        global next_image
        assistant_response_content = ""

        if next_image != "":
            response = chat_session.send_message_stream([next_message, next_image])
            next_image = ""
        else:
            response = chat_session.send_message_stream(next_message)
            next_message = ""

        for chunk in response:
            if chunk.text:
                assistant_response_content = chunk.text.replace('\n', '\\n').replace('\r', '\\r')
                yield f"data: {assistant_response_content}\n\n"


    return Response(stream_with_context(generate()), mimetype="text/event-stream")
