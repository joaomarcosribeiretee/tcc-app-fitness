# 🐍 Estrutura do Backend Python - TCC Fitness App

## 📂 Estrutura de Pastas Recomendada

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # ← Arquivo principal (FastAPI/Flask)
│   │
│   ├── routers/                   # ← ROTAS AQUI
│   │   ├── __init__.py
│   │   ├── auth.py               # ← Login e Cadastro
│   │   ├── workouts.py            # ← Planos de treino
│   │   ├── exercises.py           # ← Exercícios
│   │   ├── quick_workouts.py      # ← Treino rápido
│   │   └── history.py             # ← Histórico
│   │
│   ├── models/                    # ← Models do banco (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── user.py               # ← Model de Usuário
│   │   ├── workout.py            # ← Models de Treino
│   │   └── exercise.py           # ← Model de Exercício
│   │
│   ├── schemas/                   # ← Pydantic schemas (validação)
│   │   ├── __init__.py
│   │   ├── auth.py               # ← Login/Register schemas
│   │   ├── workout.py            # ← Workout schemas
│   │   └── user.py               # ← User schemas
│   │
│   ├── services/                  # ← Lógica de negócio
│   │   ├── __init__.py
│   │   ├── auth_service.py       # ← Lógica de autenticação
│   │   ├── workout_service.py    # ← Lógica de treinos
│   │   └── ai_service.py         # ← Integração com IA
│   │
│   ├── database/                  # ← Configuração do banco
│   │   ├── __init__.py
│   │   ├── connection.py         # ← Conexão PostgreSQL
│   │   └── session.py            # ← Session do SQLAlchemy
│   │
│   └── utils/                     # ← Utilitários
│       ├── __init__.py
│       ├── security.py           # ← JWT, hash de senha
│       └── validators.py         # ← Validações customizadas
│
├── requirements.txt               # ← Dependências Python
├── .env                          # ← Variáveis de ambiente
├── .env.example                  # ← Exemplo de configuração
└── README.md                     # ← Documentação do backend

```

---

## 🔑 Onde Colocar as Rotas de Login e Cadastro

### **Arquivo: `app/routers/auth.py`**

Este arquivo centraliza rotas de autenticação.

```python
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse
from app.services.auth_service import AuthService
from app.database.session import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/auth/login
    
    Faz login do usuário e retorna token JWT
    """
    try:
        # Valida credenciais
        user = await AuthService.authenticate_user(
            db=db,
            email=credentials.email,
            password=credentials.password
        )
        
        # Gera token JWT
        token = AuthService.create_access_token(user.id)
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "nome": user.nome,
                "username": user.username
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register")
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/auth/register
    
    Registra novo usuário no sistema
    """
    try:
        # Verifica se email já existe
        existing_user = AuthService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já em uso")
        
        # Cria novo usuário
        new_user = await AuthService.create_user(db, user_data)
        
        # Gera token JWT
        token = AuthService.create_access_token(new_user.id)
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "nome": new_user.nome,
                "username": new_user.username
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 📋 Schemas Pydantic (Validação)

### **Arquivo: `app/schemas/auth.py`**

```python
from pydantic import BaseModel, EmailStr, validator

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        from_attributes = True

class RegisterRequest(BaseModel):
    nome: str
    username: str
    email: EmailStr
    senha: str
    
    @validator('senha')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Senha deve ter no mínimo 6 caracteres')
        return v
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3 or len(v) > 10:
            raise ValueError('Username deve ter entre 3 e 10 caracteres')
        if not v.replace('_', '').isalnum():
            raise ValueError('Use apenas letras, números e underscore')
        return v
    
    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    success: bool
    token: str
    user: dict
```

---

## 🎯 Arquivo Principal (main.py)

### **Arquivo: `app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, workouts, exercises, quick_workouts, history

app = FastAPI(title="TCC Fitness API")

# CORS - PERMITE FRONTEND CHAMAR O BACKEND
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REGISTRA AS ROTAS
app.include_router(auth.router, prefix="/api")
app.include_router(workouts.router, prefix="/api")
app.include_router(exercises.router, prefix="/api")
app.include_router(quick_workouts.router, prefix="/api")
app.include_router(history.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "TCC Fitness API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "OK"}
```

---

## 🔧 Services (Lógica de Negócio)

### **Arquivo: `app/services/auth_service.py`**

```python
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "sua_chave_secreta_jwt_aqui"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthService:
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifica se a senha está correta"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Gera hash da senha"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(user_id: str) -> str:
        """Gera token JWT"""
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "exp": expire
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    @staticmethod
    async def authenticate_user(db: Session, email: str, password: str):
        """Autentica usuário"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise Exception("Email não encontrado")
        
        if not AuthService.verify_password(password, user.senha_hash):
            raise Exception("Senha incorreta")
        
        return user
    
    @staticmethod
    async def create_user(db: Session, user_data):
        """Cria novo usuário"""
        hashed_password = AuthService.get_password_hash(user_data.senha)
        
        new_user = User(
            nome=user_data.nome,
            username=user_data.username,
            email=user_data.email,
            senha_hash=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
```

---

## 📊 Model de Usuário

### **Arquivo: `app/models/user.py`**

```python
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    senha_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    workout_plans = relationship("WorkoutPlan", back_populates="user")
```

---

## 📦 Requirements.txt

```txt
fastapi==0.104.0
uvicorn[standard]==0.23.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic[email]==2.5.0
python-dotenv==1.0.0
openai==1.3.5
```

---

## 🚀 Como Rodar

### **1. Criar ambiente virtual**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

### **2. Instalar dependências**
```bash
pip install -r requirements.txt
```

### **3. Configurar .env**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/fitness_db
SECRET_KEY=sua_chave_secreta_jwt_aqui
OPENAI_API_KEY=sk-...
```

### **4. Rodar servidor**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 3000
```

### **5. Testar**
```bash
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"123456"}'
```

---

## 📍 Resumo: Onde Colocar Cada Coisa

| Componente | Arquivo |
|------------|---------|
| **Rotas de Login/Cadastro** | `app/routers/auth.py` |
| **Schemas de validação** | `app/schemas/auth.py` |
| **Lógica de autenticação** | `app/services/auth_service.py` |
| **Model de usuário** | `app/models/user.py` |
| **Registrar rotas** | `app/main.py` |

---

## ✅ Checklist de Implementação

- [ ] Criar estrutura de pastas
- [ ] Configurar banco de dados PostgreSQL
- [ ] Criar model User
- [ ] Criar schemas Pydantic
- [ ] Implementar AuthService
- [ ] Criar rotas em `app/routers/auth.py`
- [ ] Registrar rotas no `main.py`
- [ ] Testar com Postman/curl
- [ ] Integrar com frontend

**Com esta estrutura, suas rotas de login e cadastro estarão organizadas e prontas para uso!** 🎯

