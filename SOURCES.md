# Fontes complementares pesquisadas

## Fonte principal: SwitchPorts

O repositório [robzilla10001/SwitchPorts](https://github.com/robzilla10001/SwitchPorts) continua sendo a fonte principal do aplicativo. Ele mantém `README.md` para itens ativos e `DEAD.md` para projetos arquivados, com tabelas contendo nome, versão, data, repositório, tópico do GBATemp e compatibilidade com firmware. O próprio README recomenda o tópico comunitário do GBATemp como discussão associada.

## Preservia Port Archive

O [Preservia Port Archive](https://preservia.github.io/ports/) é uma fonte complementar estruturada. Na consulta realizada, apresentava 14 ports com cartões, ícones, autor, versão, descrição, página de origem e link de download. O repositório [preservia/ports](https://github.com/preservia/ports) mantém `ports.json` e registros individuais em JSON; o README informa que o arquivo é curado, contém metadados e que os ports foram testados em firmware 20.1.0.

Como os registros Preservia também oferecem downloads pré-compilados e o objetivo deste app é um catálogo seguro de links e metadados, o aplicativo não incorpora nem redistribui esses arquivos. A lista estruturada foi integrada ao catálogo somente como metadados: na sincronização atual ela acrescenta 13 itens novos, pois “Perfect Dark” já existia na fonte principal. A página também continua disponível em Ajustes como referência complementar.

## Ultimate Switch Port Thread

O tópico [Ultimate Switch Port Thread](https://gbatemp.net/threads/ultimate-switch-port-thread.683071/) funciona como fonte de descoberta e atualização comunitária. Ele aponta para o SwitchPorts como lista central, registra sugestões e atualizações individuais e contém links para alguns repositórios que podem ainda não estar na lista principal. Como é uma discussão humana, sem formato estável, foi incluído como fonte complementar no app, não como importação automática.

## GitHub switch-homebrew

A página de tópico [GitHub · switch-homebrew](https://github.com/topics/switch-homebrew) é útil para descoberta ampla, mas mistura ports de jogos, engines, overlays, ferramentas e outros projetos homebrew. Por não ser uma lista curada exclusivamente de ports, o app a apresenta como fonte de pesquisa manual e não sincroniza seus repositórios automaticamente.

## Critério adotado

O catálogo sincroniza automaticamente o SwitchPorts como fonte principal, a lista JSON da Preservia e a API pública paginada da BTech Games. Os 317 registros BTech são mantidos, mesmo quando o mesmo projeto também aparece em outra fonte, porque cada cartão informa a origem. Eles são classificados como `Port`, `Emulador` ou `Android` e agrupados nas categorias `BTech · ...`, além de mostrar a plataforma original, versão, data, projeto, discussão e capa quando fornecidos.

A API BTech consultada em 03/11/2026 retornou 317 itens em 14 páginas: 163 Android, 129 ports de plataformas clássicas e 25 emuladores. O app importa todas as páginas automaticamente, preserva o snapshot para uso offline e não baixa nem redistribui arquivos executáveis.

GBATemp e GitHub Topics continuam como fontes de descoberta manual em **Ajustes → Fontes complementares**, evitando scraping frágil e inclusão acidental de links diretos para arquivos distribuíveis.
