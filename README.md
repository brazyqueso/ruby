# Signal Desk

**Lab control desk that diagnoses Kali USB radios and writes a strict helper script.**

## Install & run

```bash
git clone https://github.com/brazyqueso/ruby.git
cd ruby
npm install
npm run dev
```

Then open **http://localhost:8080**

```bash
npm run build      # production build
npm run typecheck
npm run lint
```

---

Tell the desk what hardware is plugged in. It runs a doctor checklist, then generates a one-shot bash helper you drop on Kali. The helper installs missing tools, stops clashing services (NetworkManager / wpa_supplicant), and refuses to continue if a required radio is missing.

> Authorized lab use only — on radios and networks you own.

## Features

- **Hardware truth** — tick what you actually have (Kali VM, USB passthrough, AR9271, BT dongle, T-Embed CC1101)
- **Doctor checks** — pass / fail / fix guidance for Wi-Fi, AP, BLE, packages, NetworkManager clashes
- **Helper script generator** — downloads `signal-desk.sh` with modes: `fix`, `ap`, `monitor`, `bt`
- **Local only** — state in `localStorage`, no accounts, no backend required
- **Mobile + desktop** — bottom nav on phone, sidebar on desktop

## Views

| View | Purpose |
|------|---------|
| **Desk** | Hardware toggles + doctor checklist + Fix all |
| **Radio** | Lab access point (SSID + channel) |
| **Bluetooth** | Local Bluetooth name / advertising |
| **T-Embed** | Bruce flasher notes for LilyGo T-Embed CC1101 |
| **Helper** | Preview / download the generated script |

## Tech

- React 19 + TanStack Start / Router / Query
- Tailwind CSS v4 + Radix UI
- Zustand (persisted lab state)
- Vite + Nitro (Vercel preset)

## License

MIT — see [LICENSE](LICENSE).

Use at your own risk. Intended for authorized wireless lab work only.
