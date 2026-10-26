# Changelog visual — 26/10/2026

Complemento solicitado e autorizado pelo criador: apresentar os marcos principais com imagens reais no changelog do site. A aprovação continua restrita ao site.

## Quatro marcos ilustrados

| Marco | Imagem | Contexto |
| --- | --- | --- |
| Build do Arauto | `alpha-cartas-build.png` | Cartas e sinergias da versão integrada à Alpha; build de demonstração com itens existentes. |
| Painel de build | `alpha-painel-build.png` | Consulta real de armas, passivas e mutações na pausa da Alpha. |
| Cinco origens | `alpha-cinco-origens.png` | Tela real de seleção das cinco origens jogáveis. |
| Nova apresentação de cartas | `cartas-polimento-avaliacao.png` | Proposta ainda em avaliação, identificada na notícia, na imagem e na legenda. |

As capturas da build integrada foram feitas com a Godot 4.7.2 já instalada, numa cópia temporária da versão principal, dentro de `work/`. A cena usa somente itens existentes; a etapa de lotação com arma simulada do teste antigo foi excluída da captura. A seleção de origem e a tela em avaliação usam capturas reais já conferidas. Os PNGs foram copiados sem montagem ou alteração. Nenhum código, asset de origem, log, build ou configuração do jogo foi publicado ou alterado.

## Apresentação

As notas mantêm data, resumo e lista do que mudou. Uma imagem com legenda aparece abaixo do texto e abre ampliada ao clicar ou ativar pelo teclado. As artes conceituais da galeria continuam separadas das capturas do jogo. Não foi incluído vídeo: não há gravação real disponível nesta etapa e não há player fictício.

## Validação

- 13 testes Python e 7 testes JavaScript passaram.
- Validador de conteúdo, caminhos locais, existência das imagens, legendas e estados: passou.
- Sintaxe do JavaScript e `git diff --check`: passaram.
- Capturas conferidas visualmente; importação e captura na Godot sem erros de script ou recursos. Aviso de V-Sync do driver de captura é esperado.
- O workflow de publicação também verifica HTTP 200 para cada imagem referenciada nas notas.

A conferência da interface do site em navegador continua pendente; os testes acima não substituem essa avaliação. A hospedagem permanece no GitHub Pages. Esta complementação não altera o repositório do jogo.
