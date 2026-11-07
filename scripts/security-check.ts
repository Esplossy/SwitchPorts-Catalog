import assert from "node:assert/strict";
import { isTrustedUrl, normalizeTrustedUrl } from "../lib/url-safety";

assert.equal(normalizeTrustedUrl("http://github.com/example/project"), "https://github.com/example/project");
assert.equal(isTrustedUrl("https://raw.githubusercontent.com/example/project/main/README.md"), true);
assert.equal(isTrustedUrl("https://www.gbatemp.net/threads/example"), true);
assert.equal(isTrustedUrl("https://example.com/anything"), false);
assert.equal(isTrustedUrl("javascript:alert(1)"), false);
assert.equal(isTrustedUrl("https://github.com.evil.example/project"), false);
assert.equal(isTrustedUrl("https://github.com@evil.example/project"), false);
assert.equal(isTrustedUrl("http://gbatemp.net/threads/example"), false);

console.log("Security URL checks passed.");
