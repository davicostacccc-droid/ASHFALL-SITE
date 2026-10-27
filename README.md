# ASHFALL — Progresso e atualizações

Site estático de apresentação e changelog do ASHFALL, pronto para GitHub Pages.

## 1. Testar sem publicar

**Windows:** extraia o ZIP, abra a pasta e clique duas vezes em `ABRIR_SITE.bat`.

O navegador deve abrir `http://localhost:8765`. Caso não abra automaticamente, copie esse endereço. Requer Python instalado no Windows (ou o launcher `py`). Para parar o servidor, feche o terminal ou aperte Ctrl+C.

**Linux/macOS:** dentro da pasta, execute `sh ABRIR_SITE.sh` e abra `http://localhost:8765`.

Por segurança e compatibilidade, não recomendamos abrir `site/index.html` diretamente por `file://`: o navegador pode bloquear a leitura do JSON.

## 2. Como o site está organizado

O objetivo principal é acompanhar o progresso do jogo e entender suas melhorias:

1. **Abertura:** apresentação curta do diário e captura real da seleção de origem.
2. **Progresso:** o que já está na Alpha, o que está em avaliação e os próximos passos, com data da conferência.
3. **Atualizações:** notas do jogo com imagens, resumos e detalhes recolhíveis. Filtros “Jogo”, “Em avaliação”, “Site” e “Tudo”.
4. **Sobre o jogo:** origens jogáveis, build do Arauto, universo e artes conceituais, em seções opcionais.

O menu principal tem três destinos. Links para notas e para as seções antigas foram preservados. A imagem ampliada permite abrir o arquivo original em uma nova aba.

O conteúdo foi conferido em **26/10/2026**. As cinco origens, o ciclo da partida, as passivas/mutações e a Pandemia estão na Alpha. O polimento das cartas/interface está **em avaliação**; novas magias, evolução do Incensário e passe de efeitos são próximos passos. Sem download público ou data de lançamento anunciada.

A aprovação de uma nota para divulgação não significa que o recurso já foi integrado ao jogo. Capturas reais e artes conceituais têm identificação própria. Este repositório não contém o código ou as builds do jogo.

Detalhes deste polimento e limites da verificação em [PROGRESSO_CLARO.md](PROGRESSO_CLARO.md).

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

### Imagens no changelog

As notas podem incluir `media`, uma lista de imagens com `type: "image"`, `src`, `alt` e `caption`. Use arquivos locais em `site/assets/`. A legenda deve explicar a melhoria e identificar capturas de propostas em avaliação. O site amplia a imagem ao clicar, preservando a legenda, e permite abrir o arquivo original em uma nova aba para ler os detalhes. Capturas de demonstração são identificadas; não use montagens ou conceitos como se fossem gameplay.

As quatro capturas adicionadas nesta etapa foram autorizadas pelo criador ao pedir um changelog dos marcos principais com imagens reais. As artes conceituais da galeria continuam identificadas separadamente. Vídeos poderão entrar quando houver gravações reais; não há player simulado nesta versão.

### Imagens da galeria

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

Faça as alterações em um ramo próprio e abra um PR. O workflow valida os dados, os links e o JavaScript; ao integrar em `main`, prepara o pacote com `scripts/build_public.py` e publica no GitHub Pages. CSS, JavaScript e módulo recebem uma identificação de versão na URL para manter as referências de cada publicação consistentes. O criador aprova conteúdo, imagens e publicação antes do merge em `main`.

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

## 8. Prévia sonora

`site/previa-sonora.html` apresenta **Terras das Cinzas — estudo 01**, uma proposta instrumental original de 1min31 a 84 BPM. A publicação desta prévia pública foi autorizada pelo criador para avaliação. A música não foi integrada ao jogo.

A página segue a seleção de origem do jogo: preto, cobre, laranja, títulos serifados e um painel emoldurado sobre o cenário. O player oferece reprodução, pausa, avanço e silêncio, sem reprodução automática. O controle nativo continua disponível sem JavaScript ou quando a reprodução falha. Há download do MP3 e um link direto como alternativa. O arquivo fica em `site/assets/audio/terras-das-cinzas-estudo-01.mp3`. A ilustração é uma arte conceitual já publicada no site. O link para a prévia também está no rodapé da página inicial.

Na publicação, `scripts/build_public.py` inclui o CSS, o JavaScript, as imagens e o áudio dentro do HTML da prévia. Assim, a apresentação não depende de caminhos relativos quando o HTML é aberto por um visualizador ou salvo separadamente. Os links de navegação e download apontam para o endereço público completo. O teste de regressão confere que o áudio incluído é idêntico ao MP3 original e que os recursos visuais e o player estão incorporados. `npm run check` também confere os comandos e o tratamento de falhas do player; esses testes não substituem a conferência de áudio e aparência no navegador.

O próprio `site/previa-sonora.html` agora é esse arquivo completo, com o mesmo conteúdo publicado. Isso corrige a aba de prévia que abria apenas o HTML fonte sem os demais arquivos. Para editar a estrutura, use `site/previa-sonora.template.html`; depois execute `python scripts/build_public.py --refresh-preview` e inclua o HTML gerado no commit. O template não entra na publicação. Os testes impedem que o HTML local fique diferente da página publicada.
