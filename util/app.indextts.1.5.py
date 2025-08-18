from fastapi import FastAPI
from pydantic import BaseModel
import base64, tempfile, os
from indextts.infer import IndexTTS
from huggingface_hub import hf_hub_download

app = FastAPI()

REPO_ID = "IndexTeam/IndexTTS-1.5"
FILES = [
    "config.yaml",
    "bigvgan_discriminator.pth",
    "bigvgan_generator.pth",
    "bpe.model",
    "dvae.pth",
    "gpt.pth",
    "unigram_12000.vocab"
]
LOCAL_DIR = "checkpoints"

os.makedirs(LOCAL_DIR, exist_ok=True)
for file in FILES:
    file_path = os.path.join(LOCAL_DIR, file)
    if not os.path.exists(file_path):
        print(f"Downloading required file: {file}")
        hf_hub_download(
            repo_id=REPO_ID,
            filename=file,
            local_dir=LOCAL_DIR,
            local_dir_use_symlinks=False,
            force_download=False
        )
    else:
        print(f"{file} exist")

class VoiceCloneRequest(BaseModel):
    audio_base64: str
    text: str

class VoiceCloneResponse(BaseModel):
    output_audio_base64: str

# Instanciar IndexTTS (una sola vez al iniciar el servidor)
tts = IndexTTS(model_dir="checkpoints", cfg_path="checkpoints/config.yaml")

@app.post("/synthesize", response_model=VoiceCloneResponse)
async def synthesize(request: VoiceCloneRequest):
    # Decodificar audio Base64 y guardar como archivo WAV
    audio_data = base64.b64decode(request.audio_base64)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
        tmp_in.write(audio_data)
        input_path = tmp_in.name

    # Definir ruta de salida
    output_path = input_path.replace(".wav", "_out.wav")
    # Ejecutar síntesis de voz con IndexTTS
    tts.infer(input_path, request.text, output_path)

    # Leer audio generado y codificarlo en Base64
    with open(output_path, "rb") as f:
        out_bytes = f.read()
    output_audio_b64 = base64.b64encode(out_bytes).decode("utf-8")

    # Limpiar archivos temporales
    os.remove(input_path)
    os.remove(output_path)

    return {"output_audio_base64": output_audio_b64}

@app.get('/health')
def health_check():
    return {"status": "ok", "message": "MegaTTS3 API is working"}
