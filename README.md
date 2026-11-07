# SwitchPorts Catalog

<p align="center">
  <strong>Um índice vivo, offline-first e organizado para ports e projetos do Nintendo Switch.</strong><br />
  Feito para encontrar projetos públicos com rapidez — sem distribuir jogos, ROMs ou executáveis.
</p>

<p align="center">
  <a href="https://github.com/Esplossy/SwitchPorts-Catalog/actions/workflows/android-apk.yml"><img src="https://github.com/Esplossy/SwitchPorts-Catalog/actions/workflows/android-apk.yml/badge.svg" alt="Build Android" /></a>
  <a href="https://github.com/Esplossy/SwitchPorts-Catalog/actions/workflows/codeql.yml"><img src="https://github.com/Esplossy/SwitchPorts-Catalog/actions/workflows/codeql.yml/badge.svg" alt="CodeQL Security" /></a>
  <a href="https://github.com/Esplossy/SwitchPorts-Catalog/releases"><img src="https://img.shields.io/github/v/release/Esplossy/SwitchPorts-Catalog?display_name=tag&sort=semver" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-29d3b2.svg" alt="Licença MIT" /></a>
  <a href="https://github.com/Esplossy/SwitchPorts-Catalog/issues"><img src="https://img.shields.io/github/issues/Esplossy/SwitchPorts-Catalog" alt="Issues" /></a>
</p>

> **Status:** projeto comunitário experimental. O catálogo depende das fontes públicas e pode conter itens incompletos, arquivados ou alterados pelos autores originais.

## O que é

O SwitchPorts Catalog é um aplicativo Android em Português (Brasil) que agrega metadados e links de origem de projetos relacionados a ports do Nintendo Switch. Ele sincroniza fontes públicas, mantém um snapshot local e permite consultar o catálogo mesmo sem internet.

O aplicativo **não hospeda, baixa ou distribui jogos, ROMs, chaves, executáveis ou arquivos protegidos**. Cada projeto continua pertencendo aos seus autores e todas as fontes são creditadas em [`SOURCES.md`](SOURCES.md).

O repositório também não inclui servidor, banco de dados, login, chaves de API ou serviços pagos: é um aplicativo Expo/React Native local, com sincronização direta de fontes públicas e armazenamento offline no aparelho. Isso mantém o download simples e reduz a superfície de ataque.

## Recursos

- Catálogo agregado de SwitchPorts, Preservia e BTech Games.
- Busca e filtros por categoria, status, fonte, firmware e popularidade.
- Ordenação por data, nome e estrelas do GitHub.
- Favoritos persistentes e notificações somente para alterações nos favoritos.
- Aba separada para projetos não-jogo da BTech.
- Miniaturas com cache persistente para consulta offline.
- **Catálogo offline completo:** sincroniza a lista, percorre os itens e baixa as imagens disponíveis com progresso bloqueado de 0% a 100%.
- APK compilado automaticamente pelo GitHub Actions a cada atualização da branch `main`.
- Verificação de TypeScript, lint, parser e política de URLs no CI.

## Instalar no Android

Baixe o APK na [release mais recente](https://github.com/Esplossy/SwitchPorts-Catalog/releases). No Android, abra o arquivo e autorize a instalação de fontes desconhecidas se o sistema solicitar.

A versão pública deve ser o APK release assinado, acompanhado do SHA-256 publicado na release. APKs debug ficam reservados para testes e artefatos de CI.

Antes de instalar, confira o SHA-256 publicado na release. APKs de terceiros não devem ser tratados como confiáveis apenas por usarem o mesmo nome do projeto.

## Desenvolvimento local

Requisitos: Node.js 22+, pnpm 9, JDK 17 e Android SDK. O ambiente de CI usa Ubuntu, Android API 36, build-tools 36.0.0, NDK 27.1.12297006 e CMake 3.22.1.

```bash
git clone https://github.com/Esplossy/SwitchPorts-Catalog.git
cd SwitchPorts-Catalog
pnpm install --frozen-lockfile
pnpm verify
pnpm android
```

O workflow em [`.github/workflows/android-apk.yml`](.github/workflows/android-apk.yml) gera um APK debug e o disponibiliza como artefato da execução. O workflow manual [`.github/workflows/android-release.yml`](.github/workflows/android-release.yml) gera um APK release assinado quando os segredos da keystore estão configurados. Não são necessárias chaves de API para compilar o projeto.

## Transparência sobre inteligência artificial

Este projeto foi desenvolvido **com assistência significativa de inteligência artificial**, usando o Manus para planejamento, pesquisa, escrita e revisão de partes do código, documentação e automação. A IA não é apresentada como autora legal ou como garantia de correção.

O código é público justamente para permitir auditoria, revisão humana, correções e contribuições da comunidade. Quem instalar ou reutilizar o projeto deve revisar o código, as dependências e os resultados antes de usá-lo em produção.

## Segurança e privacidade

- Não há credenciais, keystores, tokens ou arquivos `.env` versionados.
- O workflow de build usa permissões mínimas de leitura do conteúdo do repositório.
- O app não exige conta, não incorpora chaves privadas e não possui telemetria própria declarada.
- Dados locais, como favoritos e cache, ficam no armazenamento do dispositivo.
- Dependências devem ser atualizadas e revisadas antes de qualquer release.
- Vulnerabilidades devem ser reportadas seguindo [`SECURITY.md`](SECURITY.md), e não em uma issue pública.

O repositório público mantém **Secret Scanning**, **Push Protection**, **Dependabot Security Updates** e análise **CodeQL** habilitados. Isso reduz riscos comuns, mas não substitui revisão humana, testes ou auditoria independente.

**Estado da auditoria:** o GitHub pode identificar alertas em dependências transitivas do ecossistema JavaScript, principalmente nas ferramentas de build do Expo. Eles ficam visíveis na aba [Security](https://github.com/Esplossy/SwitchPorts-Catalog/security/dependabot) e são acompanhados pelo Dependabot. As dependências de servidor foram removidas deste projeto para reduzir a superfície de ataque; ainda assim, esta release deve ser considerada experimental e não declaramos que todas as dependências estão sem alertas.

Leia [`CONTRIBUTING.md`](CONTRIBUTING.md) antes de enviar pull requests. O código segue a [Licença MIT](LICENSE); imagens, marcas, nomes e conteúdos de terceiros continuam sujeitos às licenças de seus respectivos autores.

## Fontes

A metodologia de integração, créditos e limites de cada fonte estão documentados em [`SOURCES.md`](SOURCES.md). A lista principal é mantida por terceiros; este aplicativo não reivindica autoria sobre os dados agregados.

## Contribua

Correções de parsing, melhorias de acessibilidade, documentação e testes são bem-vindas. Para mudanças maiores, abra uma issue antes de implementar para alinhar o escopo.

[Abra uma issue](https://github.com/Esplossy/SwitchPorts-Catalog/issues) · [Veja as releases](https://github.com/Esplossy/SwitchPorts-Catalog/releases) · [Leia a política de segurança](SECURITY.md)
