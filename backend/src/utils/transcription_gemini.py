"""
Módulo de transcrição de áudio usando Google Gemini API
"""
import os
from google import genai
from google.genai import types

def transcribe_audio_gemini(audio_filepath):
    """Transcreve um arquivo de áudio para texto usando a API Gemini."""
    try:
        # Inicializar cliente Gemini
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("ERRO: GEMINI_API_KEY não configurada")
            return None
            
        client = genai.Client(api_key=api_key)
        
        # Determinar o mime type
        mime_type = 'audio/mpeg' if audio_filepath.endswith('.mp3') else 'audio/wav'
        
        # Configurar e fazer upload do arquivo
        config = types.UploadFileConfig(mime_type=mime_type)
        uploaded_file = client.files.upload(file=audio_filepath, config=config)
        
        # Criar prompt para transcrição
        prompt = """Transcreva o áudio fornecido para texto. 

Instruções:
- Transcreva todo o conteúdo falado ou cantado no áudio
- Mantenha a pontuação adequada
- Se houver música, transcreva a letra
- Se houver múltiplas vozes, identifique como [Voz 1], [Voz 2], etc.
- Se houver partes instrumentais longas, indique como [Instrumental]
- Seja preciso e completo

Retorne apenas a transcrição, sem comentários adicionais."""

        # Gerar transcrição
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_uri(
                            file_uri=uploaded_file.uri,
                            mime_type=uploaded_file.mime_type
                        ),
                        types.Part.from_text(text=prompt)
                    ]
                )
            ]
        )
        
        transcription = response.text.strip()
        
        # Deletar arquivo temporário do Gemini
        try:
            client.files.delete(name=uploaded_file.name)
        except:
            pass  # Não falhar se não conseguir deletar
        
        return transcription
        
    except Exception as e:
        print(f"Erro ao transcrever com Gemini: {e}")
        import traceback
        traceback.print_exc()
        return None
