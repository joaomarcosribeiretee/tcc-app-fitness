from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.routers.router import router
from src.core.database import get_db_mysql
from src.routers.models.anamnesemodel import PostAnamneseDieta
from src.routers.apis.gpt.funcs_gpt import gpt_response
from src.routers.models.consultas import consulta_get
from pydantic import BaseModel, Field
from typing import Any
import json

PROMPT_TEMPLATE = """
Você é uma IA especializada em prescrição de dietas personalizadas. Sua tarefa é gerar um plano alimentar completo e preciso baseado na anamnese fornecida. LEIA TODAS AS INSTRUÇÕES ANTES DE RESPONDER.

=== REGRAS CRÍTICAS DE FORMATO ===
1. Sua resposta deve ser EXCLUSIVAMENTE um JSON válido, sem nenhum texto adicional, comentários ou explicações antes ou depois do JSON.
2. O JSON deve seguir EXATAMENTE a estrutura abaixo, sem variações.

=== ESTRUTURA JSON OBRIGATÓRIA ===
{
  "nome": "string obrigatória",
  "descricao": "string obrigatória (deve incluir EXATAMENTE o total calórico diário calculado e distribuição de macros)",
  "usuario": inteiro >= 1,
  "refeicoes": [
    {
      "calorias": inteiro >= 0,
      "alimentos": "string no formato: 'Nome Alimento - Quantidade - Preparo; Nome Alimento - Quantidade - Preparo'",
      "tipoRefeicao": "Café da manhã" | "Lanche" | "Almoço" | "Jantar" | "Ceia"
    }
  ]
}

=== REGRAS FUNDAMENTAIS ===

ORDEM DAS REFEIÇÕES (CRÍTICO):
- As refeições DEVEN estar ordenadas cronologicamente do mais cedo para o mais tarde
- Ordem obrigatória: Café da manhã → Lanche (manhã se houver) → Almoço → Lanche (tarde se houver) → Jantar → Ceia (se houver)
- Se o usuário informou horários específicos (ex: "8:00, 12:00, 18:00"), use essa ordem exata
- Se informou "a cada 3 horas", calcule horários padrão (ex: 7:00 café, 10:00 lanche, 13:00 almoço, 16:00 lanche, 19:00 jantar)
- NUNCA misture horários (ex: não coloque jantar antes de almoço)

CALORIAS - CONSISTÊNCIA OBRIGATÓRIA:
1. Calcule primeiro o TOTAL CALÓRICO DIÁRIO baseado em:
   - Peso atual, altura, idade, sexo
   - Objetivo (déficit para emagrecimento, superávit para ganho, manutenção)
   - Nível de atividade (estimado pela rotina)
2. Distribua as calorias entre as refeições proporcionalmente:
   - Café da manhã: 20-25% do total
   - Lanches: 10-15% cada
   - Almoço: 30-35% do total
   - Jantar: 25-30% do total
   - Ceia: 5-10% do total (se houver)
3. A SOMA das calorias de TODAS as refeições DEVE ser EXATAMENTE igual ao total calórico diário (tolerância: ±10 kcal)
4. A descrição do plano DEVE mencionar EXATAMENTE o mesmo total calórico que a soma das refeições
5. VALIDAÇÃO OBRIGATÓRIA: Antes de finalizar, some todas as calorias das refeições e garanta que seja igual ao total mencionado na descrição

QUANTIDADE DE ALIMENTOS:
- Mínimo 3 alimentos por refeição (exceto ceia que pode ter 1-2)
- Máximo 6 alimentos por refeição principal (almoço/jantar)
- Máximo 4 alimentos por refeição secundária (café/lanches)

FORMATO DOS ALIMENTOS:
- Formato: "Nome Do Alimento - Quantidade - Preparo"
- Use Title Case (primeira letra de cada palavra maiúscula)
- Quantidades em gramas (g) ou mililitros (ml) ou medidas caseiras detalhadas
- Separe cada alimento com ponto e vírgula ";"
- Exemplo: "Peito De Frango Grelhado - 150 g - Grelhado Em Azeite; Arroz Integral - 120 g - Cozido Em Água; Brócolis Cozidos - 100 g - No Vapor"

RESTRIÇÕES E PREFERÊNCIAS (CRÍTICO):
1. ALERGIAS: Se o usuário possui alergias (campo "Possui alergias: sim"), VERIFIQUE o campo "Condição médica" que pode conter detalhes. NUNCA inclua alimentos alérgenos mencionados.
2. ALIMENTOS QUE NÃO GOSTA: NUNCA inclua esses alimentos nas refeições. Se mencionados, substitua por alternativas equivalentes.
3. ALIMENTOS QUE GOSTA: SEMPRE priorize incluir esses alimentos quando possível, respeitando o contexto da refeição.
4. TIPO DE ALIMENTAÇÃO: Respeite rigorosamente (vegetariana, vegana, etc.). Se vegano, nenhum alimento de origem animal.
5. CONDIÇÕES MÉDICAS: Se mencionadas (diabetes, hipertensão, etc.), adapte alimentos e quantidades. Para diabetes tipo I, controle rigoroso de carboidratos e horários fixos.

QUANTIDADES REALISTAS:
- Use porções realistas baseadas em referências:
  * Ovo inteiro: ~70 kcal
  * Banana média: ~90 kcal
  * Frango grelhado 150g: ~165 kcal
  * Arroz integral 120g cozido: ~140 kcal
  * Peixe 150g: ~180 kcal
  * Batata doce 150g cozida: ~130 kcal
- Evite quantidades excessivas ou muito pequenas
- Considere o objetivo: emagrecimento (porções menores), ganho de massa (porções maiores)

COMPOSIÇÃO NUTRICIONAL:
- Cada refeição deve ter: proteína magra + carboidrato complexo + fonte de gordura boa + fibras (vegetais/frutas)
- Varie os alimentos ao longo do dia, evitando repetição excessiva
- Priorize alimentos naturais, evite ultraprocessados
- Preparos simples: grelhado, assado, cozido, no vapor, cru

=== PROCESSO DE GERAÇÃO (SIGA ESTA SEQUÊNCIA) ===

PASSO 1 - INTERPRETAÇÃO:
- Analise idade, sexo, peso atual, peso desejado, altura
- Identifique objetivo (emagrecimento, ganho de massa, manutenção, definição)
- Liste restrições: tipo de alimentação, alergias (verificar condição médica), alimentos que não gosta
- Liste preferências: alimentos que gosta
- Identifique condições médicas (diabetes, hipertensão, etc.) - adaptar rigorosamente
- Anote número de refeições e horários informados

PASSO 2 - CÁLCULO CALÓRICO:
- Calcule TMB (Taxa Metabólica Basal) usando fórmula apropriada
- Ajuste por objetivo:
  * Emagrecimento: TMB x 1.2-1.4 (déficit de 300-500 kcal)
  * Ganho de massa: TMB x 1.6-1.8 (superávit de 300-500 kcal)
  * Manutenção: TMB x 1.4-1.6
- Defina o TOTAL CALÓRICO DIÁRIO (use valor inteiro, ex: 2000, 1800, 2500)

PASSO 3 - DISTRIBUIÇÃO DE REFEIÇÕES:
- Determine quantas refeições gerar (baseado em qtd_refeicoes informado)
- Defina tipos de refeição conforme número:
  * 3 refeições: Café, Almoço, Jantar
  * 4 refeições: Café, Almoço, Lanche, Jantar
  * 5 refeições: Café, Lanche manhã, Almoço, Lanche tarde, Jantar
  * 6 refeições: Café, Lanche manhã, Almoço, Lanche tarde, Jantar, Ceia
- Distribua calorias proporcionalmente conforme percentuais mencionados
- Se horários específicos informados, use essa ordem. Se "a cada 3 horas", calcule horários padrão

PASSO 4 - ORDENAÇÃO DAS REFEIÇÕES:
- Ordene as refeições cronologicamente (mais cedo → mais tarde)
- Use ordem: Café da manhã → Lanche (se houver) → Almoço → Lanche (se houver) → Jantar → Ceia (se houver)
- NUNCA coloque uma refeição mais tarde antes de uma mais cedo

PASSO 5 - GERAÇÃO DE ALIMENTOS:
- Para cada refeição, escolha 3-6 alimentos variados
- Garanta: proteína + carboidrato + gordura + fibras
- PRIORIZE alimentos que o usuário gosta
- EVITE alimentos que o usuário não gosta
- EVITE alimentos alérgenos (verificar condição médica)
- Adapte para condições médicas (ex: diabetes = controle de carboidratos, horários fixos)
- Use quantidades realistas que somem as calorias calculadas para aquela refeição

PASSO 6 - VALIDAÇÃO FINAL:
- Soma todas as calorias das refeições
- Verifique: soma = total calórico diário calculado (tolerância ±10 kcal)
- Verifique: descrição menciona o mesmo total calórico
- Verifique: refeições estão em ordem cronológica correta
- Verifique: nenhum alimento proibido foi incluído
- Verifique: pelo menos alguns alimentos preferidos foram incluídos
- Verifique: JSON válido e bem formatado

=== ANAMNESE DO USUÁRIO ===
<<<RESPOSTAS_ANAMNESE>>>

LEMBRE-SE CRITICAMENTE:
- Ordenar refeições cronologicamente (mais cedo → mais tarde)
- Calorias totais na descrição = soma das calorias das refeições (verificar antes de finalizar)
- Respeitar alergias (verificar condição médica)
- Priorizar alimentos que gosta, evitar alimentos que não gosta
- Adaptar para condições médicas (diabetes tipo I = controle rigoroso)
- Quantidades realistas e coerentes
"""

