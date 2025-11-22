"""
Módulo de IA Chat para RegistraSom
Integração com OpenAI (gpt-4.1-mini)
"""
import os
import logging
from openai import OpenAI
from datetime import datetime
import requests

logger = logging.getLogger(__name__)

# Configurações da OpenAI
# A chave API e o base_url são injetados via variáveis de ambiente do sandbox
client = OpenAI()

# System prompt especializado em mercado fonográfico
SYSTEM_PROMPT = """Você é uma IA especializada em mercado fonográfico, royalties, direito autoral, propriedade intelectual, contratos musicais e distribuição digital.
Sua expertise inclui:
- Royalties e direitos autorais
- Mercado fonográfico brasileiro e internacional
- Contratos musicais e editoras
- Distribuição digital (Spotify, Apple Music, etc.)
- ECAD e arrecadação de direitos
- Composição e produção musical
- ISRC / ISWC e cadastros
- Agregadores digitais
- Copyright e propriedade intelectual
- Legislação musical
Sempre responda de forma clara, profissional e educativa. Use exemplos práticos quando possível."""

def chat_with_phi2(message: str, user_id: int, conversation_history: list = None) -> dict:
    """
    Envia mensagem para a API da OpenAI e retorna a resposta
    
    Args:
        message: Mensagem do usuário
        user_id: ID do usuário
        conversation_history: Histórico de conversação (lista de dicts com role e content)
        
    Returns:
        dict com success, response e error (se houver)
    """
    try:
        # Construir mensagens com histórico
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Adicionar histórico (últimas 10 mensagens)
        if conversation_history:
            messages.extend(conversation_history[-10:])
        
        # Adicionar mensagem atual
        messages.append({"role": "user", "content": message})
        
        logger.info(f"Enviando requisição para OpenAI (user_id={user_id})")
        
        # Fazer requisição para a API da OpenAI
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=512,
            timeout=120 # Timeout estendido para garantir a primeira resposta
        )
        
        assistant_message = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        logger.info(f"Resposta recebida da OpenAI (user_id={user_id}), tokens={tokens_used}")
        
        return {
            "success": True,
            "response": assistant_message.strip(),
            "tokens_used": tokens_used
        }
            
    except Exception as e:
        logger.error(f"Erro inesperado no chat com OpenAI: {str(e)}")
        return {
            "success": False,
            "error": f"Erro inesperado: {str(e)}",
            "response": None
        }

def validate_message(message: str) -> tuple:
    """
    Valida a mensagem do usuário
    
    Returns:
        tuple (is_valid: bool, error_message: str)
    """
    if not message or not message.strip():
        return False, "Mensagem não pode estar vazia"
    
    if len(message) > 2000:
        return False, "Mensagem muito longa (máximo 2000 caracteres)"
    
    return True, None
