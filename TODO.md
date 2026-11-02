# TODO — SwitchPorts Catalog

- [x] **Catálogo sincronizado da fonte pública**
  - Lê `README.md` e `DEAD.md` do repositório `https://github.com/robzilla10001/SwitchPorts`.
  - Interpreta tabelas Markdown organizadas por categoria e separa itens ativos de projetos arquivados.
  - Mostra nome, sistema/categoria, versão, data da última atualização, compatibilidade com firmware quando disponível, repositório oficial e tópico do GBATemp quando existir.
  - Inclui snapshot inicial embarcado com 375 itens: 343 ativos e 32 arquivados.

- [x] **Atualização e cache offline**
  - Tenta sincronizar automaticamente ao abrir.
  - Oferece atualização manual por botão e pull-to-refresh.
  - Persiste o último catálogo funcional em AsyncStorage e mantém a cópia disponível quando a rede falha.
  - Mostra carregando, erro, sem resultados, modo offline e data da última sincronização.

- [x] **Descoberta e organização**
  - Oferece busca por nome, sistema, categoria, versão e repositório.
  - Filtra por plataforma/categoria e status ativo/arquivado.
  - Ordena por padrão pelos mais recentes e permite alternar para mais antigos ou ordem alfabética A–Z.
  - Permite destacar projetos atualizados recentemente.
  - Mostra contador total e contador do resultado atual.

- [x] **Favoritos e detalhes**
  - Permite favoritar e desfavoritar itens localmente.
  - Exibe seção dedicada de favoritos na navegação inferior.
  - Abre detalhes completos com links externos funcionais.

- [x] **Navegação, ajustes e identidade**
  - Entrega navegação inferior entre Catálogo, Favoritos e Ajustes.
  - Em Ajustes, permite sincronizar agora, mostrar/ocultar arquivados e abrir o repositório original.
  - Usa interface Android moderna, legível, eficiente e integralmente em português do Brasil.
  - Inclui citação da fonte e aviso explícito de que o app é somente um catálogo de links e metadados.
  - Configura ícones, splash, identificadores e metadados de branding do aplicativo.

- [x] **Validação do projeto**
  - TypeScript, lint e configuração pública do Expo foram verificados sem erros.
  - Metro 8081 e API 3000 foram iniciados; a prévia mobile carregou as telas Catálogo, Favoritos, Ajustes e Detalhe.

- [ ] **Gerar e instalar o APK**
  - A configuração Android está pronta para o build (`space.manus.switchports.t165141055861472`).
  - O APK/AAB deve ser gerado pela ação de build Android do Dashboard do projeto; ele não foi chamado de pronto antes de existir um artefato real.
