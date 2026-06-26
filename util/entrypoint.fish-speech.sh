#!/bin/bash

cd /opt/fish-speech

if [ ! -f "checkpoints/openaudio-s1-mini/codec.pth" ]; then
    echo "Downloading models..."

    if [ -z "$HF_TOKEN" ]; then
        echo "Error: HF_TOKEN environment variable is not set."
        echo "Please export your Hugging Face token using:"
        echo "export HF_TOKEN=your_token_here or if you are in Docker add to the env the HF_TOKEN"
        exit 1
    fi

    pip install huggingface_hub --no-cache-dir
    huggingface-cli download --resume-download fishaudio/openaudio-s1-mini --local-dir checkpoints/openaudio-s1-mini
fi

python -m tools.api_server --listen 0.0.0.0:6673 --compile \
    --llama-checkpoint-path checkpoints/openaudio-s1-mini \
    --decoder-checkpoint-path checkpoints/openaudio-s1-mini/codec.pth \
    --decoder-config-name modded_dac_vq
