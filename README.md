# ASHFALL — Development Hub

Site estático de apresentação e changelog do ASHFALL, pronto para GitHub Pages.

## 1. Testar sem publicar

**Windows:** extraia o ZIP, abra a pasta e clique duas vezes em `ABRIR_SITE.bat`.

O navegador deve abrir `http://localhost:8765`. Caso não abra automaticamente, copie esse endereço. Requer Python instalado no Windows (ou o launcher `py`). Para parar o servidor, feche o terminal ou aperte Ctrl+C.

**Linux/macOS:** dentro da pasta, execute `sh ABRIR_SITE.sh` e abra `http://localhost:8765`.

Por segurança e compatibilidade, não recomendamos abrir `site/index.html` diretamente por `file://`: o navegador pode bloquear a leitura do JSON.

## 2. O que o site apresenta agora

Retrato da Alpha conferido em **26/10/2026**:

- Cinco origens jogáveis e suas armas iniciais, com seleção por clique ou teclado.
- Combate, hordas, experiência e Guardião da Fenda na Alpha.
- Build do Arauto: passivas, mutações e Pandemia em Cadeia.
- Estados separados: **na Alpha**, **em avaliação** e **próximos passos**.
- Novidades com filtros, contagem, datas e links diretos para cada nota.
- Galeria ampliada com as quatro artes conceituais já presentes no site.
- Layout responsivo, navegação de teclado, foco visível e respeito à preferência por reduzir movimentos.

O polimento de cartas/HUD está **em avaliação**, não apresentado como integrado. As três novas magias e a primeira evolução do Incensário são próximos passos. Não há download público ou data de lançamento anunciada.

O conteúdo é resumido e público. Este repositório **não contém código, logs, capturas privadas ou builds do jogo**. As imagens são conceitos, não capturas de gameplay.

## 3. Como registrar atualizações

Abra `site/data/content.json` num editor de texto e adicione uma entrada a `updates`, seguindo este exemplo:

```json
{
  "id": "alpha-001",
  "version": "ALPHA 0.1",
  "date": "2026-10-25",
  "category": "gameplay",
  "title": "Primeira atualização pública",
  "summary": "Um breve texto descrevendo uma mudança REAL e testada.",
  "highlights": ["Mudança A", "Mudança B"],
  "approved": true
}
```

Categorias possíveis: `arte`, `gameplay`, `sistemas`, `site`. Use IDs diferentes em cada entrada. A data e os resultados devem ser reais. **Só use `approved: true` depois que o criador autorizar a divulgação. **Não envie rascunhos `approved: false` a este repositório público**: o validador bloqueará o deploy, mas o código fonte enviado para o GitHub ainda seria legível.** O validador impede entradas aprovadas com campos essenciais vazios; não comprova que o conteúdo é verdadeiro ou apropriado para o público.

Esta atualização contém a nota inicial e cinco notas sobre o momento atual do projeto. `status` diferencia `integrado`, `avaliacao` e `planejado`; a aprovação editorial de uma nota não significa que a funcionalidade já entrou na Alpha.

### Imagens

Copie a imagem otimizada para `site/assets/`, depois adicione uma entrada a `gallery` com `approved: true` após a autorização. As quatro artes incluídas são **conceituais, não capturas do jogo**; nesta edição estão visíveis na galeria pública. Confirme se autoriza a divulgação dessas imagens antes de publicar. Não publique imagens novas sem permissão.

## 4. Publicação no GitHub Pages

O repositório do site já é `ASHFALL-SITE`. As mudanças são propostas em um ramo próprio. Depois da aprovação e integração em `main`, o workflow **ASHFALL Site — Validar e publicar** executa as verificações e publica somente a pasta `site/`.

A hospedagem continua no GitHub Pages, sem migração. Em `Settings` → `Pages`, a origem deve continuar como **GitHub Actions**. Consulte a execução do workflow para confirmar o endereço publicado.

O site é público. Os metadados `noindex` e `robots.txt` continuam presentes, mas não restringem acesso. Somente resumos e imagens autorizados devem entrar neste repositório.

## 5. Atualizar o retrato do jogo

A atualização atual é pontual, conforme o pedido do criador. **Não há sincronização contínua com o repositório privado do jogo.**

Edite `site/data/content.json`:

- `game`: data da conferência, resumo e listas do que está integrado/em avaliação/planejado.
- `origins`: cinco origens, papéis, armas e mecânicas realmente jogáveis.
- `roadmap`: etapas e seus estados.
- `updates`: notas públicas com datas reais e estado explícito.
- `gallery`: somente imagens autorizadas, locais e com identificação de conceito/gameplay.

Antes de chamar algo de integrado, confira a versão principal do jogo. Propostas e PRs abertos continuam em avaliação. Não importe automaticamente textos, arquivos ou relatórios do repositório privado.

Faça as alterações em um ramo próprio e abra um PR. O workflow valida os dados, os links e o JavaScript; ao integrar em `main`, o GitHub Pages publica os arquivos do site. O criador aprova conteúdo, imagens e publicação antes do merge em `main`.

## 6. Verificação local

Na raiz deste pacote, execute:

```sh
python scripts/validate_content.py
python -m unittest discover -s scripts -p 'test_*.py' -v
node --check site/app.js
node scripts/content-model.test.mjs
```

## 7. Segurança editorial

- O site é público, mesmo que o endereço circule só entre amigos.
- `noindex` não é controle de acesso.
- Não compartilhar relatórios de crash, locais privados, credenciais, logs com dados pessoais, builds internas ou código-fonte do jogo.
- Nunca enviar para o site notas retiradas automaticamente de todo commit/PR sem revisão de conteúdo.
- Para o site mostrar novidades, edite o JSON e envie um PR ao repositório do site.