ADJUSTMENT_SUFFIX_TEMPLATE = """

=== AJUSTE DO PLANO DE DIETA ===

O usuário solicitou alterações no plano atual. Você deve gerar um NOVO plano completo aplicando TODAS as regras anteriores E as alterações solicitadas.

PLANO ATUAL EM JSON:
{plano_atual}

ALTERAÇÕES SOLICITADAS PELO USUÁRIO:
{ajustes}

=== REGRAS PARA O AJUSTE ===

1. MANTENHA TODAS AS REGRAS DO PROMPT DE GERAÇÃO:
   - Ordenar refeições cronologicamente (mais cedo → mais tarde)
   - Calorias totais na descrição = soma das calorias das refeições (VERIFICAR antes de finalizar)
   - Respeitar alergias e alimentos proibidos (verificar condição médica)
   - Priorizar alimentos que o usuário gosta
   - Evitar alimentos que o usuário não gosta
   - Adaptar para condições médicas (diabetes, etc.)
   - Quantidades realistas (3-6 alimentos por refeição)
   - Formato JSON exclusivo, sem texto adicional

2. APLIQUE AS ALTERAÇÕES SOLICITADAS:
   - Se pediu substituição de alimentos: substitua mantendo valor calórico similar
   - Se pediu ajuste de horários: reordene refeições cronologicamente
   - Se pediu mais/menos calorias: recalcule total e redistribua proporcionalmente
   - Se pediu mais/menos refeições: ajuste número mantendo ordem cronológica
   - Se pediu ajuste de quantidades: ajuste mantendo consistência calórica
   - Se mencionou alergia específica: REMOVA esse alimento completamente
   - Se pediu incluir alimentos preferidos: inclua nas refeições apropriadas

3. CONSISTÊNCIA CALÓRICA (CRÍTICO):
   - Recalcule o total calórico se necessário
   - Redistribua calorias proporcionalmente entre refeições
   - VALIDE: soma das calorias das refeições = total na descrição (tolerância ±10 kcal)
   - Atualize a descrição com o novo total calórico

4. ORDENAÇÃO (CRÍTICO):
   - Mantenha/ajuste ordem cronológica correta
   - Se horários foram alterados, reordene conforme novos horários
   - Nunca deixe refeições fora de ordem (ex: jantar antes de almoço)

5. VALIDAÇÃO FINAL:
   - Verifique: calorias consistentes (soma = total na descrição)
   - Verifique: ordem cronológica correta
   - Verifique: nenhum alimento proibido/alérgeno incluído
   - Verifique: alterações solicitadas foram aplicadas
   - Verifique: JSON válido

IMPORTANTE: Se o usuário mencionou alergia específica ou alimento que não pode comer, você DEVE remover completamente esse alimento. Se pediu incluir alimentos que gosta, você DEVE incluí-los. Sempre recalcule e valide as calorias após fazer ajustes.

Gere o NOVO plano completo em JSON, aplicando as alterações e mantendo TODAS as regras.
"""


