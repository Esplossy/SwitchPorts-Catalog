# SwitchPorts Catalog

Aplicativo Android open-source em Português (Brasil) para catálogo organizado de ports e projetos para Nintendo Switch. O app sincroniza fontes públicas, funciona offline com cache local, oferece favoritos, filtros, popularidade do GitHub e notificações apenas para favoritos.

## Recursos

- Catálogo agregado de SwitchPorts, Preservia e BTech Games.
- Busca, filtros por categoria, status, fonte, firmware e popularidade.
- Ordenação por data, nome e estrelas do GitHub.
- Favoritos persistentes e notificações de alterações nos favoritos.
- Aba separada para projetos não-jogo da BTech.
- Miniaturas com cache persistente para uso offline.
- Botão **Catálogo offline completo**, que sincroniza a lista, processa todos os itens e baixa as imagens disponíveis mostrando progresso de 0% a 100%.

## Instalação do APK

Abra o APK da release no Android e autorize a instalação de fontes desconhecidas quando solicitado. O APK publicado nas releases é gerado automaticamente pelo GitHub Actions.

## Desenvolvimento

Requisitos: Node.js, pnpm, JDK 17 e Android SDK. Depois:

```bash
pnpm install
pnpm check
pnpm lint
pnpm android
```

O workflow em `.github/workflows/android-apk.yml` gera um APK debug instalável e publica o arquivo como artefato da execução.

## Fontes e limites

Este aplicativo é somente um catálogo de links e metadados. Ele não baixa nem distribui jogos, ROMs, executáveis ou arquivos protegidos. Os links pertencem aos autores dos projetos listados.

As fontes públicas são documentadas em [`SOURCES.md`](SOURCES.md). A obtenção de uma capa depende de existir uma imagem pública associada ao projeto; quando não há imagem disponível, o app mantém o fallback visual.

## Licença

O código deste aplicativo está disponível sob a licença MIT. As imagens, marcas, nomes e conteúdos de terceiros continuam sujeitos às licenças e aos direitos de seus respectivos autores.
