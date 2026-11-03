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
- SHA-256: `a8f86283549d7b6d313e7f9969bd6b82b5d45a7ff3719e86a82f7c1cfadc85d8`

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
- Selo e filtro por fonte: SwitchPorts ou Preservia.
- Estados de firmware mais claros: FW 21+, FW ≤20 ou FW n/d.
- Cache local das miniaturas depois do primeiro carregamento.
- Deduplicação preservando a fonte principal antes da Preservia.
- Integração completa da API BTech Games: 317 itens em 14 páginas, com origem e classificação por tipo.
