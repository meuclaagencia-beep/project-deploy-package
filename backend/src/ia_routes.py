"""
Rotas de API para Chat de IA - RegistraSom
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
import logging
from datetime import datetime, timedelta
from collections import defaultdict
import time

logger = logging.getLogger(__name__)

# Blueprint para rotas de IA
ia_bp = Blueprint('ia', __name__, url_prefix='/api/ia')

# Rate limiting simples (5 requisições por minuto por usuário)
user_requests = defaultdict(list)
RATE_LIMIT = 5
RATE_WINDOW = 60  # segundos


def check_rate_limit(user_id):
    """Verifica se o usuário excedeu o limite de requisições"""
    now = time.time()
    # Limpar requisições antigas
    user_requests[user_id] = [req_time for req_time in user_requests[user_id] 
                               if now - req_time < RATE_WINDOW]
    
    if len(user_requests[user_id]) >= RATE_LIMIT:
        return False
    
    user_requests[user_id].append(now)
    return True


def token_required(f):
    """Decorator para verificar autenticação JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Verificar header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({"error": "Token inválido"}), 401
        
        if not token:
            return jsonify({"error": "Token não fornecido"}), 401
        
        try:
            # Decodificar token JWT
            from main import app  # Importar app para pegar SECRET_KEY
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated


@ia_bp.route('/chat', methods=['POST'])
@token_required
def chat(current_user_id):
    """
    Endpoint para chat com a IA
    
    POST /api/ia/chat
    Headers: Authorization: Bearer <token>
    Body: {
        "message": "Sua pergunta aqui"
    }
    """
    try:
        # Verificar rate limit
        if not check_rate_limit(current_user_id):
            return jsonify({
                "error": "Limite de requisições excedido. Aguarde um minuto."
            }), 429
        
        # Obter dados da requisição
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Campo 'message' é obrigatório"}), 400
        
        message = data['message']
        
        # Validar mensagem
        from ia_chat import validate_message
        is_valid, error_msg = validate_message(message)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
        
        # Buscar histórico do usuário
        from src.models import ChatHistory\nfrom main import db
        history_records = ChatHistory.query.filter_by(user_id=current_user_id)\
            .order_by(ChatHistory.created_at.desc())\
            .limit(20)\
            .all()
        
        # Converter histórico para formato esperado
        conversation_history = []
        for record in reversed(history_records):  # Ordem cronológica
            conversation_history.append({
                "role": record.role,
                "content": record.message
            })
        
        # Enviar para IA
        from ia_chat import chat_with_phi2
        result = chat_with_phi2(message, current_user_id, conversation_history)
        
        if not result['success']:
            return jsonify({"error": result['error']}), 500
        
        # Salvar no histórico
        # Mensagem do usuário
        user_msg = ChatHistory(
            user_id=current_user_id,
            role="user",
            message=message
        )
        db.session.add(user_msg)
        
        # Resposta da IA
        assistant_msg = ChatHistory(
            user_id=current_user_id,
            role="assistant",
            message=result['response']
        )
        db.session.add(assistant_msg)
        db.session.commit()
        
        logger.info(f"Chat IA: user_id={current_user_id}, tokens={result.get('tokens_used', 0)}")
        
        return jsonify({
            "success": True,
            "response": result['response'],
            "tokens_used": result.get('tokens_used', 0)
        }), 200
        
    except Exception as e:
        logger.error(f"Erro no endpoint /api/ia/chat: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500


@ia_bp.route('/history', methods=['GET'])
@token_required
def get_history(current_user_id):
    """
    Endpoint para obter histórico de conversas
    
    GET /api/ia/history
    Headers: Authorization: Bearer <token>
    """
    try:
        from src.models import ChatHistory\nfrom main import db
        
        # Buscar últimas 20 mensagens
        history = ChatHistory.query.filter_by(user_id=current_user_id)\
            .order_by(ChatHistory.created_at.desc())\
            .limit(20)\
            .all()
        
        # Converter para JSON
        messages = []
        for record in reversed(history):  # Ordem cronológica
            messages.append({
                "id": record.id,
                "role": record.role,
                "message": record.message,
                "created_at": record.created_at.isoformat()
            })
        
        return jsonify({
            "success": True,
            "history": messages
        }), 200
        
    except Exception as e:
        logger.error(f"Erro no endpoint /api/ia/history: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500


@ia_bp.route('/clear-history', methods=['DELETE'])
@token_required
def clear_history(current_user_id):
    """
    Endpoint para limpar histórico de conversas
    
    DELETE /api/ia/clear-history
    Headers: Authorization: Bearer <token>
    """
    try:
        from src.models import ChatHistory\nfrom main import db
        
        # Deletar todas as mensagens do usuário
        ChatHistory.query.filter_by(user_id=current_user_id).delete()
        db.session.commit()
        
        logger.info(f"Histórico limpo: user_id={current_user_id}")
        
        return jsonify({
            "success": True,
            "message": "Histórico limpo com sucesso"
        }), 200
        
    except Exception as e:
        logger.error(f"Erro no endpoint /api/ia/clear-history: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500
