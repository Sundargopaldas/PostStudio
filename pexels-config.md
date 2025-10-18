# Configuração da API do Pexels

## Como obter sua chave da API do Pexels:

1. **Acesse**: https://www.pexels.com/api/
2. **Crie uma conta** gratuita no Pexels
3. **Solicite sua chave de API** gratuita
4. **Configure a chave** no seu sistema

## Configuração no servidor:

### Opção 1: Variável de ambiente
```bash
# No terminal, antes de iniciar o servidor:
export PEXELS_API_KEY=sua_chave_aqui
node server.js
```

### Opção 2: Arquivo .env
Crie um arquivo `.env` na raiz do projeto:
```
PEXELS_API_KEY=sua_chave_aqui
```

### Opção 3: Modificar diretamente no código
No arquivo `server.js`, linha 491, substitua:
```javascript
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY_HERE';
```

Por:
```javascript
const PEXELS_API_KEY = 'sua_chave_real_aqui';
```

## Limites da API gratuita:
- **200 requisições por hora**
- **20.000 requisições por mês**
- **Atribuição obrigatória** ao Pexels

## Teste da API:
Após configurar, teste acessando:
- http://localhost:3000/api/pexels/images?query=nature
- http://localhost:3000/api/pexels/images?query=technology&page=1&per_page=10
