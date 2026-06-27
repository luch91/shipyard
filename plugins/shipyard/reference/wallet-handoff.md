# Wallet handoff — trigger a real wallet popup and auto-resume

This is how a CLI agent gets a **real wallet popup** for deploy / write / verify and
**auto-resumes** with the outcome — the `vercel login` / `gh auth login` / `wrangler login`
pattern. The agent prepares everything headlessly, opens a prefilled Shipyard page, the user
approves in their own wallet, and the public result comes back to the terminal.

**The agent never holds a key and never signs.** Only public outcomes (tx hash, contract
address, booleans) ever cross the callback. See [trust-boundary.md](./trust-boundary.md).

The handoff page lives at the **production origin** — `https://genshipyard.com/handoff` —
because SIWE binds the signed domain to the page host. Do not use a preview or localhost
origin for the page itself.

---

## Two transports

| | **Loopback** (default) | **Relay + poll** (fallback) |
|---|---|---|
| Use when | Agent + browser on the **same machine** | Remote / SSH agent, headless box, or local port blocked |
| Receiver | A short-lived HTTP listener the **agent** starts on `127.0.0.1:<port>` | Shipyard stores the result; the agent **polls** for it |
| Resume | Browser navigates to the loopback URL → instant | Agent polls `GET /api/handoff/result?state=` until ready |

> **Why relay exists:** over SSH the browser opens on the **user's** machine while
> `127.0.0.1` resolves to the **remote** box — the loopback can never reach the listener.
> If you are remote/headless, or cannot bind a local port, use relay. Relay **requires**
> Shipyard's Redis; if the relay endpoint returns `503`, fall back to loopback.

---

## The handoff URL

Base: `https://genshipyard.com/handoff`

### Common query params (all actions)
| Param | Required | Meaning |
|---|---|---|
| `action` | yes | `deploy` \| `write` \| `verify` |
| `network` | yes | one of `testnet-bradbury`, `testnet-asimov`, `studionet`, `localnet` |
| `state` | yes | a one-time token you generate (≥128-bit, base64url). Echoed back; binds the result to this run. |
| `callback` | loopback only | `http://127.0.0.1:<port>/cb` — **loopback only, validated by the page** |
| `relay` | relay only | `1` — page returns via `POST /api/handoff/result` instead of `callback` |

### Action-specific params
| action | extra params | popup | result payload |
|---|---|---|---|
| `deploy` | `source` (LZString), `args` (LZString of JSON object `{paramName: value}`, optional) | `eth_sendTransaction` | `{contractAddress, txHash, network, contractName, pending?}` |
| `write` | `address`, `method`, `args` (JSON `string[]`, optional) | `eth_sendTransaction` | `{txHash, network}` |
| `verify` | `address`, `source` (LZString), `deployTx` (optional) | `personal_sign` (SIWE) | `{verified, attributed}` |

Notes:
- `source` (deploy/verify) and deploy `args` use `lz-string`'s `compressToEncodedURIComponent`.
  Write `args` is a plain JSON array string. See "Compressing source" below.
- The page **never auto-fires** the wallet action — the human clicks Deploy / Execute /
  Verify, then approves the popup. Only the *return* to your callback is automatic.
- `deploy` may return `pending: true` with the `txHash` even if finalization can't be
  confirmed in time (slow finality). You still get the hash — never discard it.

---

## Result envelope (page → agent)

One base64url-encoded JSON envelope for both transports:

```json
{ "v": 1, "state": "<echoed>", "action": "deploy", "ok": true,
  "result": { "contractAddress": "0x…", "txHash": "0x…", "network": "testnet-bradbury" } }
```
On failure:
```json
{ "v": 1, "state": "<echoed>", "action": "deploy", "ok": false,
  "error": { "code": "user_rejected", "message": "…" } }
```
`error.code` ∈ `user_rejected | wrong_network | insufficient_funds | validation | tx_failed | not_authenticated | internal`.

- **Loopback:** the page navigates your browser to `http://127.0.0.1:<port>/cb?payload=<base64url>`.
- **Relay:** the page stores the same `<base64url>` payload; you fetch it.

**Always verify the echoed `state` matches the token you generated before trusting a result.**

---

## Procedure

1. **Build the intent** headlessly: pick `action`, `network`, and the action params. Validate
   the contract / inputs before opening anything.
