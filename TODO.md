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
  - Exibe somente uma linha compacta e dinâmica de resultados, sem o painel grande e inerte de contadores.
  - Mostra uma miniatura pequena da prévia pública do repositório GitHub quando disponível e usa um ícone de fallback quando não houver imagem.
  - Persiste a ordem escolhida entre “Mais recentes”, “Mais antigos” e “A–Z”.
  - Oferece o filtro “FW 21+” para mostrar somente ports marcados como compatíveis.
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
  - Permite compartilhar o nome e o repositório pela folha nativa do Android.
  - Oferece notificações locais somente para favoritos quando há mudança de versão, data, firmware ou links durante uma sincronização.
  - Integra 13 itens adicionais da lista JSON do Preservia Port Archive, deduplica “Perfect Dark” já existente e mantém GBATemp/GitHub Topics como fontes de descoberta manual.
  - Exibe a origem em cada cartão e permite filtrar por SwitchPorts ou Preservia.
  - Mostra firmware como FW 21+, FW ≤20 ou FW n/d, sem tratar compatibilidade desconhecida como confirmação.
  - Mantém histórico local de ports adicionados, atualizados ou removidos.
  - Cacheia miniaturas localmente após o primeiro carregamento.
  - Registra tarefa de sincronização periódica com Expo BackgroundTask, sujeita às regras de bateria, rede e encerramento do Android.

- [x] **Validação do projeto**
  - TypeScript, lint e configuração pública do Expo foram verificados sem erros.
  - Metro 8081 e API 3000 foram iniciados; a prévia mobile carregou as telas Catálogo, Favoritos, Ajustes e Detalhe.

- [x] **Gerar e instalar o APK**
  - A configuração Android está pronta para o build (`space.manus.switchports.t165141055861472`).
  - APK release standalone gerado e validado com assinatura própria; SHA-256 `dabc0d9288509a404f69a6149afaf6816c0470c26adbee02c7583ee56b310461`.
