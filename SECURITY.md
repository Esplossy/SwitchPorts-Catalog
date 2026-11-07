# Política de segurança

## Versões suportadas

Apenas a versão publicada na [release mais recente](https://github.com/Esplossy/SwitchPorts-Catalog/releases) e a branch `main` recebem correções voluntárias. Este é um projeto comunitário e não oferece SLA de atendimento.

## Como reportar uma vulnerabilidade

Não publique tokens, credenciais, dados pessoais, arquivos privados ou instruções de exploração em issues públicas.

Use o recurso privado de relatório de vulnerabilidade do GitHub, quando disponível na página **Security** do repositório. Se essa opção não estiver disponível, abra uma issue pública apenas dizendo que precisa de um canal privado e não inclua detalhes sensíveis; a manutenção responderá por lá com a orientação adequada.

Inclua, quando possível:

- versão, commit ou release afetada;
- aparelho e versão do Android;
- passos mínimos para reproduzir;
- impacto observado;
- logs redigidos, sem tokens, caminhos privados ou dados pessoais.

A equipe tentará confirmar o recebimento, avaliar o impacto e publicar uma correção ou orientação. Não há promessa de prazo fixo.

## Práticas do projeto

- O aplicativo distribuído é local e não inclui servidor, banco, login ou chaves de API.
- Segredos locais, keystores e artefatos de build não pertencem ao Git.
- Workflows usam permissões explícitas e mínimas.
- Pull requests devem passar por verificação TypeScript e lint.
- Dependências e actions de terceiros devem ser revisadas antes de atualização.

## Distribuição do APK

O workflow de release assinado usa os segredos `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD` do GitHub Actions. A keystore nunca deve ser commitada nem publicada. Cada APK distribuído deve acompanhar o arquivo SHA-256 gerado pelo workflow e o commit de origem.

O catálogo aceita somente links HTTPS de domínios conhecidos para as fontes do projeto. Links HTTP antigos do GitHub são convertidos para HTTPS; outros esquemas ou domínios são descartados. Essa validação reduz o risco de uma fonte externa introduzir um link inesperado no aplicativo, mas não substitui a revisão humana das fontes.
