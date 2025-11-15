"""
Módulo de transcrição de áudio usando Whisper Local (OpenAI Whisper)
Versão otimizada para reduzir uso de memória
"""
import whisper
import os
import logging
import gc
import torch

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Usar modelo tiny ao invés de base para reduzir uso de memória
# tiny: ~1GB RAM, base: ~2GB RAM, small: ~5GB RAM
_whisper_model = None
_model_name = "tiny"  # Mudado de "base" para "tiny" para economia de memória

def get_whisper_model():
    """Carrega o modelo Whisper uma única vez (singleton pattern)."""
    global _whisper_model
    if _whisper_model is None:
        logger.info(f"Carregando modelo Whisper ({_model_name})...")
        _whisper_model = whisper.load_model(_model_name)
        logger.info("Modelo Whisper carregado com sucesso")
    return _whisper_model

def transcribe_audio_whisper_local(audio_filepath):
    """
    Transcreve um arquivo de áudio para texto usando Whisper Local.
    
    Args:
        audio_filepath (str): Caminho completo para o arquivo de áudio
        
    Returns:
        str: Texto transcrito ou "." se houver erro
    """
    try:
        # Verificar se arquivo existe
        if not os.path.exists(audio_filepath):
            logger.error(f"Arquivo não encontrado: {audio_filepath}")
            return "."
        
        logger.info(f"Iniciando transcrição de: {audio_filepath}")
        
        # Carregar modelo
        model = get_whisper_model()
        
        # Limpar cache de GPU se disponível
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        # Transcrever áudio
        # language="pt" força português
        # fp16=False desabilita precisão de 16 bits (melhor compatibilidade sem GPU)
        # beam_size=1 reduz uso de memória (padrão é 5)
        # best_of=1 reduz uso de memória (padrão é 5)
        result = model.transcribe(
            audio_filepath,
            language="pt",
            fp16=False,
            verbose=False,
            beam_size=1,  # Reduz uso de memória
            best_of=1,    # Reduz uso de memória
            temperature=0.0  # Desabilita sampling para economizar memória
        )
        
        # Extrair texto transcrito
        transcription_text = result["text"].strip()
        
        # Limpar resultado da memória
        del result
        gc.collect()
        
        if not transcription_text:
            logger.warning("Transcrição vazia")
            return "."
        
        logger.info(f"Transcrição concluída: {len(transcription_text)} caracteres")
        return transcription_text
        
    except Exception as e:
        logger.error(f"Erro ao transcrever com Whisper Local: {e}")
        import traceback
        traceback.print_exc()
        # Limpar memória em caso de erro
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        return "."
