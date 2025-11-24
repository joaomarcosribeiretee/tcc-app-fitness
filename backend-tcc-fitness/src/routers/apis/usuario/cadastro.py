from fastapi import Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.routers.router import router
from src.core.database import get_db_mysql
from src.routers.models.consultas import consulta_get
from src.routers.models.usuario_model import PostCadastro, PostLogin
from datetime import datetime, timedelta
from jose import jwt, JWTError
from src.core.config import SettingsAuth
import bcrypt


@router.post("/cadastro")
def cadastro(user: PostCadastro, session: Session = Depends(get_db_mysql)):
    query = f"""
    SELECT 1 FROM TCC.usuario WHERE username = '{user.username}' OR email = '{user.email}'
    """
    
    if consulta_get(query, session):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário ou e-mail já cadastrado!")


    hashed = bcrypt.hashpw(user.senha.encode('utf-8'), bcrypt.gensalt())
    hashed_senha = hashed.decode('utf-8')

    query = """
        INSERT INTO TCC.usuario (nome, email, username, senha) VALUES (:nome, :email, :username, :senha);
    """

    params = {
        'nome': user.nome,
        'email': user.email,
        'username': user.username,
        'senha': hashed_senha
    }

    session.execute(text(query), params)
    session.commit()

    # Buscar o usuário recém-criado para gerar o token
    query_usuario = "SELECT * FROM TCC.usuario WHERE email = :email"
    usuario_criado = consulta_get(query_usuario, session, {"email": user.email})
    if usuario_criado:
        token = generate_token(usuario_criado[0])
        return {"auth_token": token.get("auth_token")}
    
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao cadastrar usuário!")


@router.post("/login")
def login_usuario(response: Response,login: PostLogin, session: Session = Depends(get_db_mysql)):

    query = "SELECT * FROM TCC.USUARIO WHERE email = :email"
    usuario = consulta_get(query, session, {"email": login.email})
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário ou senha inválidos!")
    usuario = usuario[0]

    if bcrypt.checkpw(login.senha.encode('utf-8'), usuario['senha'].encode('utf-8')):

        token = generate_token(usuario)
    
        return {"token": token.get("auth_token")}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário ou senha inválidos!")
    

def generate_token(usuario):

    exp = datetime.now() + timedelta(hours=1)

    payload = {
            "sub": {
                'id': usuario['id'],
                'nome': usuario['nome'],
                'email': usuario['email'],
                'username': usuario['username']
            },
            "exp": exp
        }

    access_token = jwt.encode(
        payload,
        SettingsAuth().SECRET_KEY,
        algorithm=SettingsAuth().ALGORITHM
    )

    # return access_token

    return {
        'auth_token': access_token,
        'expiration': exp.isoformat()
    }
