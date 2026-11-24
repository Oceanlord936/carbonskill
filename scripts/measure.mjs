// Measure what a page REALLY renders, in headless Chrome (Chrome DevTools Protocol, no extra packages; Node 22+).
// Run: node measure.mjs <url> <empty-scratch-dir-for-the-chrome-profile>
// Edit EXPRESSION: it runs inside the page (it may click things and wait) and returns a JSON string.
import { spawn } from "node:child_process";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9333;
const WIDTH = 1260; // the laptop's page width in CSS pixels (innerWidth)
const HEIGHT = 800;
const WAIT_MS = 12000; // dev server pages can be slow the first time

const EXPRESSION = `(async () => {
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const box = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
  // example: the side nav and its first icon , then open the nav and measure again
  const closed = { nav: box('.cds--side-nav'), icon: box('.cds--side-nav__icon > svg') };
  document.querySelector('.cds--header__menu-toggle')?.click();
  await pause(400);
  const open = { nav: box('.cds--side-nav') };
  return JSON.stringify({ window: innerWidth, rootFont: getComputedStyle(document.documentElement).fontSize, closed, open });
})()`;

const [url, profile] = process.argv.slice(2);
if (!url || !profile) {
  console.error("usage: node measure.mjs <url> <scratch-profile-dir>");
  process.exit(1);
}

const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, `--window-size=${WIDTH},${HEIGHT}`, "about:blank"]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let ws;
for (let i = 0; i < 40 && !ws; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const page = list.find((t) => t.type === "page");
    if (page) {
      ws = new WebSocket(page.webSocketDebuggerUrl);
    }
  } catch {
    // Chrome not up yet
  }
  await wait(250);
}
// the connection may already be open (the loop waited after creating it): only wait if it is not
if (ws.readyState !== WebSocket.OPEN) {
  await new Promise((r) => ws.addEventListener("open", r));
}

let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    id++;
    pending.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send("Page.enable");
await send("Page.navigate", { url });
await wait(WAIT_MS);
const res = await send("Runtime.evaluate", { expression: EXPRESSION, returnByValue: true, awaitPromise: true });
console.log(res.result?.result?.value ?? res);
ws.close();
chrome.kill();
process.exit(0);
