# 🏗️ Arquitetura do Sistema - TCC Fitness App

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura Geral](#-arquitetura-geral)
- [Frontend Architecture](#-frontend-architecture)
- [Backend Architecture](#-backend-architecture)
- [Modelo de Dados](#-modelo-de-dados)
- [Integração com IA](#-integração-com-ia)
- [Fluxos Principais](#-fluxos-principais)
- [Diagramas](#-diagramas)

---

## 🎯 Visão Geral

O sistema TCC Fitness App é composto por três camadas principais:

1. **Frontend (Mobile)** - React Native + Expo
2. **Backend (API REST)** - Python + FastAPI
3. **Inteligência Artificial** - OpenAI GPT-4o Mini (fine-tuned)

A comunicação entre frontend e backend ocorre via **HTTP REST**, utilizando **JSON** para serialização de dados. A autenticação é baseada em **JWT (JSON Web Tokens)**.

---

## 🏛️ Arquitetura Geral

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    DISPOSITIVO MÓVEL                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Frontend (React Native + Expo)               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │   Views    │  │ ViewModels │  │  Services    │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS/REST
                             │ JSON
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR BACKEND                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Backend (Python + FastAPI)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │  Routers   │  │ Use Cases  │  │ GPT Service  │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐         ┌──────────────┐
        │   MySQL DB   │         │  OpenAI API  │
        │   (Dados)    │         │  (GPT-4o)    │
        └──────────────┘         └──────────────┘
```

---

## 📱 Frontend Architecture

### Clean Architecture + MVVM

O frontend segue os princípios de **Clean Architecture** combinados com o padrão **MVVM**:

```
src/
├── presentation/          # 🎨 Camada de Apresentação (MVVM)
│   ├── auth/             # Telas de autenticação
│   ├── workout/          # Telas de treino
│   ├── diet/             # Telas de dieta
│   ├── home/             # Tela principal
│   ├── profile/          # Tela de perfil
│   ├── viewmodels/       # ViewModels (lógica de apresentação)
│   └── components/       # Componentes reutilizáveis
│
├── domain/               # 🏛️ Camada de Domínio (Clean Architecture)
│   ├── entities/         # Entidades de negócio (Usuario, WorkoutPlan, etc.)
│   ├── repositories/     # Interfaces de repositórios
│   └── usecases/         # Casos de uso (LoginUseCase, RegisterUseCase)
│
├── infra/                # 🔧 Camada de Infraestrutura
│   ├── apiConfig.ts      # Configuração da API
│   ├── secureStore.ts    # Armazenamento seguro (Expo SecureStore)
│   ├── userService.ts    # Serviço de usuário
│   └── workoutPlanStorage.ts  # Armazenamento de planos
│
└── services/             # 🌐 Serviços Externos
    ├── workoutPlanService.ts   # Chamadas HTTP para treinos
    ├── dietPlanService.ts      # Chamadas HTTP para dietas
    └── workoutHistoryService.ts # Histórico de treinos
```

### Padrão MVVM

**Views (Telas React Native)**
- Componentes funcionais React
- Apenas renderização e interação do usuário
- Não contêm lógica de negócio

**ViewModels**
- Gerenciam estado da tela
- Processam ações do usuário
- Chamam Use Cases ou Services
- Atualizam a View

**Models (Entities)**
- Representam dados de negócio
- Sem lógica de apresentação
- Reutilizáveis entre camadas

### Fluxo de Dados no Frontend

```
Usuario interage com View
    ↓
View chama ViewModel
    ↓
ViewModel chama UseCase ou Service
    ↓
Service faz requisição HTTP para Backend
    ↓
Resposta retorna e propaga pela hierarquia
    ↓
View é atualizada com novos dados
```

---

## 🌐 Backend Architecture

### Estrutura em Camadas

```
backend-tcc-fitness/
├── main.py                    # 🚀 Ponto de entrada da aplicação
│
├── src/
│   ├── core/                  # ⚙️ Configurações Core
│   │   ├── config.py          # Variáveis de ambiente
│   │   ├── database.py        # Conexão com MySQL
│   │   └── init_db.py         # Inicialização do banco
│   │
│   └── routers/               # 🛣️ Camada de API
│       ├── router.py          # Router principal
│       │
│       ├── apis/              # Endpoints organizados por domínio
│       │   ├── usuario/       # Autenticação e usuários
│       │   │   └── cadastro.py
│       │   ├── treino/        # Treinos e execuções
│       │   │   ├── listagem.py
│       │   │   └── treino_usuario.py
│       │   ├── dieta/         # Planos de dieta
│       │   │   └── dieta.py
│       │   └── gpt/           # Integração com IA
│       │       ├── funcs_gpt.py
│       │       ├── gpt.py     # Geração de treinos
│       │       └── gpt_dieta.py  # Geração de dietas
│       │
│       └── models/            # 📋 Modelos de Dados
│           ├── anamnesemodel.py    # Modelos de anamnese
│           ├── usuario_model.py    # Modelos de usuário
│           └── consultas.py        # Funções de consulta DB
```

### Fluxo de Requisição no Backend

```
Requisição HTTP chega ao FastAPI
    ↓
Router roteia para endpoint específico
    ↓
Endpoint valida dados (Pydantic Models)
    ↓
Lógica de negócio processa requisição
    ↓
Integração com MySQL (SQLAlchemy)
    ↓
Integração com OpenAI (quando necessário)
    ↓
Resposta JSON é retornada
```

### Endpoints Principais

#### Autenticação
- `POST /cadastro` - Cadastrar novo usuário
- `POST /login` - Autenticar usuário

#### Treinos
- `POST /gpt` - Gerar plano de treino (via IA)
- `POST /gpt/ajustar` - Ajustar plano de treino (via IA)
- `POST /gpt/confirm` - Confirmar e persistir plano
- `GET /programas` - Listar programas do usuário
- `GET /treinos-programa/{id}` - Listar treinos de um programa
- `POST /sessoes` - Registrar execução de treino

#### Dietas
- `POST /gpt/dieta` - Gerar plano de dieta (via IA)
- `POST /gpt/dieta/ajustar` - Ajustar plano de dieta (via IA)
- `POST /gpt/dieta/confirm` - Confirmar e persistir plano
- `GET /dietas_usuario/{id}` - Listar dietas do usuário

---

## 💾 Modelo de Dados

### Entidades Principais

#### Usuario
- `id` (PK)
- `nome`
- `email` (único)
- `username` (único)
- `senha` (hash bcrypt)

#### ProgramaTreino
- `id_programa_treino` (PK)
- `id_usuario` (FK)
- `nome_programa`
- `descricao`

#### Treino
- `id_treino` (PK)
- `id_programa_treino` (FK)
- `id_usuario` (FK)
- `nome`
- `duracao`
- `dificuldade`

#### ExercicioTreino
- `id_exercicio_treino` (PK)
- `id_treino` (FK)
- `nome_exercicio`
- `equipamento`
- `grupo_muscular`
- `series`
- `repeticoes`
- `descanso_segundos`

#### SessaoTreino
- `id_sessao` (PK)
- `id_treino` (FK)
- `id_usuario` (FK)
- `data_execucao`
- `duracao_total`

#### Serie
- `id_serie` (PK)
- `id_exercicio_treino` (FK)
- `id_sessao` (FK)
- `peso`
- `repeticoes`
- `tipo` (concluída/extra)

#### PlanoDieta
- `id_plano_dieta` (PK)
- `id_usuario` (FK)
- `nome`
- `descricao`

#### Refeicao
- `id_refeicao` (PK)
- `id_plano_dieta` (FK)
- `tipo_refeicao` (Café da manhã, Almoço, etc.)
- `calorias`
- `alimentos` (string formatada)

---

## 🤖 Integração com IA

### Fluxo de Geração de Planos

```
1. Frontend envia anamnese
    ↓
2. Backend constrói prompt estruturado
    ↓
3. Backend chama OpenAI API (GPT-4o Mini fine-tuned)
    ↓
4. IA retorna JSON estruturado
    ↓
5. Backend valida e normaliza resposta
    ↓
6. Backend retorna plano para Frontend
    ↓
7. Frontend exibe plano (usuário pode aceitar/ajustar/recusar)
```

### Prompt Engineering

O sistema utiliza **Prompt Engineering** estruturado com:

1. **Role Definition** - Define o papel da IA
2. **Regras Críticas de Formato** - Formato JSON obrigatório
3. **Esquema JSON** - Estrutura exata esperada
4. **Regras Fundamentais** - Regras de domínio (treino/dieta)
5. **Processo de Geração** - Chain of Thought (passo a passo)
6. **Anamnese** - Dados do usuário inseridos dinamicamente

**📖 Para mais detalhes:** Consulte `TEMPLATES_PROMPTS_COMPLETOS.txt`

### Fine-tuning

- **Modelo Base:** GPT-4o Mini
- **Método:** Fine-tuning supervisionado
- **Dataset:** Anamneses + Planos validados
- **Objetivo:** Melhorar consistência e qualidade dos planos gerados

---

## 🔄 Fluxos Principais

### 1. Autenticação

```
Usuario preenche login
    ↓
Frontend valida campos
    ↓
Frontend envia POST /login
    ↓
Backend valida credenciais (MySQL + bcrypt)
    ↓
Backend gera JWT token
    ↓
Backend retorna token
    ↓
Frontend salva token (SecureStore)
    ↓
Frontend navega para Home
```

### 2. Geração de Plano de Treino

```
Usuario preenche anamnese
    ↓
Frontend valida dados
    ↓
Frontend envia POST /gpt (anamnese)
    ↓
Backend constrói prompt
    ↓
Backend chama OpenAI API
    ↓
IA retorna plano JSON
    ↓
Backend valida JSON
    ↓
Backend retorna plano (NÃO persiste ainda)
    ↓
Frontend exibe plano
    ↓
Usuario pode: Aceitar | Ajustar | Recusar
```

### 3. Ajuste de Plano

```
Usuario solicita ajustes (texto livre)
    ↓
Frontend envia POST /gpt/ajustar (plano + ajustes)
    ↓
Backend constrói prompt de ajuste
    ↓
Backend chama OpenAI API
    ↓
IA retorna plano revisado
    ↓
Backend retorna plano revisado (NÃO persiste ainda)
    ↓
Frontend exibe plano revisado
```

### 4. Confirmação e Persistência

```
Usuario aceita plano
    ↓
Frontend envia POST /gpt/confirm (plano completo)
    ↓
Backend persiste no MySQL
    ↓
Backend associa ao usuário
    ↓
Backend retorna confirmação
    ↓
Frontend atualiza lista de planos
```

### 5. Execução de Treino

```
Usuario inicia treino
    ↓
Frontend exibe exercícios
    ↓
Usuario registra séries (peso, reps)
    ↓
Frontend envia POST /sessoes (sessão + séries)
    ↓
Backend persiste sessão e séries
    ↓
Backend retorna confirmação
    ↓
Frontend exibe resumo
```

---

## 📊 Diagramas

### Diagramas ICONIX
Localizados em: `diagrams/ICONIX/`

1. **Modelo de Domínio** - Entidades e relacionamentos
2. **Casos de Uso** - Funcionalidades do sistema
3. **Diagramas de Robustez** - Fluxos conceituais (Login, Treinos, Dietas)
4. **Diagramas de Sequência** - Interações detalhadas
5. **Diagrama de Classes** - Estrutura das classes

### Vistas Arquiteturais 4+1 (Kruchten)
Localizadas em: `diagrams/4+1/`

1. **Vista Lógica** - Componentes e suas responsabilidades
2. **Vista de Processo** - Fluxos e interações entre componentes
3. **Vista de Desenvolvimento** - Organização do código
4. **Vista Física** - Deploy e infraestrutura
5. **Vista de Cenários** - Casos de uso principais

### Diagramas de Prompt Engineering
Localizados em: `diagrams/Prompt Engineering/`

1. **Estrutura do Prompt** - Componentes do prompt
2. **Fluxo de Construção** - Como o prompt é montado

**📖 Para visualizar os diagramas:**
- PlantUML: Use extensão VS Code ou site online
- Arquivos: `.puml` em `diagrams/`

---

## 🔒 Segurança

### Frontend
- ✅ Tokens JWT armazenados em Expo SecureStore (criptografado)
- ✅ Validação de entrada em formulários
- ✅ Sanitização de dados antes de envio

### Backend
- ✅ Senhas hashadas com bcrypt
- ✅ JWT com expiração (1 hora)
- ✅ Validação de dados com Pydantic
- ✅ CORS configurado
- ✅ SQL Injection prevention (SQLAlchemy ORM)

---

## 📚 Referências

### Documentação Externa
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [OpenAI API](https://platform.openai.com/docs)

### Documentação Interna
- `README.md` - Guia principal do projeto
- `CONTRIBUTORS.md` - Participantes
- `tcc-app-fitness/README.md` - Frontend específico
- `backend-tcc-fitness/README.md` - Backend específico
- `diagrams/README.md` - Documentação dos diagramas

---

**Última atualização:** [Data]

