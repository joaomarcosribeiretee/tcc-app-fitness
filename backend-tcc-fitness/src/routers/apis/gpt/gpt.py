from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.routers.router import router
from src.core.database import get_db_mysql
from src.routers.models.anamnesemodel import PostAnamnese
from src.routers.apis.gpt.funcs_gpt import gpt_response
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from typing import Any
from pydantic import BaseModel, Field

PROMPT_TEMPLATE = """
Você é uma IA especializada em prescrição de treinos de musculação. Sua tarefa é gerar um programa de treino completo e personalizado baseado na anamnese fornecida. LEIA TODAS AS INSTRUÇÕES ANTES DE RESPONDER.

=== REGRAS CRÍTICAS DE FORMATO ===
1. Sua resposta deve ser EXCLUSIVAMENTE um JSON válido, sem nenhum texto adicional, comentários ou explicações antes ou depois do JSON.
2. O JSON deve seguir EXATAMENTE a estrutura abaixo, sem variações.

=== ESTRUTURA JSON OBRIGATÓRIA ===
{
  "programaTreino": {
    "nomePrograma": "string obrigatória",
    "descricaoPrograma": "string obrigatória"
  },
  "treinos": [
    {
      "nome": "string obrigatória",
      "descricao": "string obrigatória",
      "idUsuario": inteiro >= 1,
      "duracaoMinutos": inteiro >= 10,
      "dificuldade": "iniciante" | "intermediario" | "avancado",
      "exercicios": [
        {
          "nomeExercicio": "nome do exercício",
          "equipamento": "equipamento necessário",
          "grupoMuscular": "Peito" | "Costas" | "Ombro" | "Braço" | "Perna" | "Glúteo" | "Abdômen",
          "idExercicio": inteiro >= 1,
          "series": inteiro >= 1,
          "repeticoes": inteiro >= 1,
          "descansoSegundos": inteiro >= 15
        }
      ]
    }
  ]
}

=== REGRAS FUNDAMENTAIS ===

QUANTIDADE DE EXERCÍCIOS POR TREINO (CRÍTICO):
- MÍNIMO: 5 exercícios por treino (padrão obrigatório)
- IDEAL: 6-8 exercícios por treino para treinos normais
- MÁXIMO: 9 exercícios para treinos mais longos
- EXCEÇÃO: Apenas se o usuário especificamente solicitar menos exercícios OU houver limitações graves de tempo (menos de 30 minutos) OU lesões muito restritivas, você pode usar 4 exercícios (nunca menos que 4).
- IMPORTANTE: Se o usuário pediu mais dias de treino, gere TODOS os dias solicitados, mesmo com limitações. Adapte os exercícios, mas mantenha a quantidade de dias.

TIPO DE EXERCÍCIOS:
- EXCLUSIVAMENTE musculação tradicional (máquinas, pesos livres, cabos, peso corporal)
- NÃO inclua: cárdio, atividades funcionais, esportes, atividades aeróbicas

GERAÇÃO DE TREINOS:
- Gere UM treino para CADA dia disponível informado pelo usuário na anamnese
- Se o usuário pediu 6 dias, gere 6 treinos diferentes
- Se pediu 3 dias, gere 3 treinos diferentes
- NUNCA gere menos treinos que o solicitado, mesmo com limitações

DISTRIBUIÇÃO DE GRUPOS MUSCULARES:
- Mesmo com foco específico solicitado, distribua grupos musculares ao longo da semana
- Use divisões clássicas: Peito/Tríceps, Costas/Bíceps, Pernas/Glúteos, Ombros/Braços, Full Body
- Garanta treino de membros superiores E inferiores na semana
- Evite repetir o mesmo grupo muscular em dias consecutivos

ADAPTAÇÃO PARA LESÕES E LIMITAÇÕES:
- Se houver lesões mencionadas, escolha exercícios compatíveis e seguros
- Adapte o movimento, não reduza drasticamente a quantidade de exercícios
- Descreva as adaptações no campo "descricao" do treino
- Mantenha o número de dias solicitados, adaptando exercícios

CAMPOS E VALIDAÇÕES:
- Todos os campos numéricos devem ser inteiros
- idUsuario: use o ID da anamnese, ou 1 se não informado
- duracaoMinutos: deve refletir o tempo disponível informado
- dificuldade: baseada em experiência e objetivos ("iniciante", "intermediario" ou "avancado")
- grupoMuscular: apenas os valores permitidos (Peito, Costas, Ombro, Braço, Perna, Glúteo, Abdômen)

NOMENCLATURA:
- Nome do programa: descritivo e alinhado ao objetivo
- Nome dos treinos: formato "Treino 01 - Peito e Tríceps Hipertrofia" ou "Treino 03 - Pernas Ênfase Quadríceps"
- Descrição: mencionar objetivo, intensidade, grupos trabalhados e recomendações

SÉRIES, REPETIÇÕES E DESCANSO:
- Ajuste conforme nível (iniciante: 3x10-12, intermediário: 3-4x8-12, avançado: 4-5x6-10)
- Descanso: 45-90s iniciante, 60-120s intermediário, 90-180s avançado
- Considere tempo disponível para calcular volume total

=== PROCESSO DE GERAÇÃO (SIGA ESTA SEQUÊNCIA) ===

PASSO 1 - INTERPRETAÇÃO:
- Analise idade, sexo, peso, experiência, objetivos, disponibilidade (dias e tempo)
- Identifique lesões, limitações, condições médicas
- Liste equipamentos disponíveis
- Anote exercícios que o usuário não gosta (EVITE esses exercícios)

PASSO 2 - PLANEJAMENTO:
- Determine dificuldade geral baseada em experiência
- Calcule quantos treinos gerar (EXATAMENTE o número de dias informado)
- Defina divisão de treinos (ex: Push/Pull/Legs para 3 dias, Upper/Lower para 4 dias, etc.)
- Distribua grupos musculares equilibradamente

PASSO 3 - GERAÇÃO DO PROGRAMA:
- Crie nome e descrição do programa resumindo objetivo e abordagem
- Para CADA treino do programa:
  * Defina nome específico do treino
  * Liste MINIMO 5 exercícios (ideal 6-8)
  * Distribua grupos musculares conforme divisão planejada
  * Ajuste séries/reps/descanso conforme nível e tempo
  * Evite exercícios que o usuário não gosta
  * Adapte para lesões/limitações mencionadas

PASSO 4 - VALIDAÇÃO:
- Verifique: número de treinos = número de dias solicitados
- Verifique: cada treino tem pelo menos 5 exercícios (a menos que exceção válida)
- Verifique: grupos musculares bem distribuídos na semana
- Verifique: duração total coerente com tempo disponível
- Verifique: JSON sintaticamente válido

=== ANAMNESE DO USUÁRIO ===
<<<RESPOSTAS_ANAMNESE>>>

LEMBRE-SE: 
- Resposta APENAS JSON, sem texto adicional
- Mínimo 5 exercícios por treino (padrão)
- Gere TODOS os dias solicitados
- Respeite lesões, mas não reduza dias nem quantidade excessivamente
"""

