# 🏋️ TCC Fitness App - Sistema de Gestão de Treinos e Nutrição com IA

**Projeto de Trabalho de Conclusão de Curso**  
**Curso:** Ciência da Computação - PUC-SP  
**Desenvolvedores:** João Marcos Ribeirete Garbelini, Gabriel Souza de Carvalho, Jefferson da Silva de Souza

Sistema completo de gestão de treinos e planos nutricionais personalizados utilizando Inteligência Artificial (GPT-4o Mini fine-tuned) para geração de planos personalizados baseados em anamnese do usuário.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Como Executar](#-como-executar)
- [Documentação](#-documentação)
- [Participantes](#-participantes)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O TCC Fitness App é uma aplicação mobile desenvolvida para auxiliar usuários na criação e gestão de planos de treino e dieta personalizados. O sistema utiliza inteligência artificial (modelo GPT-4o Mini com fine-tuning) para gerar planos completamente adaptados às necessidades, restrições e objetivos de cada usuário.

### Características Principais:

- ✅ **Geração Inteligente de Planos**: Utiliza IA para criar treinos e dietas personalizados
- ✅ **Ajustes Interativos**: Permite que o usuário solicite ajustes nos planos gerados via texto livre
- ✅ **Acompanhamento de Execução**: Registro completo de séries, repetições e carga durante treinos
- ✅ **Histórico Completo**: Visualização de planos anteriores e sessões executadas
- ✅ **Autenticação Segura**: Sistema de login/registro com JWT e bcrypt
- ✅ **Isolamento de Dados**: Cada usuário possui seus próprios dados isolados

---

## ✨ Funcionalidades

### Autenticação
- ✅ Login com email/senha
- ✅ Cadastro de novos usuários
- ✅ Validação de credenciais com JWT
- ✅ Armazenamento seguro de tokens (Expo SecureStore)

### Treinos
- ✅ Geração de planos de treino personalizados via IA
- ✅ Visualização e análise de planos gerados
- ✅ Solicitação de ajustes nos planos (texto livre)
- ✅ Aceitar/Recusar planos gerados
- ✅ Execução de treinos com registro de séries
- ✅ Histórico completo de treinos executados
- ✅ Visualização de estatísticas e progresso

### Dietas
- ✅ Geração de planos nutricionais personalizados via IA
- ✅ Visualização de planos de dieta
- ✅ Solicitação de ajustes considerando preferências e alergias
- ✅ Aceitar/Recusar planos de dieta
- ✅ Visualização de refeições organizadas cronologicamente

---

## 🛠️ Tecnologias

### Frontend
- **React Native** + **Expo** - Framework mobile multiplataforma
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação entre telas
- **Expo SecureStore** - Armazenamento seguro de dados sensíveis

### Backend
- **Python 3.13** - Linguagem de programação
- **FastAPI** - Framework web assíncrono
- **MySQL** - Banco de dados relacional
- **SQLAlchemy** - ORM para Python
- **uv** - Gerenciador de dependências Python

### Inteligência Artificial
- **OpenAI GPT-4o Mini** - Modelo base
- **Fine-tuning supervisionado** - Treinamento personalizado
- **Prompt Engineering** - Construção estruturada de prompts

### Autenticação e Segurança
- **JWT (JSON Web Tokens)** - Autenticação stateless
- **bcrypt** - Hash seguro de senhas
- **CORS** - Controle de acesso cross-origin

### Arquitetura
- **Clean Architecture** - Separação de responsabilidades
- **MVVM Pattern** - Padrão de arquitetura de apresentação
- **Repository Pattern** - Abstração de acesso a dados

---

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** combinados com o padrão **MVVM** no frontend.

### Frontend (React Native)
```
📱 Presentation Layer (MVVM)
   ├── Views (Telas React Native)
   ├── ViewModels (Lógica de apresentação)
   └── Components (Componentes reutilizáveis)

🏛️ Domain Layer
   ├── Entities (Entidades de negócio)
   ├── Use Cases (Casos de uso)
   └── Repositories (Interfaces)

🔧 Infrastructure Layer
   ├── HTTP Repositories (Implementações)
   ├── SecureStore (Armazenamento local)
   └── Services (Serviços externos)
```

### Backend (FastAPI)
```
🌐 API Layer (FastAPI)
   ├── Routers (Endpoints REST)
   ├── Models (Modelos Pydantic)
   └── Middleware (CORS, Auth)

💼 Business Logic Layer
   ├── Use Cases (Lógica de negócio)
   ├── Services (Serviços especializados)
   └── GPT Integration (IA)

💾 Data Layer
   ├── Database (MySQL)
   ├── SQLAlchemy ORM
   └── Query Builders
```

📖 **Para mais detalhes sobre arquitetura, consulte:** [`README_ARCHITECTURE.md`](README_ARCHITECTURE.md)

---

## 📂 Estrutura do Repositório

```
TCC/
├── README.md                          # Este arquivo
├── README_ARCHITECTURE.md             # Documentação arquitetural detalhada
├── CONTRIBUTORS.md                    # Participantes do projeto
├── .gitignore                         # Arquivos ignorados pelo Git
│
├── tcc-app-fitness/                   # Frontend (React Native + Expo)
│   ├── src/
│   │   ├── domain/                    # Camada de domínio (Clean Architecture)
│   │   ├── presentation/              # Telas, ViewModels, componentes
│   │   ├── infra/                     # Infraestrutura (HTTP, Storage)
│   │   └── services/                  # Serviços (API calls)
│   ├── assets/                        # Imagens e recursos visuais
│   ├── package.json
│   └── README.md
│
├── backend-tcc-fitness/               # Backend (Python + FastAPI)
│   ├── src/
│   │   ├── core/                      # Configurações core (DB, init)
│   │   └── routers/                   # Routers e APIs
│   │       ├── apis/                  # Endpoints organizados
│   │       └── models/                # Modelos Pydantic
│   ├── main.py                        # Aplicação FastAPI principal
│   ├── pyproject.toml                 # Dependências Python (uv)
│   ├── .env.example                   # Exemplo de variáveis de ambiente
│   └── README.md
│
└── diagrams/                          # Diagramas do projeto
    ├── ICONIX/                        # Diagramas ICONIX (Modelo de Domínio, Casos de Uso, etc.)
    ├── 4+1/                           # Vistas Arquiteturais 4+1 (Kruchten)
    ├── Prompt Engineering/            # Diagramas de estrutura de prompts
    └── README.md                      # Documentação dos diagramas
```

---

## 📋 Pré-requisitos

### Para o Frontend
- **Node.js** 18+ e **npm**
- **Expo CLI** (instalado globalmente ou via npx)
- **Expo Go** app instalado no dispositivo móvel (Android/iOS)
  - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

### Para o Backend
- **Python** 3.11 ou superior (recomendado 3.13)
- **uv** (gerenciador de pacotes Python)
  - Instalação: https://docs.astral.sh/uv/
- **MySQL** instalado e rodando
- **Chave da API OpenAI** (para geração de planos via IA)

---

## 🚀 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd TCC
```

### 2. Configuração do Backend

#### 2.1. Instalar o uv (Gerenciador de Pacotes Python)

**Windows (PowerShell):**
```powershell
irm https://astral.sh/uv/install.ps1 | iex
```

**Linux / macOS:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Verificar instalação:**
```bash
uv --version
```

#### 2.2. Configurar Banco de Dados MySQL

Certifique-se de que o MySQL está instalado e rodando:

```bash
# Windows
net start MySQL

# Linux
sudo systemctl start mysql

# macOS
brew services start mysql
```

#### 2.3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend-tcc-fitness/`:

```bash
cd backend-tcc-fitness
cp .env.example .env  # Se existir
```

Edite o arquivo `.env` com suas configurações:

```env
# Banco de Dados MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=tcc
MYSQL_USER=seu_usuario
MYSQL_PASSWORD=sua_senha

# Autenticação JWT
SECRET_KEY=sua_chave_secreta_jwt_aqui_gerar_uma_chave_aleatoria
ALGORITHM=HS256

# OpenAI API
OPENAI_API_KEY=sua_chave_api_openai_aqui
```

**⚠️ IMPORTANTE:** 
- Não commite o arquivo `.env` no Git (já está no `.gitignore`)
- Gere uma `SECRET_KEY` segura (pode usar: `openssl rand -hex 32`)

#### 2.4. Instalar Dependências do Backend

```bash
cd backend-tcc-fitness
uv sync
```

Este comando criará automaticamente o ambiente virtual e instalará todas as dependências.

### 3. Configuração do Frontend

#### 3.1. Instalar Dependências

```bash
cd tcc-app-fitness
npm install
```

#### 3.2. Configurar URL da API

Edite o arquivo `tcc-app-fitness/src/infra/apiConfig.ts`:

```typescript
// Para dispositivo físico (usar IP da sua máquina na rede local)
export const API_BASE_URL = 'http://192.168.0.2:8000';

// Para emulador Android
// export const API_BASE_URL = 'http://10.0.2.2:8000';

// Para iOS Simulator
// export const API_BASE_URL = 'http://localhost:8000';
```

**Dica:** Para descobrir o IP da sua máquina:
- **Windows:** `ipconfig` (busque por IPv4)
- **Linux/macOS:** `ifconfig` ou `ip addr`

---

## ▶️ Como Executar

### 1. Iniciar o Backend

Abra um terminal na pasta `backend-tcc-fitness/`:

```bash
cd backend-tcc-fitness
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

O servidor será iniciado em: **http://127.0.0.1:8000**

**Documentação automática da API:**
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

### 2. Iniciar o Frontend

Abra outro terminal na pasta `tcc-app-fitness/`:

```bash
cd tcc-app-fitness
npm start
```

Isso abrirá o Expo DevTools. Escaneie o QR Code com:
- **Android:** Expo Go app (câmera ou dentro do app)
- **iOS:** Câmera nativa do iPhone

**Alternativas de execução:**
```bash
# Executar diretamente no Android
npm run android

# Executar diretamente no iOS (apenas macOS)
npm run ios

# Executar no navegador (web)
npm run web
```

### 3. Verificar Conexão

1. ✅ Backend rodando em `http://127.0.0.1:8000`
2. ✅ Frontend rodando e conectado à API
3. ✅ Dispositivo/Emulador conectado à mesma rede

---

## 📚 Documentação

### Documentação Principal
- **[README_ARCHITECTURE.md](README_ARCHITECTURE.md)** - Documentação completa da arquitetura do sistema
- **[CONTRIBUTORS.md](CONTRIBUTORS.md)** - Participantes e colaboradores

### Documentação do Frontend
- `tcc-app-fitness/README.md` - Guia específico do frontend
- `tcc-app-fitness/ARCHITECTURE.md` - Arquitetura MVVM detalhada
- `tcc-app-fitness/BACKEND_INTEGRATION_GUIDE.md` - Guia de integração com backend
- `tcc-app-fitness/API_EXAMPLES.md` - Exemplos de chamadas de API

### Documentação do Backend
- `backend-tcc-fitness/README.md` - Guia específico do backend
- API Swagger: http://127.0.0.1:8000/docs (quando backend estiver rodando)

### Diagramas
- `diagrams/README.md` - Documentação dos diagramas do projeto
- Diagramas ICONIX (Modelo de Domínio, Casos de Uso, Robustez, Sequência, Classes)
- Vistas Arquiteturais 4+1 (Kruchten)
- Diagramas de Prompt Engineering

---

## 👥 Participantes

**Desenvolvedores**
- **João Marcos Ribeirete Garbelini** - Desenvolvimento completo (Frontend, Backend, Integração IA)
- **Gabriel Souza de Carvalho** - Desenvolvimento Backend
- **Jefferson da Silva de Souza** - Desenvolvimento Backend

**Orientador:**
- [Carlos Eduardo] - PUC-SP

📖 **Para mais detalhes, consulte:** [`CONTRIBUTORS.md`](CONTRIBUTORS.md)

---

## 🔐 Segurança

- ✅ Senhas hashadas com **bcrypt**
- ✅ Tokens JWT com expiração configurável
- ✅ Armazenamento seguro de tokens no frontend (Expo SecureStore)
- ✅ Validação de entrada em todos os endpoints
- ✅ CORS configurado para segurança cross-origin
- ⚠️ **NUNCA** commite arquivos `.env` com credenciais reais

---

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se o MySQL está rodando
- Verifique se as variáveis de ambiente no `.env` estão corretas
- Verifique se a porta 8000 está disponível

### Frontend não conecta ao backend
- Verifique se o backend está rodando (`http://127.0.0.1:8000`)
- Verifique o `API_BASE_URL` no arquivo `apiConfig.ts`
- Verifique se dispositivo/emulador está na mesma rede que o backend
- Para Android emulador, use `http://10.0.2.2:8000`

### Erro ao instalar dependências
- **Frontend:** Delete `node_modules` e `package-lock.json`, depois `npm install`
- **Backend:** Execute `uv sync` novamente

---

## 📝 Licença

Este projeto é desenvolvido como Trabalho de Conclusão de Curso (TCC) em Ciência da Computação na PUC-SP.

**Uso acadêmico apenas.**

---

## 📞 Contato

**João Marcos Ribeirete Garbelini**  
📧 Email: [jmribeirete@hotmail.com]  
🎓 Curso: Ciência da Computação - PUC-SP  
📅 Ano: 2025

---

## 🙏 Agradecimentos

- PUC-SP pelo suporte acadêmico
- OpenAI pela disponibilização da API GPT
- Comunidade Expo/React Native pela excelente documentação

---

**Desenvolvido com ❤️ para o TCC**

