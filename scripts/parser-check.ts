import assert from "node:assert/strict";
import { parsePortMarkdown } from "../lib/catalog";

const markdown = `
### Ports
| System | Title | Version | Link | GBATemp thread? | Updated for FW 21+? |
| --- | --- | --- | --- | --- | --- |
| Nintendo 64 | 🟢 Example Port | 1.2.0 | [source](https://github.com/example/port) | [thread](https://gbatemp.net/threads/example) | Yes |
| Nintendo 64 | Unsafe Link | 1.0.0 | [source](https://example.com/unsafe) |  | Yes |
`;

const items = parsePortMarkdown(markdown, false);
assert.equal(items.length, 1);
assert.equal(items[0]?.name, "Example Port");
assert.equal(items[0]?.repoUrl, "https://github.com/example/port");
assert.equal(items[0]?.threadUrl, "https://gbatemp.net/threads/example");
assert.equal(items[0]?.recent, true);
assert.equal(items[0]?.archived, false);

console.log("Parser checks passed.");
