# Como Conectar o App Mobile ao Backend Local

## Problema
Quando você testa no navegador, funciona porque usa `localhost`, mas no celular isso não funciona. O celular precisa do IP da sua máquina na rede local.

## Solução Passo a Passo

### 1. Descubra o IP da sua máquina na rede Wi-Fi

**Windows:**
```powershell
ipconfig
```
Procure por "Adaptador de Rede Sem Fio Wi-Fi" ou similar e copie o "Endereço IPv4"

**Ou execute o script:**
```bash
cd backend-tcc-fitness
./get_ip.bat
```

### 2. Configure o IP no Frontend

Edite o arquivo `src/domain/repositories/HttpAuthRepository.ts`:

```typescript
private baseURL = 'http://SEU_IP_AQUI:8000' // Ex: http://192.168.0.105:8000
```

### 3. Inicie o Backend em modo de acesso externo

**IMPORTANTE:** O backend precisa estar acessível na rede local. Execute:

```bash
cd backend-tcc-fitness
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

Ou edite o `pyproject.toml` para sempre usar `--host 0.0.0.0`:

```toml
[tool.taskipy.tasks]
s = "uvicorn main:app --reload --host 0.0.0.0 --port 8000"
```

### 4. Verifique o Firewall

O Windows pode estar bloqueando a conexão:

1. Abra "Firewall do Windows Defender"
2. Clique em "Permitir um aplicativo pelo firewall"
3. Ou simplesmente desative temporariamente o firewall para testar

### 5. Certifique-se que o Celular está na mesma rede Wi-Fi

Ambos (PC e celular) devem estar na **mesma rede Wi-Fi**.

### 6. Teste a Conexão

Execute no celular e verifique os logs no console. Você deve ver:
```
📡 URL: http://192.168.x.x:8000/api/login
```

## Solução Alternativa: Tunneling (Para desenvolvimento)

Se os passos acima não funcionarem, use um túnel como ngrok:

```bash
ngrok http 8000
```

Depois use a URL do ngrok no frontend (mas mude para HTTPS):
```typescript
private baseURL = 'https://xxxx-xxx-xxx.ngrok.io'
```

## Troubleshooting

**"Network request timed out"**
- Verifique se o IP está correto
- Verifique se o backend está rodando
- Verifique se o firewall está permitindo a conexão
- Certifique-se que ambos estão na mesma rede Wi-Fi

**"Connection refused"**
- O backend não está acessível na rede
- Use `--host 0.0.0.0` ao iniciar o backend
- Verifique o firewall

**Funciona no navegador mas não no celular**
- Certo! No navegador usa `localhost`, no celular precisa do IP da máquina
- Siga os passos acima

