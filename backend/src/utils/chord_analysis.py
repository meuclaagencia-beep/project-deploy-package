"""
Módulo para análise de acordes e sugestões musicais
"""
import random

# Definição de tonalidades e modos
KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
MODES = ["Major", "Minor"]

# Conjuntos de acordes por tonalidade
CHORD_SETS = {
    "C Major": ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
    "C Minor": ["Cm", "Ddim", "Eb", "Fm", "Gm", "Ab", "Bb"],
    "G Major": ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
    "G Minor": ["Gm", "Adim", "Bb", "Cm", "Dm", "Eb", "F"],
    "D Major": ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"],
    "D Minor": ["Dm", "Edim", "F", "Gm", "Am", "Bb", "C"],
    "A Major": ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"],
    "A Minor": ["Am", "Bdim", "C", "Dm", "Em", "F", "G"],
    "E Major": ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"],
    "E Minor": ["Em", "F#dim", "G", "Am", "Bm", "C", "D"],
    "F Major": ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
    "F Minor": ["Fm", "Gdim", "Ab", "Bbm", "Cm", "Db", "Eb"],
    "B Major": ["B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"],
    "B Minor": ["Bm", "C#dim", "D", "Em", "F#m", "G", "A"],
}


def estimate_key_from_audio(audio_path=None):
    """
    Estima a tonalidade do áudio.
    Por enquanto retorna uma tonalidade aleatória.
    """
    random_key = random.choice(KEYS)
    random_mode = random.choice(MODES)
    return f"{random_key} {random_mode}"


def get_chords_for_key(key):
    """
    Retorna os acordes principais para uma tonalidade.
    """
    chord_set = CHORD_SETS.get(key, CHORD_SETS["C Major"])
    return chord_set[:4]


def suggest_chord_progressions(key):
    """
    Sugere progressões de acordes baseadas na tonalidade.
    """
    progressions = []
    is_major = "Major" in key
    
    if is_major:
        progressions.append({
            "name": "Progressão Pop Clássica (I-V-vi-IV)",
            "chords": ["I", "V", "vi", "IV"],
            "description": "A progressão mais popular na música moderna. Cria um som edificante e memorável, perfeito para pop, rock e country."
        })
        progressions.append({
            "name": "Progressão Anos 50 (I-vi-IV-V)",
            "chords": ["I", "vi", "IV", "V"],
            "description": "Uma progressão vintage da era de ouro do rock and roll. Nostálgica e instantaneamente reconhecível."
        })
        progressions.append({
            "name": "Progressão Circular (I-IV-vii°-iii-vi-ii-V-I)",
            "chords": ["I", "IV", "vii°", "iii", "vi", "ii", "V", "I"],
            "description": "Uma progressão sofisticada através do círculo de quintas. Ótima para criar interesse harmônico e tensão."
        })
    else:
        progressions.append({
            "name": "Progressão Pop Menor (i-VI-III-VII)",
            "chords": ["i", "VI", "III", "VII"],
            "description": "Uma progressão sombria e emocional, comum na música pop e eletrônica moderna. Cria tensão atmosférica."
        })
        progressions.append({
            "name": "Cadência Andaluza (i-VII-VI-V)",
            "chords": ["i", "VII", "VI", "V"],
            "description": "Uma progressão descendente com caráter dramático e exótico. Popular na música espanhola e latina."
        })
        progressions.append({
            "name": "Progressão Menor Natural (i-iv-VII-III)",
            "chords": ["i", "iv", "VII", "III"],
            "description": "Uma progressão melancólica que enfatiza a escala menor natural. Ótima para baladas emocionais."
        })
    
    # Adiciona progressões universais
    progressions.append({
        "name": "Jazz II-V-I",
        "chords": ["ii7", "V7", "Imaj7"] if is_major else ["ii7♭5", "V7", "i7"],
        "description": "A fundação da harmonia jazz. Condução de vozes suave cria movimento sofisticado em direção à resolução."
    })
    
    progressions.append({
        "name": "Progressão Blues",
        "chords": ["I7", "IV7", "I7", "V7", "IV7", "I7"],
        "description": "O padrão blues de 12 compassos. Cheio de alma e groove, perfeito para adicionar um toque blues a qualquer música."
    })
    
    return progressions[:3]


