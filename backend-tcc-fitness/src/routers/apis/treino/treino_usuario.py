# ...existing code...
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import List

from src.routers.router import router
from src.core.database import get_db_mysql

@router.get("/sessoes/perfil")
def get_treinos_usuario(id_usuario: int, db: Session = Depends(get_db_mysql)):
    """
    Retorna as sessões de treino do usuário com:
    - id_sessao
    - duracao_sessao
    - descricao (da sessão)
    - id_treino
    - treino_nome
    - qtd_exercicios (quantos exercícios estão associados ao treino naquela sessão)
    """
    query = """
    SELECT
      st.id_sessao,
      st.duracao_sessao,
      st.descricao,
      t.id AS id_treino,
      t.nome AS treino_nome,
      COUNT(DISTINCT et.id_ex_treino) AS qtd_exercicios
    FROM TCC.SESSAO_TREINO st
    JOIN TCC.TREINO t ON st.id_treino = t.id
    LEFT JOIN TCC.EXERCICIO_TREINO et ON et.id_treino = t.id
    WHERE t.id_usuario = :id_usuario
    GROUP BY st.id_sessao, st.duracao_sessao, st.descricao, t.id, t.nome
    ORDER BY st.id_sessao;
    """
    try:
        rows = db.execute(text(query), {"id_usuario": id_usuario}).mappings().all()
        return [dict(r) for r in rows]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar sessões: {exc}")

# ...existing code...
@router.get("/sessoes/exercicios")
def get_exercicios_por_sessao(id_sessao: int, db: Session = Depends(get_db_mysql)):
    """
    Retorna todos os exercícios realizados em uma sessão específica,
    incluindo as séries com repetições e cargas:
    - id_ex_treino
    - nome_exercicio
    - equipamento (opcional)
    - series: [{id_serie, numero_serie, repeticoes, carga}, ...]
    """
    query = """
    SELECT
      et.id_ex_treino,
      et.nome_exercicio,
      et.equipamento,
      s.id_serie,
      s.numero_serie,
      s.repeticoes,
      s.carga
    FROM TCC.SERIES s
    JOIN TCC.EXERCICIO_TREINO et ON s.id_ex_treino = et.id_ex_treino
    WHERE s.id_sessao = :id_sessao
    ORDER BY et.id_ex_treino, s.numero_serie;
    """
    try:
        rows = db.execute(text(query), {"id_sessao": id_sessao}).mappings().all()
        # agrupa por exercício para retornar estrutura aninhada
        exercicios = {}
        for r in rows:
            ex_id = r["id_ex_treino"]
            if ex_id not in exercicios:
                exercicios[ex_id] = {
                    "id_ex_treino": ex_id,
                    "nome_exercicio": r.get("nome_exercicio"),
                    "equipamento": r.get("equipamento"),
                    "series": []
                }
            exercicios[ex_id]["series"].append({
                "id_serie": r.get("id_serie"),
                "numero_serie": r.get("numero_serie"),
                "repeticoes": r.get("repeticoes"),
                "carga": r.get("carga"),
            })
        return list(exercicios.values())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar exercícios da sessão: {exc}")


class ExercicioInsert(BaseModel):
    id_exercicio: int = Field(..., alias="id_exercicio")
    repeticoes: List[int]
    cargas: List[float]

class SessaoInsert(BaseModel):
    duracao: int
    id_treino: int
    descricao: str = ""
    exercicios: List[ExercicioInsert]

@router.post("/sessoes")
def criar_sessao_treino(payload: SessaoInsert, db: Session = Depends(get_db_mysql)):
    """
    Insere uma sessão de treino e as séries associadas.
    Body esperado:
    {
      "duracao": 0,
      "id_treino": 1,
      "descricao": "",
      "exercicios": [
        {
          "id_exercicio": 0,
          "repeticoes": [12,10,5],
          "cargas": [15,10,10]
        },
        ...
      ]
    }
    Retorna id_sessao e lista das séries inseridas.
    """
    insert_sessao_q = text("""
        INSERT INTO TCC.SESSAO_TREINO (duracao_sessao, descricao, id_treino)
        VALUES (:duracao, :descricao, :id_treino)
    """)
    insert_serie_q = text("""
        INSERT INTO TCC.SERIES (numero_serie, repeticoes, carga, id_ex_treino, id_sessao)
        VALUES (:numero_serie, :repeticoes, :carga, :id_ex_treino, :id_sessao)
    """)
    try:
        # validações básicas
        if not payload.exercicios:
            raise HTTPException(status_code=400, detail="Lista de exercícios vazia.")

        # inserir sessão
        db.execute(insert_sessao_q, {
            "duracao": payload.duracao,
            "descricao": payload.descricao,
            "id_treino": payload.id_treino
        })
        # obter id gerado da sessão
        id_sessao = db.execute(text("SELECT LAST_INSERT_ID()")).scalar()
        if not id_sessao:
            raise HTTPException(status_code=500, detail="Não conseguiu recuperar id da sessão inserida.")

        series_inseridas = []
        for exerc in payload.exercicios:
            if len(exerc.repeticoes) != len(exerc.cargas):
                raise HTTPException(status_code=400, detail=f"Listas de repetições e cargas com tamanhos diferentes para exercício {exerc.id_exercicio}.")

            for idx, (rep, carga) in enumerate(zip(exerc.repeticoes, exerc.cargas), start=1):
                db.execute(insert_serie_q, {
                    "numero_serie": idx,
                    "repeticoes": rep,
                    "carga": carga,
                    "id_ex_treino": exerc.id_exercicio,
                    "id_sessao": id_sessao
                })
                # montar registro retornado (id_serie não obtido aqui; pode ser recuperado se necessário)
                series_inseridas.append({
                    "id_sessao": id_sessao,
                    "id_ex_treino": exerc.id_exercicio,
                    "numero_serie": idx,
                    "repeticoes": rep,
                    "carga": carga
                })

        db.commit()
        return {"id_sessao": id_sessao, "series": series_inseridas}
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao inserir sessão: {exc}")