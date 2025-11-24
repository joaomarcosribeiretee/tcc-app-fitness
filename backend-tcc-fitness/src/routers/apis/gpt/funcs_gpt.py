from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.routers.router import router
from src.core.database import get_db_mysql
from src.routers.models.anamnesemodel import PostAnamnese
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from typing import Any
from pydantic import BaseModel, Field

def gpt_response(prompt: str) -> dict:
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY não configurada")

    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model="ft:gpt-4o-mini-2024-07-18:tcc:teste2:CbGGCMeu",
        input=prompt
    )

    raw_text = parse_response_output(response)
    if not raw_text:
        raise HTTPException(status_code=502, detail="Resposta vazia do modelo")

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        try:
            json_payload = extract_json_payload(raw_text)
            return json.loads(json_payload)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=502, detail=f"Falha ao decodificar JSON da IA: {exc}") from exc
        
def parse_response_output(response: Any) -> str:
    if hasattr(response, "output_text") and response.output_text:
        return response.output_text

    text_chunks: list[str] = []
    output_items = getattr(response, "output", [])

    for item in output_items or []:
        contents = getattr(item, "content", [])
        for content in contents:
            if isinstance(content, dict):
                text_value = content.get("text") or content.get("value")
                if text_value:
                    text_chunks.append(text_value)
            else:
                text_value = getattr(content, "text", None) or getattr(content, "value", None)
                if text_value:
                    text_chunks.append(text_value)
    return "".join(text_chunks)


def extract_json_payload(raw_text: str) -> str:
    if not raw_text:
        return ""

    cleaned = raw_text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        newline_index = cleaned.find("\n")
        if newline_index != -1:
            cleaned = cleaned[newline_index + 1 :].strip()

    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")

    if first_brace != -1 and last_brace != -1 and last_brace >= first_brace:
        return cleaned[first_brace : last_brace + 1]

    return cleaned