ADJUSTMENT_SUFFIX_TEMPLATE = """

=== AJUSTE DO PLANO DE TREINO ===

O usuário solicitou alterações no plano atual. Você deve gerar um NOVO plano completo aplicando TODAS as regras anteriores E as alterações solicitadas.

PLANO ATUAL EM JSON:
{plano_atual}

ALTERAÇÕES SOLICITADAS PELO USUÁRIO:
{ajustes}

=== REGRAS PARA O AJUSTE ===

1. MANTENHA TODAS AS REGRAS DO PROMPT DE GERAÇÃO:
   - Mínimo 5 exercícios por treino (padrão), ideal 6-8, máximo 9
   - Respeite número de dias do plano original (a menos que usuário peça para mudar)
   - Mantenha distribuição equilibrada de grupos musculares
   - Respeite lesões, limitações e equipamentos disponíveis
   - Evite exercícios que o usuário não gosta
   - Formato JSON exclusivo, sem texto adicional

2. APLIQUE AS ALTERAÇÕES SOLICITADAS:
   - Se o usuário pediu mais dias: adicione os treinos solicitados
   - Se pediu menos dias: remova treinos, mas mantenha mínimo 5 exercícios nos restantes
   - Se pediu mais exercícios: adicione exercícios respeitando grupo muscular do dia
   - Se pediu mudança de foco: ajuste distribuição mantendo equilíbrio
   - Se pediu substituição de exercício: substitua mantendo mesmo grupo muscular
   - Se pediu ajuste de séries/reps: ajuste respeitando nível do usuário

3. CONSISTÊNCIA:
   - Mantenha estrutura e formato do plano original
   - Preserve dificuldade geral (a menos que usuário peça mudança)
   - Mantenha nome do programa (a menos que usuário peça mudança)
   - Ajuste descrições conforme mudanças realizadas

4. VALIDAÇÃO:
   - Verifique que cada treino tem pelo menos 5 exercícios
   - Verifique distribuição equilibrada de grupos musculares
   - Verifique que alterações solicitadas foram aplicadas
   - Verifique JSON válido

IMPORTANTE: Se o usuário pediu "mais dias", você DEVE adicionar os treinos. Se pediu "mais exercícios", você DEVE adicionar mantendo o mínimo de 5 por treino. Se houver limitações, adapte os exercícios mas mantenha a estrutura solicitada.

Gere o NOVO plano completo em JSON, aplicando as alterações e mantendo todas as regras.
"""


