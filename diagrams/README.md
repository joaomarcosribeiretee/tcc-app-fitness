# 📊 Diagramas do Projeto - TCC Fitness App

Este diretório contém todos os diagramas relacionados ao projeto, organizados por metodologia e tipo.

## 📋 Índice

- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Diagramas ICONIX](#diagramas-iconix)
- [Vistas Arquiteturais 4+1](#vistas-arquiteturais-41)
- [Diagramas de Prompt Engineering](#diagramas-de-prompt-engineering)
- [Como Visualizar](#como-visualizar)
- [Notas sobre os Diagramas](#notas-sobre-os-diagramas)

---

## 📂 Estrutura de Diretórios

```
diagrams/
├── README.md                    # Este arquivo
│
├── ICONIX/                      # Diagramas ICONIX
│   ├── 01_Modelo_Dominio.puml
│   ├── 02_Casos_Uso.puml
│   ├── 03_Robustez_UC03_GerarTreino.puml
│   ├── 04_Robustez_UC08_GerarDieta.puml
│   ├── 05_Robustez_UC01_Login.puml
│   ├── 07_Sequencia_UC01_Login.puml
│   ├── 08_Sequencia_UC03_GerarTreino.puml
│   ├── 09_Sequencia_UC08_GerarDieta.puml
│   └── 11_Diagrama_Classes.puml
│
├── 4+1/                         # Vistas Arquiteturais (Kruchten)
│   ├── 12_4+1_Vista_Logica.puml
│   ├── 13_4+1_Vista_Processo.puml
│   ├── 14_4+1_Vista_Desenvolvimento.puml
│   ├── 15_4+1_Vista_Fisica.puml
│   └── 16_4+1_Vista_Cenarios.puml
│
└── Prompt Engineering/          # Diagramas de Prompt Engineering
    ├── 17_Estrutura_Prompt_Engineering.puml
    └── 18_Fluxo_Construcao_Prompt.puml
```

---

## 📐 Diagramas ICONIX

A metodologia **ICONIX** foi utilizada para modelagem do sistema. Os diagramas seguem a sequência padrão do ICONIX Process.

### 1. Modelo de Domínio (`01_Modelo_Dominio.puml`)
**Tipo:** Diagrama de Classes Conceitual  
**Propósito:** Define as entidades principais do sistema e seus relacionamentos.

**Entidades Principais:**
- Usuario
- ProgramaTreino, Treino, ExercicioTreino
- PlanoDieta, Refeicao
- SessaoTreino, Serie
- AnamneseTreino, AnamneseDieta

### 2. Casos de Uso (`02_Casos_Uso.puml`)
**Tipo:** Diagrama de Casos de Uso  
**Propósito:** Apresenta as funcionalidades do sistema do ponto de vista do usuário.

**Casos de Uso Principais:**
- Autenticação (Login, Cadastro)
- Treinos (Gerar, Ajustar, Aceitar/Recusar, Executar)
- Dietas (Gerar, Ajustar, Aceitar/Recusar)

### 3-5. Diagramas de Robustez
**Tipo:** Diagrama de Robustez  
**Propósito:** Refina casos de uso identificando Boundary, Control e Entity objects.

**Diagramas:**
- `03_Robustez_UC03_GerarTreino.puml` - Geração de planos de treino
- `04_Robustez_UC08_GerarDieta.puml` - Geração de planos de dieta
- `05_Robustez_UC01_Login.puml` - Autenticação

### 6-8. Diagramas de Sequência
**Tipo:** Diagrama de Sequência  
**Propósito:** Mostra as interações detalhadas entre objetos durante a execução de casos de uso.

**Diagramas:**
- `07_Sequencia_UC01_Login.puml` - Fluxo de autenticação
- `08_Sequencia_UC03_GerarTreino.puml` - Fluxo de geração de treinos
- `09_Sequencia_UC08_GerarDieta.puml` - Fluxo de geração de dietas

### 9. Diagrama de Classes (`11_Diagrama_Classes.puml`)
**Tipo:** Diagrama de Classes  
**Propósito:** Estrutura final das classes do sistema com estereótipos ICONIX (Boundary, Control, Entity).

---

## 🏛️ Vistas Arquiteturais 4+1

O modelo **4+1 de Kruchten** apresenta o sistema através de cinco vistas arquiteturais.

### 1. Vista Lógica (`12_4+1_Vista_Logica.puml`)
**Propósito:** Mostra os componentes do sistema e suas responsabilidades.

**Componentes:**
- Frontend (Presentation, Domain, Infrastructure)
- Backend (API, Business Logic, Data)
- Integração com IA

### 2. Vista de Processo (`13_4+1_Vista_Processo.puml`)
**Propósito:** Apresenta os fluxos principais de interação entre componentes.

**Fluxos:**
- Autenticação
- Geração de Planos
- Aceitação de Planos
- Execução de Treinos

### 3. Vista de Desenvolvimento (`14_4+1_Vista_Desenvolvimento.puml`)
**Propósito:** Organização hierárquica do código em pacotes e módulos.

### 4. Vista Física (`15_4+1_Vista_Fisica.puml`)
**Propósito:** Infraestrutura e deploy do sistema.

**Componentes:**
- Dispositivo Móvel (Frontend)
- Servidor Backend
- Banco de Dados MySQL
- API OpenAI (Cloud)

### 5. Vista de Cenários (`16_4+1_Vista_Cenarios.puml`)
**Propósito:** Casos de uso principais que validam as outras vistas.

**Cenários:**
- Geração de Plano de Treino
- Ajuste de Plano
- Aceitação e Persistência

---

## 🤖 Diagramas de Prompt Engineering

### 1. Estrutura do Prompt (`17_Estrutura_Prompt_Engineering.puml`)
**Propósito:** Mostra a estrutura hierárquica de um prompt usado para geração de planos.

**Componentes:**
- Role (Papel da IA)
- Regras de Formato
- Esquema JSON
- Regras Fundamentais
- Processo de Geração
- Anamnese (Dados do Usuário)

### 2. Fluxo de Construção (`18_Fluxo_Construcao_Prompt.puml`)
**Propósito:** Apresenta o processo de construção de um prompt a partir dos dados do usuário.

**Fluxo:**
1. Receber Anamnese
2. Selecionar Template
3. Inserir Dados
4. Validar Prompt
5. Enviar para IA

---

## 👁️ Como Visualizar

### Opção 1: VS Code (Recomendado)

1. Instale a extensão **PlantUML**:
   ```
   Extensions → Buscar "PlantUML" → Instalar
   ```

2. Abra qualquer arquivo `.puml`

3. Pressione `Alt + D` ou clique em "Preview" para visualizar

4. Exporte como PNG/SVG: `Ctrl + Shift + P` → "PlantUML: Export Current Diagram"

### Opção 2: Site Online

1. Acesse: http://www.plantuml.com/plantuml/uml/

2. Cole o conteúdo do arquivo `.puml`

3. O diagrama será renderizado automaticamente

4. Clique em "Download" para salvar como PNG/SVG

### Opção 3: Ferramenta Desktop

1. Baixe o PlantUML: http://plantuml.com/download

2. Instale Java (necessário para PlantUML)

3. Use o arquivo JAR ou integre com sua IDE

### Opção 4: Extensão para Outras IDEs

- **IntelliJ IDEA:** Plugin PlantUML
- **Eclipse:** PlantUML Plugin
- **Atom:** plantuml-viewer

---

## 📝 Notas sobre os Diagramas

### Convenções ICONIX

- **Actor** 👤 - Usuário ou sistema externo
- **Boundary** ⭕ - Interface (UI, API)
- **Control** ⚡ - Lógica de negócio (Controllers, Use Cases)
- **Entity** 📦 - Dados (Models, Database)

### Regras de Robustez

1. **Ator** só interage com **Boundary**
2. **Boundary** só interage com **Control** e **Ator**
3. **Control** interage com **Boundary**, **Entity** e outros **Controls**
4. **Entity** só interage com **Control**

### Nível Conceitual

Todos os diagramas estão no **nível conceitual**, focando em:
- ✅ **O que** o sistema faz
- ✅ **Como** os componentes interagem
- ❌ **Não** detalhes de implementação
- ❌ **Não** código específico

---

## 🔄 Versões dos Diagramas

### Última Atualização
- **Data:** [Data]
- **Versão:** 1.0.0 Final
- **Status:** ✅ Alinhados com código e metodologia ICONIX

### Histórico de Mudanças

- ✅ Diagramas de Robustez e Sequência corrigidos (persistência apenas na confirmação)
- ✅ Vista de Processo simplificada
- ✅ Vista de Desenvolvimento atualizada com estrutura real do projeto
- ✅ Diagramas de Prompt Engineering criados

---

## 📚 Referências

### Metodologia ICONIX
- [ICONIX Process Overview](http://www.iconixprocess.com/)
- Livro: "Use Case Driven Object Modeling with UML" - Doug Rosenberg

### Modelo 4+1
- Artigo: "Architectural Blueprints—The 4+1 View Model of Software Architecture" - Philippe Kruchten
- IEEE Software, 1995

### PlantUML
- [Documentação Oficial](https://plantuml.com/)
- [Sintaxe de Diagramas](https://plantuml.com/guide)

---

## ❓ Perguntas Frequentes

### Q: Por que usar PlantUML ao invés de ferramentas visuais?
**R:** PlantUML permite versionamento dos diagramas no Git, é texto puro e fácil de manter.

### Q: Os diagramas estão atualizados com o código?
**R:** Sim, todos os diagramas foram revisados e atualizados para refletir a implementação atual do projeto.

### Q: Posso modificar os diagramas?
**R:** Sim! Os arquivos `.puml` podem ser editados diretamente. Siga as convenções ICONIX ao fazer alterações.

### Q: Como exportar os diagramas para o documento do TCC?
**R:** Use a extensão PlantUML no VS Code ou o site online para exportar como PNG/SVG de alta resolução.

---

**Última atualização:** [Data]

