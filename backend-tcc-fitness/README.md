# Backend TCC fitness

Projeto backend do TCC, desenvolvido em Python 3.13 com FastAPI, gerenciado pelo [uv](https://docs.astral.sh/uv).
Abaixo como rodar essa aplicação.

## Pré-requisitos

- Python 3.13 ou superior  
- uv instalado (gerenciador oficial da Astral)
- MYSQL instalado no computador e rodando.
- criar **.env** para configuração de variáveis de ambiente.

## Instalação do uv
``` bash
# Windows (PowerShell):
irm https://astral.sh/uv/install.ps1 | iex
```
``` bash
# Linux / macOS:
curl -LsSf https://astral.sh/uv/install.sh | sh
```
``` bash
# Após a instalação, feche e reabra o terminal e confirme:
uv --version
# (deve aparecer algo como: uv 0.9.5 (https://astral.sh/uv))
```
## Configuração do ambiente
Para instalar todas as dependências do projeto:
``` bash
uv sync
```

Esse comando cria automaticamente o ambiente virtual do projeto e instala todas as dependências listadas no pyproject.toml.

## Execução da aplicação

O projeto possui uma task configurada chamada `start`, que executa o servidor FastAPI em modo de produção:

No `pyproject.toml`, a task está configurada assim:
[tool.taskipy.tasks]
start = "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

Rode o comando:
``` bash
uv run task start
```


O servidor será iniciado e poderá ser acessado em http://127.0.0.1:8000


## Referências

- [Documentação oficial do uv](https://docs.astral.sh/uv)  
- [FastAPI](https://fastapi.tiangolo.com/)