def recommend_instruments(bpm, key):
    """
    Recomenda instrumentos baseados no BPM e tonalidade.
    """
    instruments = []
    
    if bpm < 100:
        instruments.append({
            "name": "Piano",
            "icon": "🎹",
            "reason": "Perfeito para tempos mais lentos, adicionando profundidade harmônica e expressão melódica às baladas",
            "tags": ["Balada", "Clássico", "Jazz"]
        })
        instruments.append({
            "name": "Violão",
            "icon": "🎸",
            "reason": "Tonalidade quente complementa o tempo mais lento para composições íntimas e sinceras",
            "tags": ["Folk", "Acústico", "Cantor-Compositor"]
        })
        instruments.append({
            "name": "Cordas",
            "icon": "🎻",
            "reason": "Adiciona profundidade emocional e qualidade cinematográfica a composições mais lentas e reflexivas",
            "tags": ["Orquestra", "Cinematográfico", "Ambiente"]
        })
        instruments.append({
            "name": "Violoncelo",
            "icon": "🎻",
            "reason": "Tons ricos e quentes fornecem uma bela base para peças mais lentas",
            "tags": ["Clássico", "Emocional", "Solo"]
        })
    elif bpm < 130:
        instruments.append({
            "name": "Guitarra Elétrica",
            "icon": "🎸",
            "reason": "Instrumento versátil que combina com a energia moderada, perfeito para rock e indie",
            "tags": ["Rock", "Pop", "Indie"]
        })
        instruments.append({
            "name": "Piano",
            "icon": "🎹",
            "reason": "Fornece base harmônica forte para músicas de tempo médio em todos os gêneros",
            "tags": ["Pop", "R&B", "Soul"]
        })
        instruments.append({
            "name": "Baixo",
            "icon": "🎸",
            "reason": "Ancora o groove e reforça a progressão de acordes com precisão rítmica",
            "tags": ["Rock", "Funk", "Pop"]
        })
        instruments.append({
            "name": "Bateria",
            "icon": "🥁",
            "reason": "Fornece a espinha dorsal rítmica essencial para esta faixa de tempo moderado",
            "tags": ["Universal", "Rock", "Pop"]
        })
    else:
        instruments.append({
            "name": "Bateria",
            "icon": "🥁",
            "reason": "Essencial para impulsionar a energia neste tempo acelerado, criando momentum rítmico poderoso",
            "tags": ["Rock", "Eletrônico", "Pop"]
        })
        instruments.append({
            "name": "Sintetizador",
            "icon": "🎹",
            "reason": "Paleta sonora moderna perfeita para faixas eletrônicas e de dança de alta energia",
            "tags": ["EDM", "Pop", "Eletrônico"]
        })
        instruments.append({
            "name": "Baixo Elétrico",
            "icon": "🎸",
            "reason": "Fornece base poderosa de graves que impulsiona composições energéticas para frente",
            "tags": ["Dance", "Eletrônico", "Rock"]
        })
        instruments.append({
            "name": "Guitarra Elétrica",
            "icon": "🎸",
            "reason": "Adiciona energia e power chords perfeitos para estilos mais rápidos e agressivos",
            "tags": ["Rock", "Metal", "Punk"]
        })
    
    return instruments[:4]


def analyze_chords_and_suggestions(bpm, audio_path=None):
    """
    Função principal que analisa o áudio e retorna acordes e sugestões.
    """
    # Estima a tonalidade
    key = estimate_key_from_audio(audio_path)
    
    # Obtém os acordes principais
    chords = get_chords_for_key(key)
    
    # Gera sugestões de progressões
    chord_progressions = suggest_chord_progressions(key)
    
    # Recomenda instrumentos
    instruments = recommend_instruments(bpm, key)
    
    return {
        "key": key,
        "chords": chords,
        "suggestions": {
            "chordProgressions": chord_progressions,
            "instruments": instruments
        }
    }
