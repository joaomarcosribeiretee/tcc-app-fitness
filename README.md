# 📱 TCC App Fitness

![Badge em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge)

## 📝 Descrição do Projeto

O **TCC App Fitness** é um projeto desenvolvido como Trabalho de Conclusão de Curso, focado na criação de um aplicativo de fitness que auxilia usuários na montagem de programas de treino, acompanhamento de rotinas e integração com inteligência artificial (IA) para sugestões personalizadas de treinos e dietas.

O aplicativo combina práticas modernas de desenvolvimento mobile, arquitetura de software e inteligência artificial, utilizando modelos de linguagem (LLMs) com fine-tuning via API.

---
## 🧠 Contribuidores

- Gabriel Souza de Carvalho-
- Jefferson da Silva de Souza
- João Marcos Ribeirete Garbelini

## 📂 Estrutura do Repositório

- `diagramas-modelio/` → Diagramas UML criados no Modelio.
- `documentacao/` → Documentação completa do projeto (PDFs, apresentações, relatórios).
- `codigo-fonte/` → Código-fonte do aplicativo (em desenvolvimento).

---

## 🚀 Tecnologias Utilizadas

- **React Native** → Desenvolvimento Mobile
- **Realm** → Banco de dados local orientado a objetos
- **OpenAI GPT-3.5 Turbo** → IA via API com Fine-tuning
- **Figma** → Prototipação das interfaces
- **Modelio** → Modelagem UML (Diagramas)
- **GitHub** → Versionamento e colaboração

---

## 🗺️ Organização do Projeto

O desenvolvimento deste projeto segue uma metodologia baseada no processo **ICONIX**, dividida em cinco macro etapas:

1. **Revisão Bibliográfica**  
2. **Análise de Requisitos + Modelagem (Modelo de Domínio + Casos de Uso + Protótipos)**  
3. **Projeto Preliminar (Diagramas de Robustez)**  
4. **Projeto Detalhado (Diagramas de Classes e de Sequência)**  
5. **Implementação do Protótipo**

---

## 📜 Especificação Funcional

### ✅ Requisitos Funcionais (RF)

**🔐 Autenticação**
- RF01: Cadastro de usuário com nome, e-mail e senha.
- RF02: Login com e-mail e senha.
- RF03: Logout a qualquer momento.

**🏋️ Gestão de Treinos**
- RF04: Criar programa de treino personalizado (ex.: PUSH, PULL, LEGS).
- RF05: Adicionar exercícios, séries, repetições e peso (peso e reps opcionais na criação).
- RF06: Iniciar rotina com base no treino salvo e preencher os dados realizados.
- RF07: Salvar histórico das rotinas finalizadas.
- RF08: Sugestão automática dos últimos pesos e repetições utilizados.
- RF09: Treino rápido sem plano prévio, adicionando exercícios durante a execução.
- RF10: Banco de dados com exercícios pré-cadastrados.
- RF11: Treino Inteligente gerado por IA via formulário preenchido pelo usuário.
- RF12: Permitir aceitar, recusar ou solicitar alterações no treino gerado.
- RF13: Salvar o treino gerado na lista de programas do usuário.
- RF14: Visualizar histórico completo de rotinas passadas.

**🥗 Gestão de Dieta**
- RF15: Criar programa de dieta manual, definindo refeições e alimentos.
- RF16: Calcular automaticamente os macronutrientes de cada refeição.
- RF17: Visualizar total diário de calorias e macros.
- RF18: Dieta Inteligente gerada por IA após formulário preenchido.
- RF19: Permitir aceitar, recusar ou solicitar alterações na dieta gerada.
- RF20: Salvar a dieta aceita no programa do usuário.

**📊 Perfil e Evolução**
- RF21: Editar perfil com nome, foto e biografia.
- RF22: Visualizar feed/histórico com todas as rotinas realizadas.
- RF23: Acessar rotinas passadas com detalhes por exercício.
- RF24: Visualizar evolução com gráficos de carga, volume e frequência.

---

### 🚀 Requisitos Não Funcionais (RNF)

- RNF01: Aplicativo compatível com Android e iOS.
- RNF02: Dados armazenados localmente (Realm) e na nuvem via API.
- RNF03: As respostas da IA devem ocorrer em até X segundos.
- RNF04: Conformidade com a LGPD — proteção dos dados dos usuários.
- RNF05: Frontend responsivo e com navegação fluida.
- RNF06: A IA GPT-3.5-Turbo será utilizada com Fine-tuning remoto via API.
- RNF07: IA executada apenas remotamente, sem processamento local.

---

## 📥 Como Executar (Futuro)

```bash
# Clone o repositório
git clone https://github.com/joaomarcosribeiretee/tcc-app-fitness.git
