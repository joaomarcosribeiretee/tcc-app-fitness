from fastapi import Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.routers.router import router
from src.core.database import get_db_mysql
from src.routers.models.consultas import consulta_get

@router.get("/dietas_usuario")
def listar_dietas_usuario(
    id_usuario: int = Query(..., alias="idUsuario", description="ID do usuário"),
    session: Session = Depends(get_db_mysql)
):
    """Retorna as dietas associadas a um usuário.
    
    Args:
        id_usuario (int): ID do usuário.
        session (Session): Sessão do banco de dados.
    Returns:
        dict: Dicionário contendo a lista de dietas do usuário.
    """
    query = """
    SELECT d.id_dieta, d.nome, d.descricao, c.calorias
    FROM TCC.DIETA d
    LEFT JOIN (SELECT id_dieta, SUM(calorias) as calorias FROM TCC.REFEICOES GROUP BY id_dieta) c ON c.id_dieta = d.id_dieta
    WHERE ID_USUARIO = :id_usuario;
    """
    return consulta_get(query, session, {"id_usuario": id_usuario})

@router.get("/refeicoes_dieta")
def refeicoes_dieta(
    id_dieta: int = Query(..., alias="idDieta", description="ID da dieta"),
    session: Session = Depends(get_db_mysql)
):
    """Retorna as refeições de uma dieta específica.
    
    Args:
        id_dieta (int): ID da dieta.
        session (Session): Sessão do banco de dados.
    Returns:
        dict: Dicionário contendo as refeições da dieta.
    """
    query = """
    SELECT r.id_refeicao, r.tipo_refeicao, r.id_dieta, r.calorias, r.alimentos
    FROM TCC.DIETA d
    LEFT JOIN TCC.REFEICOES r ON r.id_dieta = d.id_dieta
    WHERE d.ID_DIETA = :id_dieta;
    """
    return consulta_get(query, session, {"id_dieta": id_dieta})