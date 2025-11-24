from sqlalchemy import text
from src.core.database import get_db_mysql  # ajuste conforme seu projeto
from src.routers.models.query_db import queries_db

def create_db_tcc():
    """Cria o banco 'tcc' e a tabela USUARIO se não existirem usando a sessão do get_db_mysql."""
    db_gen = get_db_mysql()
    session = next(db_gen)
    try:
        # Criação do banco de dados 'tcc' se não existir
        session.execute(text("CREATE DATABASE IF NOT EXISTS tcc"))
        session.execute(text("USE tcc"))

        for query in queries_db.values():
            session.execute(text(query))
            session.commit()

    except Exception as e:
        print(f"Erro ao criar banco ou tabela: {e}")
    finally:
        session.close()