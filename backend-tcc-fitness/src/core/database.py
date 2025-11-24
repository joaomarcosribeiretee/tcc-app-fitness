from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm.session import Session

from src.core.config import Settings

sett = Settings()
uri = f'{sett.MYSQL_USER}:{sett.MYSQL_PASSWORD}@{sett.MYSQL_HOST}:{sett.MYSQL_PORT}/{sett.MYSQL_DB}'

engine = create_engine(f'mysql+pymysql://{uri}', pool_size=10, max_overflow=2, pool_timeout=30, pool_recycle=3600)


def get_db_mysql() -> Generator[Session, None, None]:
    """Criação de sessão de banco de dados."""
    try:
        with Session(engine) as session:
            yield session
    except Exception as e:
        raise e
