from sqlalchemy.orm import Session
from sqlalchemy.sql import text
import pandas as pd
import base64


def consulta_get(query: str, session: Session, params: dict | None = None) -> list[dict]:
    result = session.execute(text(query), params).mappings().all()
    return [
            {
                key.lower() : value.rstrip() if isinstance(value, str) else value
                for key, value in dict(row).items()
            }
            for row in result
        ]

def serialize_data(value):
    # Trata dados binários (como imagens)
    if isinstance(value, memoryview):
        return base64.b64encode(value.tobytes()).decode('utf-8')
    if isinstance(value, bytes):
        return base64.b64encode(value).decode('utf-8')
    return value

def consulta_get_img(query: str, session: Session, params: dict | None = None) -> list[dict]:
    result = session.execute(text(query), params).mappings().all()
    return [
        {
            key.lower(): serialize_data(value.rstrip()) if isinstance(value, str) else serialize_data(value)
            for key, value in dict(row).items()
        }
        for row in result
    ]