import { Check, LoaderCircle, Minus, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canRun } from "@/lib/doctor";
import { buildHelperScript } from "@/lib/helper-script";
import { downloadText } from "@/lib/download";
import { useLab } from "@/store/lab";

const TOGGLES = [
  { key: "kaliRunning", label: "Kali VM is running" },
  { key: "vmUsbEnabled", label: "USB 2.0/3.0 is enabled in the VM" },
  { key: "ar9271Attached", label: "AR9271 is attached to Kali" },
  { key: "btDongleAttached", label: "USB Bluetooth dongle is attached" },
  { key: "tEmbedOnHand", label: "T-Embed CC1101 is here" },
] as const;

export function DeskView() {
  const hardware = useLab((s) => s.hardware);
  const checks = useLab((s) => s.checks);
  const toggleHardware = useLab((s) => s.toggleHardware);
  const fixAll = useLab((s) => s.fixAll);
  const busy = useLab((s) => s.busy);
  const ssid = useLab((s) => s.ssid);
  const channel = useLab((s) => s.channel);
  const btName = useLab((s) => s.btName);
  const setView = useLab((s) => s.setView);

  const wifiReady = canRun(checks, "ap");
  const bleReady = canRun(checks, "ble");

  function downloadFixer() {
    downloadText(
      "signal-desk.sh",
      buildHelperScript({ ssid, channel, btName, mode: "fix" }),
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-20 md:pb-0">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Doctor</p>
        <h1 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">
          Tell the desk what is plugged in. It writes the rest.
        </h1>
        <p className="max-w-xl text-muted">
          Tick what you actually have. Fix all queues every repair into one helper. Drop that file on Kali and it installs tools, kills clashing services, and refuses to continue if a radio is missing.
        </p>
      </header>

      <section className="rounded-xl border border-line bg-surface p-4 shadow-soft md:p-5">
        <h2 className="mb-4 text-sm font-medium">Hardware truth</h2>
        <ul className="grid gap-2">
          {TOGGLES.map((t) => {
            const on = hardware[t.key];
            return (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => toggleHardware(t.key)}
                  className="flex min-h-12 w-full items-center justify-between rounded-md bg-raised px-4 text-left"
                >
                  <span className="text-sm">{t.label}</span>
                  <span
                    className={
                      on
                        ? "text-xs uppercase tracking-[0.14em] text-sage"
                        : "text-xs uppercase tracking-[0.14em] text-subtle"
                    }
                  >
                    {on ? "Yes" : "No"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Checks</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={downloadFixer}>
              Download helper
            </Button>
            <Button onClick={() => void fixAll()} disabled={busy}>
              {busy ? "Fixing" : "Fix all"}
            </Button>
          </div>
        </div>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-line bg-surface px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <StatusIcon status={c.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-medium">{c.title}</h3>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-subtle">
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{c.detail}</p>
                  {c.status === "fail" && (
                    <p className="mt-2 text-sm text-warn">{c.fix}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <ReadyCard
          title="Lab access point"
          ready={wifiReady}
          hint={
            wifiReady
              ? "AR9271 is ready. Open Radio to name the network."
              : "Attach the AR9271 through USB passthrough."
          }
          onClick={() => setView("radio")}
        />
        <ReadyCard
          title="Bluetooth name"
          ready={bleReady}
          hint={
            bleReady
              ? "Dongle attached. Open Bluetooth to set hello."
              : "AR9271 cannot do Bluetooth. Attach a USB dongle or use the T-Embed."
          }
          onClick={() => setView("bluetooth")}
        />
      </section>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "pass" || status === "fixed") {
    return <Check className="mt-0.5 size-4 text-sage" strokeWidth={1.8} />;
  }
  if (status === "fixing") {
    return <LoaderCircle className="mt-0.5 size-4 animate-spin text-muted" />;
  }
  if (status === "skip") {
    return <Minus className="mt-0.5 size-4 text-subtle" />;
  }
  if (status === "fail") {
    return <X className="mt-0.5 size-4 text-danger" />;
  }
  return <Wrench className="mt-0.5 size-4 text-muted" />;
}

function ReadyCard({
  title,
  ready,
  hint,
  onClick,
}: {
  title: string;
  ready: boolean;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-line bg-surface p-5 text-left transition-colors duration-150 hover:border-line-strong"
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-subtle">
        {ready ? "Ready" : "Blocked"}
      </p>
      <h3 className="mt-2 font-display text-2xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </button>
  );
}
