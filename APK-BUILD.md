# APK Android local assinado com chave debug

O ambiente nativo foi preparado e o APK local foi gerado com sucesso em 27/10/2026. Ele usa a variante **release** para embutir o bundle JavaScript, mas é assinado com a chave debug para testes e instalação pessoal.

## Artefato validado

- Arquivo: `artifacts/SwitchPorts-debug.apk`
- Tamanho: aproximadamente 122 MB
- Pacote: `space.manus.switchports.t165141055861472`
- Versão: `1.0.0` / versionCode `1`
- Compile/target SDK: 36
- Assinatura: Android APK Signature Scheme v2 válida
- SHA-256: `1d10acea538713e566b5fb00faadfa458fd5b83edee610126a84702f5194c965`

O APK usa a chave de desenvolvimento padrão em `~/.android/debug.keystore`, com alias `androiddebugkey` e senha `android`. Essa chave é apropriada para testes e instalação local, não para publicação em produção.

O antigo `assembleDebug` não deve ser usado para instalação standalone: a variante debug pode aguardar o Metro em um telefone físico. O script atual usa `NODE_ENV=production ./gradlew assembleRelease`, que embute o bundle e gera um app que abre sem servidor.

## Instalar no Android

Baixe o APK, abra-o no telefone e autorize a instalação de fontes desconhecidas caso o Android solicite. Também é possível instalar por USB com:

```bash
adb install -r SwitchPorts-debug.apk
```

## Reproduzir o build

O script `scripts/setup-android-debug.sh` instala o JDK, Android SDK, platform-tools, build-tools e cria a keystore debug. Depois, `scripts/build-debug-apk.sh` executa o Expo prebuild e `assembleDebug`, copiando o resultado para `artifacts/SwitchPorts-debug.apk`.

A pasta nativa `android/`, o ambiente local `.android-build-env` e `artifacts/` ficam ignorados pelo Git para não substituir o fluxo gerenciado do projeto nem salvar binários no repositório.
