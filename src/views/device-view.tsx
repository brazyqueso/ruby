import { Button } from "@/components/ui/button";

const STEPS = [
  {
    n: "01",
    title: "Data cable",
    body: "Use a USB-C cable that actually carries data. Charge-only cables fail silently.",
  },
  {
    n: "02",
    title: "Download mode",
    body: "Hold the encoder (middle button). Press RST on the board, or plug in while holding the encoder. Release after the host sees a serial port.",
  },
  {
    n: "03",
    title: "Official flasher",
    body: "Open bruce.computer/flasher. Choose LilyGo → T-Embed CC1101 (Plus uses the same build). Connect, erase if you want a clean slate, install.",
  },
  {
    n: "04",
    title: "First boot",
    body: "Press RST. Wi-Fi AP, BLE spam/name tools, Sub-GHz, and Evil Portal live in the Bruce menus on the device — not inside the Kali VM.",
  },
];

export function DeviceView() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 pb-20 md:pb-0">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">T-Embed</p>
        <h1 className="font-display text-4xl tracking-tight">Flash Bruce. Skip the VM for radios.</h1>
        <p className="text-muted">
          The CC1101 Plus is the device that actually has Wi-Fi, Bluetooth, and Sub-GHz on one board. Kali plus AR9271 stays useful for 2.4 GHz lab work; Bruce is the pocket console.
        </p>
      </header>

      <ol className="space-y-3">
        {STEPS.map((s) => (
          <li key={s.n} className="rounded-lg border border-line bg-surface p-5">
            <p className="font-mono text-xs text-subtle">{s.n}</p>
            <h2 className="mt-1 font-display text-2xl tracking-tight">{s.title}</h2>
            <p className="mt-2 text-sm text-muted">{s.body}</p>
          </li>
        ))}
      </ol>

      <Button asChild>
        <a href="https://bruce.computer/flasher" target="_blank" rel="noreferrer">
          Open Bruce flasher
        </a>
      </Button>
    </div>
  );
}
