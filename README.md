# RegistraSom - Sistema de Análise e Transcrição de Áudio

Sistema completo para análise técnica de áudio, transcrição automática e reconhecimento musical, desenvolvido com Flask (backend) e React (frontend), containerizado com Docker.

## Funcionalidades Principais

O **RegistraSom** oferece uma plataforma completa para análise profissional de áudio, incluindo detecção automática de BPM (batidas por minuto), identificação de tonalidade musical, análise de LUFS (loudness), transcrição de áudio utilizando modelos de IA avançados (Whisper e Gemini), análise de progressões de acordes, reconhecimento de músicas via Shazam, e geração de relatórios em PDF com todos os dados coletados.

## Arquitetura do Sistema

O projeto utiliza uma arquitetura moderna de microsserviços containerizados. O **backend** é construído com Flask e Python 3.11, responsável por toda a lógica de processamento de áudio, análise com bibliotecas especializadas como librosa e pyloudnorm, transcrição via Whisper local e Google Gemini, autenticação JWT, e persistência de dados em SQLite. O **frontend** é desenvolvido em React 19 com Vite como bundler, oferecendo uma interface moderna e responsiva construída com Radix UI e Tailwind CSS. O **Nginx** atua como reverse proxy, servindo os arquivos estáticos do frontend e redirecionando requisições da API para o backend. Todo o sistema é orquestrado via **Docker Compose**, garantindo isolamento, portabilidade e facilidade de deploy.

## Tecnologias Utilizadas

### Backend
- **Flask 3.1.2**: Framework web minimalista e eficiente para Python
- **SQLAlchemy 2.0.43**: ORM para gerenciamento do banco de dados SQLite
- **Gunicorn 23.0.0**: Servidor WSGI de produção com suporte a múltiplos workers
- **librosa 0.11.0**: Biblioteca especializada em análise de áudio e música
- **openai-whisper**: Modelo de transcrição de áudio de alta precisão
- **PyTorch 2.5.1**: Framework de deep learning para execução do Whisper
- **google-genai 1.0.0**: SDK para integração com Gemini API
- **shazamio 0.6.0**: Biblioteca para reconhecimento de músicas
- **PyJWT 2.10.1**: Implementação de autenticação via JSON Web Tokens

### Frontend
- **React 19.1.0**: Biblioteca JavaScript para construção de interfaces
- **Vite 6.3.5**: Build tool moderna e extremamente rápida
- **Radix UI**: Componentes acessíveis e sem estilo pré-definido
- **Tailwind CSS 4.1.7**: Framework CSS utility-first
- **React Router DOM 7.6.1**: Roteamento client-side
- **Axios 1.12.2**: Cliente HTTP para requisições à API
- **Recharts 2.15.3**: Biblioteca de gráficos para visualização de dados

### Infraestrutura
- **Docker & Docker Compose**: Containerização e orquestração
- **Nginx Alpine**: Servidor web leve para servir frontend e proxy reverso
- **Ubuntu/Debian**: Sistema operacional recomendado para deploy

## Requisitos do Servidor

Para executar o RegistraSom em produção, recomenda-se um servidor com pelo menos **2 CPU cores**, **4GB de RAM** (mínimo 2GB), **20GB de espaço em disco**, e sistema operacional **Ubuntu 20.04+** ou **Debian 11+**. É necessário ter **Docker 20.10+** e **Docker Compose 2.0+** instalados. Para funcionalidades de IA, são necessárias chaves de API do **Google Gemini** e/ou **OpenAI**.

## Instalação Rápida

### Método 1: Script Automatizado (Recomendado)

Clone o repositório ou extraia o arquivo ZIP em seu servidor. Acesse o diretório do projeto e execute o script de instalação como root:

```bash
sudo ./install.sh
```

O script realizará automaticamente a instalação do Docker, Docker Compose, criação de diretórios, build das imagens e inicialização dos containers.

### Método 2: Instalação Manual

Primeiro, instale o Docker e Docker Compose seguindo a documentação oficial. Em seguida, configure as variáveis de ambiente copiando o arquivo de exemplo:

```bash
cp .env.example .env
nano .env  # Edite e configure suas API keys
```

Crie os diretórios necessários:

```bash
mkdir -p backend/uploads backend/instance
chmod 755 backend/uploads backend/instance
```

Execute o build e inicie os containers:

```bash
docker compose build
docker compose up -d
```

Verifique o status dos containers:

```bash
docker compose ps
```

## Configuração de Variáveis de Ambiente

Edite o arquivo `.env` e configure as seguintes variáveis essenciais:

