# Progresso e changelog mais fáceis de acompanhar

Polimento solicitado pelo criador, dentro da autorização de atualização/publicação restrita ao site.

## Nova organização

1. Abertura curta: o que é este diário, como acompanhar e captura real do jogo.
2. Progresso: o que já funciona, o que está em avaliação e o que vem depois.
3. Changelog: as melhorias do jogo aparecem primeiro, com resumo e captura; detalhes podem ser abertos na própria nota.
4. Sobre o jogo: origens, build do Arauto, universo e artes conceituais ficam disponíveis em seções recolhíveis.

O menu principal tem três destinos. Os filtros do diário passam a ser “Jogo”, “Em avaliação”, “Site” e “Tudo”; deixam de oferecer categorias vazias como caminho principal. Links de notas continuam funcionando, inclusive quando a nota pertence a outro filtro. Links para seções recolhidas abrem a seção correta. A captura da abertura usa a mesma ampliação e acesso ao original das demais imagens.

Títulos e textos foram simplificados. O rodapé agora descreve corretamente a presença de capturas reais e artes conceituais. Não foram inventados porcentuais de progresso, datas de entrega ou novidades do jogo. A proposta de cartas/interface foi conferida no GitHub e continua em avaliação, sem merge no jogo.

## Verificação

- Validador de conteúdo, arquivos, imagens, âncoras estáticas e links para notas públicas: passou.
- 17 testes Python e 8 testes JavaScript: passaram.
- Sintaxe do JavaScript, geração do pacote e referências de versão: passaram.
- `git diff --check`: passou.

A verificação visual/interação em navegador continua pendente nesta sessão. A estrutura para desktop/celular foi implementada e o código validado; isso não equivale a conferir os pixels em telas reais. As imagens usadas são capturas já conferidas e autorizadas. O repositório do jogo não foi alterado.
