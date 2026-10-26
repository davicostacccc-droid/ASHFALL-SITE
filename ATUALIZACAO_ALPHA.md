# Atualização do site — 26/10/2026

O site passa a acompanhar o estado atual do ASHFALL, preservando a identidade visual e as quatro artes conceituais já publicadas.

## Conteúdo conferido

- Cinco origens jogáveis com armas e mecânicas iniciais próprias.
- Hordas, experiência, escolhas de melhoria e Guardião da Fenda com duas fases.
- Quatro espaços de armas e quatro de passivas, barra de build e consulta na pausa.
- Arauto com doses, mutações e Pandemia em Cadeia.
- Polimento da subida de nível, cartas e HUD: **em avaliação**, ainda não integrado.
- Três novas magias, primeira evolução do Incensário e passe de efeitos: **próximos passos**.
- Sem download público e sem data de lançamento anunciada.

As informações foram conferidas na versão principal do jogo e no estado das propostas em 26/10/2026. Alguns documentos históricos do jogo ainda chamavam origens já jogáveis de “planejadas”; a disponibilidade foi confirmada nos dados atuais das cinco origens. Não foram copiados código, modelos, logs, builds ou capturas do repositório privado.

## Polimento

Abertura com contexto da Alpha, painel “Agora”, cinco origens consultáveis com clique/setas/Home/End, seção da build do Arauto, diário com estados e contagens, datas, links para cada nota e roteiro atualizado. Melhorias de espaçamento, tipografia, contraste e leiaute para celular. Menu com Escape e foco visível, galeria com legenda de conceito e fechamento pelo fundo, respeito à redução de movimentos. Nenhuma imagem nova ou migração de hospedagem.

O conteúdo atual fica em `site/data/content.json`. É uma atualização pontual: não há sincronização contínua, token entre repositórios ou importação automática de PRs privados.

## Verificação executada

- Validador de conteúdo, cinco origens, datas, estados, imagens e âncoras: passou.
- Dez testes Python dos limites editoriais: passaram.
- Seis testes JavaScript de filtros, datas, mídia local e escape de texto: passaram.
- Sintaxe de `app.js` e do módulo de conteúdo: passou.
- `git diff --check`: passou.

O workflow do GitHub repete essas verificações antes da publicação e agora também verifica o módulo JavaScript e os dados atualizados no endereço publicado.

**Limite:** não houve conferência da renderização ou interação em navegador nesta sessão. Responsividade e interações foram implementadas, mas a avaliação visual e o teste com mouse/teclado reais continuam pendentes. As verificações automáticas acima não substituem isso.

## Conferir e publicar

No ramo desta proposta, execute `sh ABRIR_SITE.sh` ou `ABRIR_SITE.bat` e abra o endereço indicado. Confira a abertura, as cinco origens, os filtros, a galeria e o menu no celular. Compare os rótulos “NA ALPHA”, “EM AVALIAÇÃO” e “PRÓXIMOS PASSOS”.

O fluxo editorial do README continua valendo: o criador aprova conteúdo, imagens e publicação; o merge em `main` dispara o GitHub Pages. Esta proposta não altera o repositório nem a jogabilidade do jogo.

## Complemento aprovado: changelog visual

O criador aprovou a publicação do site e pediu marcos principais com imagens reais. As quatro capturas e a ampliação no diário estão registradas em [CHANGELOG_VISUAL.md](CHANGELOG_VISUAL.md). A aprovação não autoriza merge no repositório do jogo.