- **SECRET_KEY**: Chave secreta para JWT (altere em produção para uma string aleatória segura)
- **GEMINI_API_KEY**: Chave de API do Google Gemini para transcrição
- **OPENAI_API_KEY**: Chave de API da OpenAI (opcional, para futuras integrações)
- **DATABASE_URL**: URL do banco de dados (padrão: SQLite local)
- **FLASK_ENV**: Ambiente de execução (production recomendado)

## Estrutura de Diretórios

```
project-deploy-package/
├── backend/
│   ├── src/
│   │   ├── utils/
│   │   │   ├── audio_analysis.py
│   │   │   ├── transcription.py
│   │   │   ├── chord_analysis.py
│   │   │   ├── pdf_generator.py
│   │   │   └── shazam_recognition.py
│   │   └── main.py
│   ├── instance/
│   ├── uploads/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── install.sh
├── .env.example
├── .gitignore
└── README.md
```

## Uso da Aplicação

Após a instalação, acesse a interface web em `http://seu-servidor` ou `http://localhost` se estiver rodando localmente. Crie uma conta de usuário através da página de registro. Faça login com suas credenciais. No dashboard, você pode fazer upload de arquivos de áudio (MP3, WAV, MP4, WebM), visualizar análises técnicas (BPM, tonalidade, LUFS), solicitar transcrições automáticas, analisar progressões de acordes, e exportar relatórios em PDF.

## API Endpoints

O backend expõe os seguintes endpoints principais:

- **POST /api/register**: Cadastro de novo usuário
- **POST /api/login**: Autenticação e obtenção de token JWT
- **GET /api/profile**: Obter perfil do usuário autenticado
- **POST /api/upload**: Upload de arquivo de áudio
- **GET /api/audios**: Listar áudios do usuário
- **POST /api/transcribe/{audio_id}**: Solicitar transcrição de áudio
- **POST /api/analyze-chords/{audio_id}**: Analisar acordes e progressões
- **GET /api/health**: Health check do serviço

Todos os endpoints (exceto `/register`, `/login` e `/health`) requerem autenticação via header `Authorization: Bearer <token>`.

## Comandos Úteis

Para visualizar logs em tempo real:
```bash
docker compose logs -f
```

Para parar os containers:
```bash
docker compose down
```

Para reiniciar os serviços:
```bash
docker compose restart
```

Para reconstruir as imagens após alterações:
```bash
docker compose up -d --build
```

Para acessar o shell do container backend:
```bash
docker compose exec backend bash
```

Para fazer backup do banco de dados:
```bash
docker compose exec backend cp /app/instance/registrasom.db /app/instance/registrasom.db.backup
```

## Troubleshooting

### Container backend não inicia

Verifique os logs do backend com `docker compose logs backend`. Certifique-se de que as API keys estão configuradas corretamente no arquivo `.env`. Verifique se há espaço em disco suficiente com `df -h`.

### Erro de memória (OOM)

O backend está configurado para usar até 2GB de RAM. Se necessário, ajuste os limites no arquivo `docker-compose.yml` na seção `deploy.resources`. Considere aumentar a memória do servidor ou reduzir o número de workers do Gunicorn.

### Transcrição falha

Verifique se a `GEMINI_API_KEY` está configurada e válida. Certifique-se de que o arquivo de áudio está em formato suportado (MP3, WAV, MP4, WebM). Verifique os logs para mensagens de erro específicas.

### Frontend não carrega

Verifique se o container frontend está rodando com `docker compose ps`. Acesse `http://localhost/api/health` para verificar se o backend está respondendo. Limpe o cache do navegador e tente novamente.

## Segurança

Para ambientes de produção, é essencial alterar a `SECRET_KEY` para uma string aleatória forte. Configure HTTPS utilizando certificados SSL (Let's Encrypt recomendado). Mantenha as API keys em segredo e nunca as commite no Git. Implemente rate limiting no Nginx para prevenir abuso. Mantenha o Docker e as dependências sempre atualizadas. Configure firewall para expor apenas as portas necessárias (80, 443).

## Deploy em Produção

Para deploy em produção, utilize um domínio próprio e configure DNS apontando para o IP do servidor. Configure certificados SSL com Certbot:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

Ajuste o `nginx.conf` para incluir configurações SSL. Configure backups automáticos do banco de dados e uploads. Implemente monitoramento com ferramentas como Prometheus e Grafana. Configure logs centralizados para análise e debugging.

## Contribuindo

Contribuições são bem-vindas! Faça um fork do projeto, crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`), commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`), push para a branch (`git push origin feature/nova-funcionalidade`), e abra um Pull Request.

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo LICENSE para mais detalhes.

## Suporte

Para reportar bugs ou solicitar funcionalidades, abra uma issue no repositório GitHub. Para dúvidas e discussões, utilize a seção Discussions do GitHub.

---

**Desenvolvido com ❤️ pela equipe RegistraSom**
