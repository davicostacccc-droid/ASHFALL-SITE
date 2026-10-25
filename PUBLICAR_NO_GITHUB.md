# ASHFALL — site pronto para GitHub Pages

## Importante
Este pacote contém **somente o site público**. Nunca misture arquivos Godot, Blender, código do jogo, tokens ou notas privadas nesta pasta.
As imagens da galeria são **artes conceituais**, não capturas reais do gameplay. Confira que concorda em divulgá-las antes de publicar.

## GitHub Desktop (Windows)
1. Extraia este ZIP em uma pasta dedicada, por exemplo `C:\ASHFALL-SITE-PUBLICO`.
2. Abra o **GitHub Desktop**, entre na sua conta, escolha **File > Add local repository > Choose** e selecione a pasta extraída.
3. Se ele disser que a pasta não é um repositório Git, clique em **Create a repository here**.
4. Confirme que o repositório selecionado contém `site`, `scripts` e `.github` diretamente em sua raiz, sem pasta intermediária.
5. Faça o commit inicial se necessário e use **Publish repository**.
6. Nome do repositório: `ASHFALL-SITE`. **Desmarque Keep this code private** para publicar em sua conta pública (o site e arquivos do repositório serão visíveis).
7. No GitHub, navegue até `ASHFALL-SITE` > **Settings > Pages** > **Build and deployment** > **Source: GitHub Actions**.
8. Confira a aba **Actions** > workflow `ASHFALL Site — Validar e publicar`. Se a primeira execução tiver falhado por Pages não estar habilitado, use `Re-run jobs` ou `Run workflow`.
9. Quando aparecer publicação bem-sucedida, confira o endereço `https://SEU-USUARIO.github.io/ASHFALL-SITE/` em **Settings > Pages**.

## Atualizações futuras
Edite `site/data/content.json` e adicione notas com `approved: true` **apenas quando aprovadas pelo dono do ASHFALL**. Este pacote não permite rascunhos com `approved: false` dentro do repositório público: mesmo ocultos na interface, seriam legíveis no GitHub.
O workflow está pronto para publicar alterações do repositório do site. A integração automática com o futuro repositório privado do jogo ainda não foi configurada.

## Link reservado
O GitHub Pages e o repositório são públicos. `noindex` apenas solicita não indexação, não controla acesso. Qualquer pessoa que obtenha o link ou encontre o repositório poderá acessar.