def build_prompt(anamnese: PostAnamneseDieta) -> str:
    # Destacar alergias e condições médicas
    alergias_info = ""
    if anamnese.possui_alergias:
        # Se há alergias, verificar se há detalhes na condição médica
        condicao_info = (anamnese.possui_condicao_medica or '').lower()
        if any(termo in condicao_info for termo in ['alergia', 'alérgico', 'alérgica']):
            alergias_info = f"\n⚠️ ATENÇÃO - ALERGIAS: {anamnese.possui_condicao_medica}"
        else:
            alergias_info = "\n⚠️ ATENÇÃO - USUÁRIO POSSUI ALERGIAS (verificar condições médicas)"
    
    condicao_destaque = ""
    if anamnese.possui_condicao_medica and anamnese.possui_condicao_medica.lower() not in ['nenhuma', 'não', 'nada']:
        condicao_destaque = f"\n⚠️ CONDIÇÃO MÉDICA IMPORTANTE: {anamnese.possui_condicao_medica} - ADAPTAR DIETA RIGOROSAMENTE"

    anamnese_text = (
        f"ID do usuário: {anamnese.usuario_id}\n"
        f"Sexo: {anamnese.sexo}\n"
        f"Idade: {anamnese.idade}\n"
        f"Altura (m): {anamnese.altura}\n"
        f"Peso atual (kg): {anamnese.pesoatual}\n"
        f"Peso desejado (kg): {anamnese.pesodesejado}\n"
        f"Objetivo: {anamnese.objetivo}\n"
        f"Data meta: {anamnese.data_meta}\n"
        f"Avaliação da rotina: {anamnese.avalicao_rotina}\n"
        f"Orçamento disponível: {anamnese.orcamento}\n"
        f"Alimentos acessíveis: {'sim' if anamnese.alimentos_acessiveis else 'não'}\n"
        f"Come fora com frequência: {'sim' if anamnese.come_fora else 'não'}\n"
        f"Tipo de alimentação: {anamnese.tipo_alimentacao}\n"
        f"🍎 Alimentos que gosta (PRIORIZAR incluir): {anamnese.alimentos_gosta or 'nenhum'}\n"
        f"❌ Alimentos que NÃO gosta (EVITAR completamente): {anamnese.alimentos_nao_gosta or 'nenhum'}\n"
        f"Quantidade de refeições por dia: {anamnese.qtd_refeicoes}\n"
        f"Faz lanches entre refeições: {'sim' if anamnese.lanche_entre_refeicoes else 'não'}\n"
        f"Horário de alimentação: {anamnese.horario_alimentacao}\n"
        f"Prepara a própria refeição: {'sim' if anamnese.prepara_propria_refeicao else 'não'}\n"
        f"Onde costuma comer: {anamnese.onde_come}\n"
        f"Possui alergias: {'sim' if anamnese.possui_alergias else 'não'}{alergias_info}\n"
        f"Condição médica: {anamnese.possui_condicao_medica or 'nenhuma'}{condicao_destaque}\n"
        f"Usa suplementos: {'sim' if anamnese.uso_suplementos else 'não'}"
    )

    return PROMPT_TEMPLATE.replace("<<<RESPOSTAS_ANAMNESE>>>", anamnese_text)


