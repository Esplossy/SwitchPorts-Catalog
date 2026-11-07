# Contribuindo

Obrigado por ajudar a melhorar o SwitchPorts Catalog. O projeto é público, experimental e desenvolvido com assistência de IA; contribuições humanas são especialmente importantes para revisão, segurança, acessibilidade e qualidade dos dados.

## Antes de começar

Para mudanças maiores, abra uma issue descrevendo o problema e a solução proposta. Não inclua jogos, ROMs, executáveis, chaves, credenciais ou conteúdo protegido no repositório.

## Ambiente

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm lint
```

O app usa Expo/React Native com TypeScript. Preserve o idioma Português (Brasil), o funcionamento offline e a separação entre catálogo de metadados e distribuição de arquivos.

## Pull requests

Descreva o que mudou, por que mudou e como foi validado. Mantenha pull requests focados. Não faça commit de `.env`, keystores, tokens, diretórios `android/` gerados localmente, APKs ou arquivos temporários.

Antes de enviar:

- execute `pnpm check`;
- execute `pnpm lint`;
- revise o diff e remova dados sensíveis;
- atualize a documentação quando o comportamento público mudar.

Ao contribuir, você confirma que tem autorização para enviar o código e que ele pode ser distribuído sob a [Licença MIT](LICENSE). Para vulnerabilidades, use [`SECURITY.md`](SECURITY.md), não uma issue pública.
