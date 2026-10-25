# ASHFALL — Development Hub

Site estático de apresentação e changelog do ASHFALL, pronto para GitHub Pages.

## 1. Testar sem publicar

**Windows:** extraia o ZIP, abra a pasta e clique duas vezes em `ABRIR_SITE.bat`.

O navegador deve abrir `http://localhost:8765`. Caso não abra automaticamente, copie esse endereço. Requer Python instalado no Windows (ou o launcher `py`). Para parar o servidor, feche o terminal ou aperte Ctrl+C.

**Linux/macOS:** dentro da pasta, execute `sh ABRIR_SITE.sh` e abra `http://localhost:8765`.

Por segurança e compatibilidade, não recomendamos abrir `site/index.html` diretamente por `file://`: o navegador pode bloquear a leitura do JSON.

## 2. O que já funciona

- Página inicial e identidade ASHFALL, layout adaptável para celular.
- Universo, funcionalidades, classes e roteiro do jogo.
- Changelog alimentado por `site/data/content.json`.
- Filtros interativos por categoria (arte, gameplay, sistemas, site).
- Galeria com visualização ampliada de imagens.
- O pacote público não inclui rascunhos `approved: false`. Em repositórios públicos, esconder itens no JavaScript não impede a leitura dos arquivos diretamente.
- Workflow de GitHub Actions que valida o conteúdo em Pull Requests e publica o site após merge/push na `main`.
- Metadados `noindex` e `robots.txt` para pedir aos motores de busca que não indexem o site (isso NÃO restringe acesso).

**Observação importante:** a capa, a seção de história e a galeria exibem artes conceituais. Confira se concorda com a divulgação antes de publicar. Este projeto não contém o código do jogo nem precisa dos arquivos Godot.

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

Esta edição pronta para publicação contém **uma nota de estreia do site** aprovada no pacote. Não há rascunhos internos no repositório público. Novas notas devem ser verificadas antes de serem enviadas.

### Imagens

Copie a imagem otimizada para `site/assets/`, depois adicione uma entrada a `gallery` com `approved: true` após a autorização. As quatro artes incluídas são **conceituais, não capturas do jogo**; nesta edição estão visíveis na galeria pública. Confirme se autoriza a divulgação dessas imagens antes de publicar. Não publique imagens novas sem permissão.

## 4. Publicar via GitHub Pages (quando você autorizar)

1. Crie um novo repositório **público**, por exemplo `ASHFALL-SITE` (não envie o repositório privado do jogo para ele).
2. Envie apenas esta pasta do site com seus workflows; NÃO copie arquivos de outros projetos para cá.
3. Confirme a branch `main`.
4. No GitHub, abra `Settings` → `Pages` → em `Build and deployment`, escolha `GitHub Actions`.
5. Acesse a aba `Actions` e confira o workflow **ASHFALL Site — Validar e publicar**.
6. Depois do deploy, o endereço normalmente será `https://SEU-USUARIO.github.io/ASHFALL-SITE/`.

O site será **publicamente acessível por quem tiver o link** e possivelmente descoberto por outras pessoas, mesmo que não seja divulgado. GitHub Pages não fornece privacidade por link secreto.

## 5. Integração com o fluxo Claude + Codex

**Fase 1 — já preparada neste pacote:**

- Claude propõe uma alteração no site/changelog numa branch do repositório `ASHFALL-SITE`.
- Codex revisa o Pull Request e comenta.
- O criador aprova conteúdo, imagens e publicação.
- O merge em `main` dispara a validação e o deploy GitHub Pages.

**Fase 2 — a configurar após conectar os repositórios:**

- Uma tarefa ou PR relevante no repositório **privado** `ASHFALL-GAME` produz uma *proposta* de nota pública no repositório `ASHFALL-SITE`.
- Automação com token de permissão mínima ou GitHub App abre PR, **sem publicar automaticamente**.
- Codex e Claude revisam; criador aprova; merge em `main` atualiza site.

A fase 2 depende de configurar permissões e autenticação entre repositórios. **Não está instalada nem ativa.** Não deixe chaves/tokens em arquivos públicos. Nenhum repositório foi criado ou acessado por este pacote.

## 6. Verificação local

Na raiz deste pacote, execute:

```sh
python scripts/validate_content.py
```

## 7. Segurança editorial

- O site é público, mesmo que o endereço circule só entre amigos.
- `noindex` não é controle de acesso.
- Não compartilhar relatórios de crash, locais privados, credenciais, logs com dados pessoais, builds internas ou código-fonte do jogo.
- Nunca enviar para o site notas retiradas automaticamente de todo commit/PR sem revisão de conteúdo.
- Para o site mostrar novidades, edite o JSON e envie um PR ao repositório do site.
