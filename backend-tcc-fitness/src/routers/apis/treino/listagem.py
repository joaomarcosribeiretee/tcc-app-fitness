from fastapi import Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, bindparam
from pydantic import BaseModel, Field

from src.routers.router import router
from src.core.database import get_db_mysql
from src.routers.models.consultas import consulta_get


class ExerciseCatalogRequest(BaseModel):
    exercicios_ids: list[int] = Field(default_factory=list, alias="exerciciosIds")



@router.get("/exercicios-treinos")
def listar_ex(
    user_id: int,
    id_treino: int,
    session: Session = Depends(get_db_mysql)
):
    """Retorna os exercícios associados a um treino específico.
    
    Args:
        user_id (int): ID do usuário.
        id_treino (int): ID do treino.
        session (Session): Sessão do banco de dados.
    Returns:
        dict: Dicionário contendo a lista de exercícios do treino.
    """

    query = """
   SELECT et.id_ex_treino, et.nome_exercicio, et.grupo_muscular, et.equipamento, et.descanso, et.series, et.reps  FROM TCC.TREINO t
LEFT JOIN TCC.EXERCICIO_TREINO et ON t.ID = et.id_treino
where et.id_treino = :id_treino;
"""

    exercicios = consulta_get(query, session, {"id_treino": id_treino})
    return exercicios


@router.get("/programas")
def listar_programas_treino(
    user_id: int = Query(..., alias="userId", description="ID do usuário"),
    session: Session = Depends(get_db_mysql)
):
    """Retorna os programas de treino associados a um usuário.
    
    Args:
        user_id (int): ID do usuário.
        session (Session): Sessão do banco de dados.
    Returns:
        dict: Dicionário contendo a lista de programas de treino do usuário.
    """
    query = """
        SELECT 
            pt.id_programa_treino,
            pt.id_usu,
            pt.nome,
            pt.descricao,
            pt.created_at,
            pt.updated_at
        FROM TCC.PROGRAMA_TREINO pt
        WHERE pt.id_usu = :user_id
        ORDER BY pt.created_at DESC
    """

    programas = consulta_get(query, session, {"user_id": user_id})
    return programas


@router.get("/treinos-programa")
def listar_treinos_programas(
    user_id: int,
    id_programa: int,
    session: Session = Depends(get_db_mysql)
):
    
    """Retorna os treinos associados a um programa de treino específico.
    Args:
        user_id (int): ID do usuário.
        id_programa (int): ID do programa de treino.
        session (Session): Sessão do banco de dados.
    Returns:
        list: Lista de treinos do programa de treino.
    """
    query = """
    SELECT t.id, t.nome, t.descricao, t.duracao, t.dificuldade FROM 
TCC.PROGRAMA_TREINO pt 
LEFT JOIN TCC.TREINO t ON t.id_programa_treino = pt.id_programa_treino
where t.id_programa_treino = :id_programa;
"""

    treinos = consulta_get(query, session, {"id_programa": id_programa})
    return treinos
