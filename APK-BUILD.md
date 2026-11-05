# APK Android do SwitchPorts Catalog

O projeto possui duas variantes standalone locais:

- `SwitchPorts-debug.apk`: release com bundle JavaScript, assinado com a chave debug padrão, indicado para testes.
- `SwitchPorts-release.apk`: release com bundle JavaScript, assinado com uma keystore própria local, indicado para instalação pessoal e futuras atualizações enquanto a keystore for preservada.

## Artefato release validado

- Arquivo: `artifacts/SwitchPorts-release.apk`
- Tamanho: aproximadamente 64 MB
- Pacote: `space.manus.switchports.t165141055861472`
- Versão: `1.0.0` / versionCode `1`
- Compile/target SDK: 36
- Assinatura: Android APK Signature Scheme v2 válida
- SHA-256: `2c82d9ac6a7cc7803c6b066ee93a5a68132711428a6033507640f17a6225af93`

A keystore release e a senha ficam somente no ambiente local e são ignoradas pelo Git. Para preservar a possibilidade de atualizar o APK instalado, não apague `android/app/switchports-release.keystore` nem `.release-keystore.env` neste ambiente.

## Instalar no Android

Baixe o APK, abra-o no telefone e autorize a instalação de fontes desconhecidas caso o Android solicite. Para atualizar uma instalação anterior, use o mesmo APK assinado com a mesma keystore:

```bash
adb install -r SwitchPorts-release.apk
```

## Reproduzir o build

`bash scripts/setup-android-debug.sh` prepara o JDK, Android SDK e ferramentas nativas. Para gerar a versão de testes, use `bash scripts/build-debug-apk.sh`. Para gerar a versão release assinada com a keystore própria, use `bash scripts/build-release-apk.sh`.

A pasta nativa `android/`, os ambientes locais, keystores e `artifacts/` ficam ignorados pelo Git. O Dashboard continua sendo o fluxo recomendado para builds oficiais de distribuição.

## Melhorias incluídas nesta versão

- Sincronização periódica com `expo-background-task`, respeitando as decisões de bateria e rede do Android.
- Notificações somente quando um favorito é adicionado, atualizado ou removido durante uma sincronização.
- Histórico local das últimas alterações detectadas.
- Selo e filtro por fonte: SwitchPorts, Preservia e ports BTech no Catálogo principal.
- Estados de firmware mais claros: FW 21+, FW ≤20 ou FW n/d.
- Cache local das miniaturas depois do primeiro carregamento.
- Deduplicação preservando a fonte principal antes da Preservia.
- Integração completa da API BTech Games: 317 itens em 14 páginas, com origem e classificação por tipo.
- Aba BTech separada para os 6 Projetos da BTech da watchlist: 4 packs e 2 utilitários; os ports de jogos continuam no Catálogo principal.
- Popularidade do GitHub por projeto: estrelas, forks, watchers e issues abertas, com ordenação “Mais populares”, filtro “100+ estrelas” e cache local de 24 horas. Repositórios GitLab e outros serviços aparecem sem métrica GitHub.
- Opção opt-in “Buscar capas externas” em Ajustes: busca miniaturas por nome na Wikipédia para todos os jogos, prioriza a capa encontrada e remove a prévia genérica do GitHub quando não há correspondência. A busca fica bloqueada em uma tela de progresso de 0% a 100%, processa todos os itens pendentes sem limite artificial e salva resultados positivos e negativos em cache; novas entradas são processadas automaticamente na próxima sincronização.