def build_adjustment_prompt(anamnese: PostAnamneseDieta, plano_atual: dict, ajustes: str) -> str:
    base_prompt = build_prompt(anamnese)
    plano_json = json.dumps(plano_atual, ensure_ascii=False, indent=2)
    ajustes_texto = ajustes.strip() or "Sem ajustes adicionais fornecidos"
    return base_prompt + ADJUSTMENT_SUFFIX_TEMPLATE.format(
        plano_atual=plano_json,
        ajustes=ajustes_texto,
    )


class AdjustmentPayload(BaseModel):
    anamnese: PostAnamneseDieta
    plano_atual: dict = Field(..., alias="planoAtual")
    ajustes: str


@router.post("/gpt/dieta")
def gpt_dieta(anamnese: PostAnamneseDieta):
    """
    Gera um plano de dieta personalizado usando GPT com base na anamnese fornecida.
    Args:
        anamnese (PostAnamneseDieta): Dados da anamnese do usuário.
    Returns:
        dict: Resposta contendo o plano de dieta gerado.
    """
    prompt = build_prompt(anamnese)
    plano = gpt_response(prompt)
    print(plano)
    return {
        "message": "Plano gerado com sucesso",
        "plano": plano,
    }


@router.post("/gpt/dieta/ajustar")
def ajustar_dieta(payload: AdjustmentPayload):
    prompt = build_adjustment_prompt(payload.anamnese, payload.plano_atual, payload.ajustes)
    plano = gpt_response(prompt)
    print(plano)
    return {
        "message": "Plano de dieta ajustado com sucesso",
        "plano": plano,
    }


