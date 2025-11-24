from pydantic import BaseModel
from typing import List, Optional
from fastapi import UploadFile, UploadFile
from datetime import datetime

class PostAnamnese(BaseModel):
    usuario_id: int
    idade: int
    sexo: str
    peso: float
    experiencia: str
    tempo_treino: str
    dias_semana: str
    tempo_treino_por_dia: str
    objetivos: List[str]
    objetivo_especifico: str
    lesao: str
    condicao_medica: str
    exercicio_nao_gosta: str
    equipamentos: Optional[str] = None


class PostAnamneseDieta(BaseModel):
    usuario_id: int
    sexo: str
    idade: int
    altura: float
    pesoatual: float
    pesodesejado: float
    objetivo: str
    data_meta: str
    avalicao_rotina: str
    orcamento: str
    alimentos_acessiveis: bool
    come_fora: bool
    tipo_alimentacao: str
    alimentos_gosta: str
    alimentos_nao_gosta: str
    qtd_refeicoes: int
    lanche_entre_refeicoes: bool
    horario_alimentacao: str
    prepara_propria_refeicao: bool
    onde_come: str
    possui_alergias: bool
    possui_condicao_medica: str
    uso_suplementos: bool