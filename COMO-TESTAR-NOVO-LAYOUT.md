# 🧪 Como Testar o Novo Layout

## Acessar a Nova Página

Para testar o novo layout sem afetar a página atual, acesse:

```
http://localhost:3000/create-post-new.html
```

ou 

```
http://seudominio.com/create-post-new.html
```

## ✅ Checklist de Testes

### 1. **Teste os Botões Laterais**
- [ ] Clique em cada um dos 9 botões de controle
- [ ] Verifique se os modals abrem corretamente
- [ ] Teste o botão X para fechar os modals
- [ ] Clique fora do modal para fechá-lo

### 2. **Teste o Modal FONTES**
- [ ] Abra o modal de Fontes
- [ ] Clique no botão "Fontes" para mostrar Google Fonts
- [ ] Busque por uma fonte
- [ ] Selecione uma fonte
- [ ] Verifique se o preview atualiza

### 3. **Teste o Modal BACKGROUND**
- [ ] Abra o modal de Background
- [ ] Selecione diferentes backgrounds
- [ ] Verifique se o preview atualiza

### 4. **Teste o Modal IMAGEM**
- [ ] Abra o modal de Imagem
- [ ] Clique em "Buscar" para imagens Pexels
- [ ] Teste as categorias (Tecnologia, Cidade, etc.)
- [ ] Busque por uma palavra-chave
- [ ] Selecione uma imagem
- [ ] Teste o upload de imagem personalizada

### 5. **Teste o Modal LOGO**
- [ ] Abra o modal de Logo
- [ ] Faça upload de uma logo
- [ ] Ajuste o tamanho da logo
- [ ] Ajuste a posição (X e Y)
- [ ] Clique em "Remover Logo"

### 6. **Teste o Modal TEXT COLOR**
- [ ] Abra o modal de Text Color
- [ ] Selecione diferentes cores
- [ ] Teste os efeitos de texto (sombra, brilho, 3D)
- [ ] Verifique se o preview atualiza

### 7. **Teste o Modal TEXT POSITION**
- [ ] Abra o modal de Text Position
- [ ] Clique em "Acima"
- [ ] Clique em "No Meio"
- [ ] Clique em "Em Baixo"
- [ ] Verifique se o texto muda de posição no preview

### 8. **Teste o Modal ÍCONES**
- [ ] Abra o modal de Ícones
- [ ] Escolha uma cor no color picker
- [ ] Adicione um círculo
- [ ] Adicione um retângulo
- [ ] Adicione uma linha
- [ ] Clique em "Ícone" para adicionar ícones

### 9. **Teste o Modal OPACIDADE**
- [ ] Abra o modal de Opacidade
- [ ] Leia as instruções
- [ ] Teste o controle de opacidade nas camadas do canvas

### 10. **Teste o Modal CONTEÚDO**
- [ ] Abra o modal de Conteúdo
- [ ] Digite um título
- [ ] Digite um conteúdo
- [ ] Verifique se o preview atualiza em tempo real
- [ ] Clique em "Aplicar"
- [ ] Verifique se os campos do formulário foram preenchidos

### 11. **Teste o Preview**
- [ ] Verifique se o preview está sempre visível
- [ ] Role a página e veja se o preview fica fixo
- [ ] Teste diferentes resoluções de tela

### 12. **Teste os Templates**
- [ ] Role até a seção de Templates (abaixo do preview)
- [ ] Clique em diferentes templates
- [ ] Verifique se aplicam corretamente

### 13. **Teste os Presets de Tamanho**
- [ ] Clique em "1:1 Post" (1080×1080)
- [ ] Clique em "9:16 Stories" (1080×1920)
- [ ] Clique em "Link Preview" (1200×628)
- [ ] Verifique se o canvas muda de tamanho

### 14. **Teste o Formulário de Criação**
- [ ] Role até o formulário no final
- [ ] Preencha o título
- [ ] Preencha o conteúdo
- [ ] Adicione hashtags
- [ ] Selecione plataformas
- [ ] Clique em "Salvar Rascunho"
- [ ] Clique em "Publicar"

### 15. **Teste Responsividade**
- [ ] Teste em tela grande (desktop)
- [ ] Teste em tela média (tablet)
- [ ] Teste em tela pequena (mobile)

## 🐛 O Que Observar

### Problemas Comuns:
1. **Modals não abrem**: Verificar console do navegador
2. **Preview não atualiza**: Verificar se as funções JS estão carregadas
3. **Botões não funcionam**: Verificar console para erros
4. **Layout quebrado**: Verificar CSS

### Console do Navegador
Pressione F12 e vá para a aba "Console" para ver mensagens de erro

## ✅ Se Tudo Funcionar

Quando todos os testes passarem, você pode substituir a página original:

```bash
cd public
# Fazer backup adicional
copy create-post.html create-post-old-backup.html

# Substituir pelo novo
copy create-post-new.html create-post.html
```

## 🔄 Se Algo Der Errado

Para voltar à versão original:

```bash
cd public
# Restaurar do backup
copy create-post-backup.html create-post.html
```

## 📞 Suporte

Se encontrar problemas:
1. Anote qual teste falhou
2. Abra o console do navegador (F12)
3. Copie as mensagens de erro
4. Informe para correção

---

**Importante**: Não substitua a página original antes de testar TODAS as funcionalidades!

