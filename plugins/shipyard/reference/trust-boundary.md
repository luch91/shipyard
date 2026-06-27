# Trust boundary — what the agent does vs. what the wallet signs

Shipyard's trust boundary maps 1:1 onto the app's own gates. It is traceable to source,
not a judgment call. **The agent prepares everything that needs no key, triggers the
user's wallet popup via the handoff ([wallet-handoff.md](./wallet-handoff.md)), then resumes
from the returned result.** Reads never trigger a popup.

| Action | Gate in the app | Signature type | On-chain / gas? | Agent autonomy |
|---|---|---|---|---|
| Read methods | none | none | no | **Fully autonomous** |
| Browse / find in registry | none (read-only) | none | no | **Fully autonomous** |
| Verify — **authenticity** | server requires a SIWE session | off-chain SIWE message | **no (gasless)** | Prep autonomous → **wallet popup** to sign in |
| Verify — **attribution to your wallet** | credited only if deployer == session wallet | off-chain SIWE by the deployer wallet | no | **wallet popup** with the deploying wallet |
| Write methods | "Connect wallet to execute" | on-chain tx | **yes (gas)** | Prep autonomous → **wallet popup** to sign |
| Deploy | "Connect wallet to deploy" | on-chain tx | **yes (gas)** | Prep autonomous → **wallet popup** to sign |

## The one rule

> The agent prepares everything that needs no key, opens the wallet popup via the handoff,
> and resumes from the public result. It never holds a key and never signs.

## Verify is NOT a chain transaction

- **Authenticity is trustless:** the server compares the submitted source to the real
  on-chain code (or to the code embedded in the deploy tx). No signature proves authenticity.
- **The only auth is a SIWE session** — one off-chain, gasless message signature exchanged
  for a session cookie.
- **Attribution** to your wallet requires the signed-in wallet to equal the deploy-tx sender.
  A non-deployer can still verify *authenticity* (unattributed) — a graceful fallback.
- So verify is the **cheapest** gated action (gasless) — still a real popup, but a sign-in
  message, not a spend.

## Hard limits (never cross these)

- **Never** ask for, handle, store, or transmit a private key or seed phrase. Signing is
  always the user's own wallet popup.
- **No throwaway keys, no env-var private keys, no silent signing.** A signature always
  needs the human to click **Approve** at that moment.
- Only **public outcomes** cross the handoff callback — tx hash, contract address, booleans.
  Never a signature, message, key, or seed.
