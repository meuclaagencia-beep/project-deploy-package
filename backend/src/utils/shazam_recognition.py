
import asyncio
import logging
import os
from shazamio import Shazam

# Configuração de logging
logger = logging.getLogger(__name__)

# Função assíncrona para reconhecimento de música
async def recognize_music_async(filepath: str):
    try:
        shazam = Shazam()
        out = await shazam.recognize_song(filepath)
        
        if out and out.get(track):
            track = out[track]
            return {
                title: track.get(title),
                artist: track.get(subtitle),
                shazam_id: track.get(key),
                genres: [g.get(name) for g in track.get(genres, {}).get(genres, [])]
            }
        return None
    except Exception as e:
        logger.error(fErro ao reconhecer música com ShazamIO: {e})
        return None

# Função síncrona para ser chamada pelo Flask
def recognize_music(filepath: str):
    # A chamada a recognize_music_async deve ser feita de forma assíncrona no main.py
    # Esta função síncrona é apenas um placeholder para o main.py
    return None


