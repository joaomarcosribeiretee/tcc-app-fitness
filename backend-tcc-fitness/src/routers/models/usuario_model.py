from pydantic import BaseModel
from fastapi import UploadFile, UploadFile
from datetime import datetime

class PostCadastro(BaseModel):
    username: str
    nome: str
    senha: str
    email: str

class PostLogin(BaseModel):
    email: str
    senha: str