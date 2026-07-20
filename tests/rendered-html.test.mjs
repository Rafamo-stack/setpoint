import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the SetMatch product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>SetMatch/);
  assert.match(html, /Scout quadra/);
  assert.match(html, /Scout praia/);
  assert.match(html, /Arena Intelligence/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("includes spatial reports, fine serve zones and editable rally history", async () => {
  const page = await readFile(new URL("../app/design/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/design/smart.module.css", import.meta.url), "utf8");
  assert.match(page, /type ReportKind = "attack" \| "pass" \| "serve"/);
  assert.match(page, /"serve-target"/);
  assert.match(page, /Saque para Z\$\{zone\}\$\{subzone\}/);
  assert.match(page, /ReportCourt/);
  assert.match(page, /HISTÓRICO DA PARTIDA/);
  assert.match(page, /updateArchivedAction/);
  assert.match(css, /\.visualReportCourt/);
  assert.match(css, /\.historyActions/);
});