2. **Generate `state`** — 32 random bytes, base64url:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```
3. **Choose a transport** (loopback by default; relay if remote/headless/port-blocked).
4. **Open the browser to the URL and also print it** — auto-open can fail or be remote, so the
   user can always click it manually.
5. **Wait for the result**, decode the payload, verify `state`, surface `result` (or `error`).

### Open the browser (cross-platform)
| OS | Command |
|---|---|
| Windows | `cmd /c start "" "<url>"` |
| macOS | `open "<url>"` |
| Linux | `xdg-open "<url>"` |

On Windows from the Bash tool, `cmd /c start "" "<url>"` is the most reliable form (the empty
`""` is the window-title argument `start` requires when the URL is quoted).

### Compressing source (`lz-string`)
`deploy`/`verify` need the source compressed with `compressToEncodedURIComponent`:
```bash
node -e "const LZ=require('lz-string');const fs=require('fs');console.log(LZ.compressToEncodedURIComponent(fs.readFileSync(process.argv[1],'utf8')))" path/to/contract.py
```
`lz-string` has no CLI, so install it first (`npm i lz-string`) or run the snippet inside any
project that already depends on it (the Shipyard app does).

### Decode the returned payload
```bash
node -e "const e=JSON.parse(Buffer.from(process.argv[1],'base64url').toString('utf8'));console.log(JSON.stringify(e,null,2))" "<payload>"
```
Then check `e.state === <your state>` and read `e.ok` / `e.result` / `e.error`.

---

## Loopback listener (reference implementation)

Start it **before** opening the browser; it binds an ephemeral port, prints that port, and
prints the payload when the callback arrives. Save as a temp file and run it; read the port
from stderr, build the `callback` URL, then open the browser.

```js
// handoff-listener.js  —  usage: node handoff-listener.js <state>
const http = require('http');
const STATE = process.argv[2];
const TIMEOUT_MS = 180000; // ≥ 3 min: must exceed deploy finalization (~30s)

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const payload = url.searchParams.get('payload');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Done — return to your terminal.</h1>');
  if (payload) {
    try {
      const env = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (env.state !== STATE) return; // ignore stray tabs; keep waiting
    } catch { return; }
    process.stdout.write(payload + '\n'); // hand the payload back to the agent
    server.close(() => process.exit(0));
  }
});

// Bind 127.0.0.1 ONLY (never 0.0.0.0), ephemeral port.
server.listen(0, '127.0.0.1', () => {
  process.stderr.write('PORT=' + server.address().port + '\n');
});
setTimeout(() => { process.stderr.write('TIMEOUT\n'); process.exit(1); }, TIMEOUT_MS);
```

Flow:
1. `node handoff-listener.js <state>` (run in background; capture stderr for `PORT=`).
2. Build `callback=http://127.0.0.1:<port>/cb` and the full handoff URL.
3. Open the browser + print the URL.
4. When the user approves, the listener prints the base64url payload to stdout and exits.
5. Decode + verify `state`.

**Use the literal `127.0.0.1`** in both the bind and the `callback` URL — not the word
`localhost` — to avoid the IPv4/IPv6 mismatch where the listener binds `127.0.0.1` but the
browser resolves `localhost` to `[::1]` and the callback never arrives.

---

## Relay + poll (fallback)

Build the URL with `relay=1` (no `callback`), open the browser, then poll:

```bash
# poll until ready (204 = still pending). Stop after the timeout.
node -e "
const state=process.argv[1];
const url='https://genshipyard.com/api/handoff/result?state='+encodeURIComponent(state);
const deadline=Date.now()+180000;
(async function loop(){
  if(Date.now()>deadline){console.error('TIMEOUT');process.exit(1);}
  const r=await fetch(url);
  if(r.status===204){setTimeout(loop,2000);return;}      // pending — back off
  if(r.status===503){console.error('RELAY_UNAVAILABLE');process.exit(2);} // fall back to loopback
  if(!r.ok){console.error('HTTP '+r.status);process.exit(1);}
  const {payload}=await r.json();
  process.stdout.write(payload+'\n');                     // single-use: server deletes on read
}());
" "<state>"
```

The relay payload is **consumed on read** (single-use) and stored with a short TTL. If you
get `503` (`RELAY_UNAVAILABLE`), Redis isn't configured — switch to the loopback transport.

---

## Security rules (do not get these wrong)

1. **`state` is mandatory and single-use.** Only accept a result whose `state` matches the
   token you generated; ignore mismatches and keep waiting. A stray browser tab must not
   complete your run.
2. **`callback` must be loopback.** The page only navigates to `http://127.0.0.1` (or
   `localhost`/`[::1]`); it rejects anything else. Never construct an `https://` or external
   callback.
3. **Listener hardening:** bind `127.0.0.1` only (never `0.0.0.0`); ephemeral port; serve
   exactly one matching request then close; hard timeout ≥ 3 min, then abort with a clear
   message.
4. **No secrets ever cross the callback.** The signature and SIWE message stay between the
   wallet, the page, and Shipyard's own server. Never a private key or seed. If any flow asks
   you for a private key or seed phrase, stop — that is never part of this handoff.

---

## If the wallet modal doesn't open

On a freshly loaded page the browser wallet extension may not be ready the instant the page
mounts, so the first click of **Connect** can do nothing. This is a general wallet/extension
timing quirk, not specific to the handoff. Mitigation: **reload the handoff page and click
Connect again** — the page never auto-fires the wallet action, so a reload is always safe and
idempotent. In the common case the user is already connected (the app reconnects from its
session cookie), so the page shows the action button directly with no Connect step.

## Fallbacks beyond the two transports

- **No transport at all (last resort):** the page shows the result for the user to paste back;
  resume from the paste. Same trust boundary, manual return.
- **Computer-use / Playwright runtime:** drive the prefilled page yourself and pause for the
  human to approve the wallet popup. Identical boundary — you still never sign.