def build_prompt(anamnese: PostAnamnese) -> str:
    objetivos_text = ", ".join(anamnese.objetivos) if anamnese.objetivos else "não especificado"
    equipamentos_text = anamnese.equipamentos or "não informado"

    anamnese_text = (
        f"ID do usuário: {anamnese.usuario_id}\n"
        f"Idade: {anamnese.idade}\n"
        f"Sexo: {anamnese.sexo}\n"
        f"Peso (kg): {anamnese.peso}\n"
        f"Experiência: {anamnese.experiencia}\n"
        f"Tempo de treino atual: {anamnese.tempo_treino}\n"
        f"Dias por semana disponíveis: {anamnese.dias_semana}\n"
        f"Tempo disponível por treino: {anamnese.tempo_treino_por_dia}\n"
        f"Objetivos principais: {objetivos_text}\n"
        f"Objetivo específico: {anamnese.objetivo_especifico}\n"
        f"Lesões ou limitações: {anamnese.lesao or 'nenhuma'}\n"
        f"Condições médicas: {anamnese.condicao_medica or 'nenhuma'}\n"
        f"Exercícios que não gosta: {anamnese.exercicio_nao_gosta or 'nenhum'}\n"
        f"Equipamentos disponíveis: {equipamentos_text}"
    )
    return PROMPT_TEMPLATE.replace("<<<RESPOSTAS_ANAMNESE>>>", anamnese_text)


def build_adjustment_prompt(anamnese: PostAnamnese, plano_atual: dict, ajustes: str) -> str:
    base_prompt = build_prompt(anamnese)
    plano_json = json.dumps(plano_atual, ensure_ascii=False, indent=2)
    ajustes_texto = ajustes.strip() or "Sem ajustes adicionais fornecidos."
    return base_prompt + ADJUSTMENT_SUFFIX_TEMPLATE.format(
        plano_atual=plano_json,
        ajustes=ajustes_texto,
    )




