# Estrutura de Prompt Engineering - Figura para Documentação

## Figura 1: Estrutura Hierárquica do Prompt

```
┌─────────────────────────────────────────────────────────┐
│           PROMPT COMPLETO PARA O LLM                    │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   1. PAPEL   │ │ 2. REGRAS    │ │ 3. ESQUEMA   │
│   (ROLE)     │ │  CRÍTICAS    │ │    JSON      │
│              │ │              │ │              │
│ "Você é uma  │ │ • Apenas JSON│ │ {            │
│  IA esp...   │ │ • Sem texto  │ │   "campo":   │
│              │ │ • Formato    │ │    valor     │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  4. REGRAS   │ │  5. PROCESSO │ │  6. ANAMNESE │
│FUNDAMENTAIS  │ │  DE GERAÇÃO  │ │   (DADOS)    │
│              │ │              │ │              │
│ • Mín 5 ex   │ │ PASSO 1:     │ │ • Idade      │
│ • Distribui  │ │ Interpretar  │ │ • Objetivos  │
│ • Cronolog.  │ │ PASSO 2:     │ │ • Restrições │
│              │ │ Calcular     │ │ • Preferências│
└──────────────┘ │ PASSO 3:     │ └──────────────┘
                 │ Gerar        │
                 │ PASSO 4:     │
                 │ Validar      │
                 └──────────────┘
```

## Figura 2: Fluxo de Construção do Prompt

```
[ANAMNESE DO USUÁRIO]
        │
        ▼
┌─────────────────────────────┐
│   build_prompt(anamnese)    │
│                             │
│ 1. Carrega PROMPT_TEMPLATE  │
│ 2. Formata dados anamnese   │
│ 3. Substitui placeholder    │
│    <<<RESPOSTAS_ANAMNESE>>> │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│    PROMPT COMPLETO          │
│  (com todas as seções)      │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│    GPT-4o Mini              │
│  (Fine-Tuned)               │
│                             │
│ Processa e gera JSON        │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│   VALIDAÇÃO                 │
│                             │
│ ✓ Formato JSON              │
│ ✓ Campos obrigatórios       │
│ ✓ Regras respeitadas        │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│   JSON ESTRUTURADO          │
│   (Pronto para uso)         │
└─────────────────────────────┘
```

## Figura 3: Comparação entre Prompt de Geração e Ajuste

```
┌────────────────────────────────────────────────────────────┐
│              PROMPT DE GERAÇÃO                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  PROMPT_TEMPLATE (Base)                              │ │
│  │  • Definição de Papel                                │ │
│  │  • Regras Críticas                                   │ │
│  │  • Esquema JSON                                      │ │
│  │  • Regras Fundamentais                              │ │
│  │  • Processo de Geração                              │ │
│  │  • <<<RESPOSTAS_ANAMNESE>>>                          │ │
│  └──────────────────────────────────────────────────────┘ │
│                        │                                    │
│                        ▼                                    │
│              build_prompt(anamnese)                        │
│                        │                                    │
│                        ▼                                    │
│              Prompt Completo                               │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│              PROMPT DE AJUSTE                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  PROMPT_TEMPLATE (Base)                              │ │
│  │  • [Mesmas seções do prompt de geração]             │ │
│  └──────────────────────────────────────────────────────┘ │
│                        │                                    │
│                        +                                    │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ADJUSTMENT_SUFFIX                                   │ │
│  │  • Plano Atual (JSON)                                │ │
│  │  • Alterações Solicitadas (Texto)                   │ │
│  │  • Regras Específicas de Ajuste                     │ │
│  │  • Mantém TODAS as regras do prompt de geração      │ │
│  └──────────────────────────────────────────────────────┘ │
│                        │                                    │
│                        ▼                                    │
│        build_adjustment_prompt(anamnese, plano, ajustes)  │
│                        │                                    │
│                        ▼                                    │
│              Prompt de Ajuste Completo                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Descrição Textual para a Documentação

A estrutura dos prompts segue um padrão hierárquico bem definido, composto por seis componentes principais:

1. **Definição de Papel (Role Definition)**: Estabelece que a IA atua como especialista em prescrição de treinos ou dietas, definindo claramente seu papel no contexto.

2. **Regras Críticas de Formato (Critical Format Rules)**: Estabelece que a resposta deve ser exclusivamente JSON, sem texto adicional, garantindo compatibilidade direta com o sistema.

3. **Esquema JSON Obrigatório (JSON Schema)**: Define a estrutura exata esperada, incluindo campos obrigatórios, tipos de dados e valores permitidos.

4. **Regras Fundamentais (Fundamental Rules)**: Contém as regras de domínio específicas:
   - Para treinos: mínimo de exercícios, distribuição de grupos musculares, adaptação para lesões
   - Para dietas: ordem cronológica, consistência calórica, respeito a alergias e preferências

5. **Processo de Geração (Generation Process)**: Descreve o processo passo a passo (Chain of Thought) que a IA deve seguir, desde a interpretação até a validação final.

6. **Anamnese do Usuário (User Anamnese)**: Dados do usuário inseridos no placeholder `<<<RESPOSTAS_ANAMNESE>>>`, incluindo características físicas, objetivos, restrições e preferências.

O prompt de ajuste inclui todas as seções do prompt de geração, adicionando o plano atual e as alterações solicitadas pelo usuário, mantendo a consistência das regras fundamentais.