@router.post("/gpt/dieta/confirm")
def confirmar_dieta(payload: dict, session: Session = Depends(get_db_mysql)):
    """
    Confirma e persiste o plano de dieta gerado pelo GPT no banco de dados.
    Args:
        payload (dict): Dados contendo o plano de dieta a ser salvo.
        session (Session): Sessão do banco de dados.
    Returns:
        dict: Resposta indicando o sucesso da operação e detalhes do plano salvo.
    """
    try:
        resultado = persist_diet_plan(payload['plano'], session)
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

def persist_diet_plan(plano: dict, session: Session) -> dict:
    try:
        insert_dieta_query = text("""
        INSERT INTO TCC.DIETA (nome, descricao, id_usuario)
        VALUES (:nome, :descricao, :usuario);
        """)

        get_last_dieta_id_query = """
        SELECT id_dieta AS last_id from TCC.DIETA WHERE id_usuario = :usuario ORDER BY id_dieta DESC LIMIT 1;
        """

        insert_refeicoes_query = text("""
        INSERT INTO TCC.REFEICOES (id_dieta, tipo_refeicao, alimentos, calorias)
        VALUES (:id_dieta, :tipo_refeicao, :alimentos, :calorias);
        """)

        session.execute(insert_dieta_query, {
            "nome": plano["nome"],
            "descricao": plano["descricao"],
            "usuario": plano["usuario"],
        })

        last_dieta_id = consulta_get(get_last_dieta_id_query, session, {"usuario": plano["usuario"]})[0]["last_id"]

        refeicoes_inseridas = []
        for refeicao in plano["refeicoes"]:
            session.execute(insert_refeicoes_query, {
                "id_dieta": last_dieta_id,
                "tipo_refeicao": refeicao["tipoRefeicao"],
                "alimentos": refeicao["alimentos"],
                "calorias": refeicao["calorias"],
            })
            refeicoes_inseridas.append(refeicao)

        return {
            "programa": plano["nome"],
            "treinos_inseridos": refeicoes_inseridas,
            "plano": plano,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao persistir plano de dieta: {exc}") from exc