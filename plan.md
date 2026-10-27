# SwitchPorts Catalog — plano de implementação

## Escopo

Aplicativo Android em português do Brasil para consultar o catálogo público de ports para Nintendo Switch mantido em `robzilla10001/SwitchPorts`. O app não hospeda nem distribui jogos, ROMs, executáveis ou assets protegidos; ele exibe somente metadados e links para as fontes originais.

## Abordagem técnica

- **Stack:** Expo Router, React Native, TypeScript, NativeWind e AsyncStorage, preservando o starter mobile gerenciado.
- **Fonte de dados:** `README.md` e `DEAD.md` em `raw.githubusercontent.com`. Um parser de Markdown identifica as tabelas, categorias, sistemas, títulos, versões, datas, links, status de firmware e sinalizadores de atualização recente.
- **Offline-first:** catálogo inicial embarcado no bundle para a primeira abertura; cache persistente em AsyncStorage após cada sincronização bem-sucedida; a última cópia continua disponível quando a rede falha.
- **Estado:** um `CatalogProvider` centraliza itens, favoritos, preferência de arquivados, estado de sincronização e última sincronização. Favoritos são IDs estáveis derivados de categoria, nome e link.
- **Navegação:** abas inferiores para Catálogo, Favoritos e Ajustes; rota de detalhe independente para permitir abrir o port completo e voltar com o gesto/back nativo.
- **Atualização:** tentativa automática ao abrir, botão “Sincronizar agora” e gesto de pull-to-refresh. A sincronização usa timeout, valida o resultado e só substitui o cache se encontrar itens válidos.

## Estrutura principal

- `app/(tabs)/index.tsx`: catálogo, busca, filtros e lista.
- `app/(tabs)/favorites.tsx`: favoritos locais.
- `app/(tabs)/settings.tsx`: sincronização, visibilidade de arquivados, fonte e créditos.
- `app/details/[id].tsx`: detalhe de um port e links externos.
- `components/catalog-card.tsx`: cartão compacto e consistente para listas.
- `components/status-pill.tsx`: badges de ativo, arquivado e atualizado.
- `lib/catalog.ts`: tipos, parser, sincronização remota, seed e persistência.
- `lib/catalog-context.tsx`: estado compartilhado do app.
- `data/catalog-seed.ts`: snapshot gerado da fonte pública atual para a primeira abertura/offline.
- `scripts/generate-catalog-seed.mjs`: gera o snapshot a partir dos dois arquivos Markdown públicos.
- `assets/images/*`: identidade visual do launcher e splash.

## Design

### Alternativas consideradas

- **Terminal editorial / “dark utility”** — 0,07: alto contraste, denso e técnico, mas poderia parecer áspero para uso cotidiano.
- **Material You documental** — 0,06: familiar e acessível, porém genérico demais para o catálogo.
- **Midnight index / arquivo técnico** — 0,08: base azul-marinho, acento ciano, superfícies elevadas e tipografia forte; escolhido.

### Direção escolhida: Midnight index / arquivo técnico

- **Movimento:** arquivo digital técnico com precisão de dashboard e calor suficiente para leitura longa.
- **Princípios:** descoberta rápida, densidade controlada, estados sempre explícitos e links sempre rastreáveis.
- **Cores:** azul-marinho quase preto cria foco e reduz brilho; ciano assina ações e seleção; verde marca atualização; âmbar diferencia projetos arquivados sem confundir com erro.
- **Layout:** cabeçalho contextual curto, busca como primeiro controle e trilhas horizontais de filtros; listas em cartões verticais, sem grade centralizada.
- **Elementos de assinatura:** marcador vertical ciano nos cards selecionados, badge monoespaçada para versão e pequeno selo de atualização recente.
- **Interação:** cada toque revela uma ação clara; filtros são chips roláveis; favoritos têm resposta háptica e atualização imediata.
- **Animação:** transições curtas de opacidade/escala nos cards e feedback de refresh; sem animações contínuas que atrapalhem a leitura.
- **Tipografia:** sistema nativo para títulos e corpo, monoespaçada somente para versão, contagem e metadados técnicos.
- **Essência:** “o índice vivo dos ports do Switch, com o link certo e o estado certo”; direto, confiável, prático.
- **Voz:** títulos objetivos e microcopy informativa. Exemplos: “Encontre um port em segundos.” e “Fonte sincronizada; seus links continuam disponíveis offline.”
- **Marca:** símbolo simples de três portas/slots em forma de “>>”, sem texto embutido, para funcionar em tamanhos pequenos.
- **Cor proprietária:** ciano elétrico `#34D6D9` sobre azul-noite `#07131F`.

## Restrições e decisões

- A compatibilidade com firmware é exibida exatamente quando a fonte informa `Yes`, `No` ou `???`.
- Datas são apresentadas no formato brasileiro, mas itens sem data preservam `n/a`/`???`.
- O app abre links externos pelo navegador do sistema/in-app browser; não tenta baixar conteúdo.
- Como a fonte é pública e externa, falhas de GitHub não impedem a leitura do último cache.
- O APK será preparado pelo fluxo nativo da plataforma após o código ser aceito; não será declarado um APK antes de um build real confirmado.