def persist_workout_plan(plan: dict, session: Session) -> dict:
    programa = plan.get("programaTreino")
    treinos = plan.get("treinos")

    if not isinstance(programa, dict) or not isinstance(treinos, list) or not treinos:
        raise HTTPException(status_code=400, detail="Estrutura do plano inválida")

    insert_programa_sql = text(
        """
        INSERT INTO TCC.PROGRAMA_TREINO (id_usu, nome, descricao)
        VALUES (:id_usuario, :nome_programa, :descricao_programa)
        """
    )

    insert_treino_sql = text(
        """
        INSERT INTO TCC.TREINO (nome, descricao, id_usuario, id_programa_treino, duracao, dificuldade)
        VALUES (:nome, :descricao, :id_usuario, :id_programa_treino, :duracao, :dificuldade)
        """
    )

    insert_exercicio_treino_sql = text(
        """
        INSERT INTO TCC.EXERCICIO_TREINO (nome_exercicio, equipamento, grupo_muscular, id_treino, descanso, series, reps)
        VALUES (:nome_exercicio, :equipamento, :grupo_muscular, :id_treino, :descanso, :series, :reps)
        """
    )

    treinos_inseridos: list[int] = []

    nome_programa = programa.get("nomePrograma")
    descricao_programa = programa.get("descricaoPrograma")

    if not nome_programa or not descricao_programa:
        raise HTTPException(status_code=400, detail="Dados do programa incompletos")

    try:
        usuario_programa_id = int(treinos[0].get("idUsuario"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="ID de usuário inválido no plano gerado")

    programa_result = session.execute(
        insert_programa_sql,
        {
            "id_usuario": usuario_programa_id,
            "nome_programa": nome_programa,
            "descricao_programa": descricao_programa,
        }
    )
    programa_id = programa_result.lastrowid
    if not programa_id:
        raise HTTPException(status_code=500, detail="Falha ao inserir programa de treino")

    for treino in treinos:
        try:
            id_usuario = int(treino.get("idUsuario"))
            duracao = int(treino.get("duracaoMinutos"))
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Campos numéricos inválidos no treino gerado")

        if id_usuario < 1 or duracao < 10:
            raise HTTPException(status_code=400, detail="Valores inconsistentes no treino gerado")

        if id_usuario != usuario_programa_id:
            raise HTTPException(status_code=400, detail="Todos os treinos do programa devem pertencer ao mesmo usuário")

        nome_treino = treino.get("nome")
        descricao_treino = treino.get("descricao")
        dificuldade = treino.get("dificuldade")

        if not nome_treino or not descricao_treino or not dificuldade:
            raise HTTPException(status_code=400, detail="Dados obrigatórios do treino ausentes")

        result_treino = session.execute(
            insert_treino_sql,
            {
                "nome": nome_treino,
                "descricao": descricao_treino,
                "id_usuario": id_usuario,
                "id_programa_treino": programa_id,
                "duracao": duracao,
                "dificuldade": dificuldade.lower(),
            }
        )
        treino_id = result_treino.lastrowid
        if not treino_id:
            raise HTTPException(status_code=500, detail="Falha ao inserir treino")

        treinos_inseridos.append(treino_id)

        exercicios = treino.get("exercicios") or []
        if not exercicios:
            raise HTTPException(status_code=400, detail="Treino gerado sem exercícios")

        for exercicio in exercicios:
            try:
                nome = exercicio.get("nomeExercicio")
                equipamento = exercicio.get("equipamento")
                grupo_muscular = exercicio.get("grupoMuscular")
                if not nome or not equipamento or not grupo_muscular:
                    raise HTTPException(status_code=400, detail="Dados obrigatórios do exercício ausentes")
                series_total = int(exercicio.get("series"))
                repeticoes = int(exercicio.get("repeticoes"))
                descanso = int(exercicio.get("descansoSegundos"))
            except (TypeError, ValueError):
                raise HTTPException(status_code=400, detail="Campos numéricos inválidos nos exercícios gerados")

            if series_total < 1 or repeticoes < 1 or descanso < 15:
                raise HTTPException(status_code=400, detail="Valores inconsistentes nos exercícios gerados")

            result_ex_treino = session.execute(
                insert_exercicio_treino_sql,
                {
                    "nome_exercicio": nome,
                    "equipamento": equipamento,
                    "grupo_muscular": grupo_muscular,
                    "series": series_total,
                    "reps": repeticoes,
                    "id_treino": treino_id,
                    "descanso": descanso,
                }
            )
            id_ex_treino = result_ex_treino.lastrowid
            if not id_ex_treino:
                raise HTTPException(status_code=500, detail="Falha ao inserir exercício do treino")

    if not treinos_inseridos:
        raise HTTPException(status_code=500, detail="Nenhum treino foi inserido para o programa")

    return {
        "programa": {
            "id_programa_treino": programa_id,
            "nome": nome_programa,
            "descricao": descricao_programa,
        },
        "treinos_inseridos": treinos_inseridos,
        "plano": plan,
    }


class PlanPayload(BaseModel):
    plano: dict


class AdjustmentPayload(BaseModel):
    anamnese: PostAnamnese
    plano_atual: dict = Field(..., alias="planoAtual")
    ajustes: str


@router.post("/gpt")
def gpt(anamnese: PostAnamnese):
    """
    Gera um plano de treino personalizado usando GPT com base na anamnese fornecida.
    Args:
        anamnese (PostAnamnese): Dados da anamnese do usuário.
        Returns:
            dict: Resposta com mensagem de sucesso e o plano gerado.
        """
    prompt = build_prompt(anamnese)
    plano = gpt_response(prompt)
    print(plano)
    return {
        "message": "Plano gerado com sucesso",
        "plano": plano,
    }


@router.post("/gpt/ajustar")
def ajustar_plano(payload: AdjustmentPayload):
    prompt = build_adjustment_prompt(payload.anamnese, payload.plano_atual, payload.ajustes)
    plano = gpt_response(prompt)
    print(plano)
    return {
        "message": "Plano ajustado com sucesso",
        "plano": plano,
    }


@router.post("/gpt/confirm")
def confirmar_plano(payload: PlanPayload, session: Session = Depends(get_db_mysql)):
    """
    Confirma e persiste o plano de treino gerado pelo GPT no banco de dados.
    Args:
        payload (PlanPayload): Payload contendo o plano de treino gerado.
        session (Session): Sessão do banco de dados injetada pelo FastAPI.
    Returns:
        dict: Resposta com mensagem de sucesso, detalhes do programa e IDs dos treinos inseridos.
    """
    try:
        resultado = persist_workout_plan(payload.plano, session)
        session.commit()
    except HTTPException:
        session.rollback()
        raise
    except Exception as exc:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar treino: {exc}") from exc

    return {
        "message": "Plano gerado e salvo com sucesso",
        "programa": resultado["programa"],
        "treinosIds": resultado["treinos_inseridos"],
        "plano": resultado["plano"],
    }