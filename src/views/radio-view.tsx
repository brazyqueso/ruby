import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { canRun } from "@/lib/doctor";
import { downloadText } from "@/lib/download";
import { buildHelperScript } from "@/lib/helper-script";
import { useLab } from "@/store/lab";

export function RadioView() {
  const checks = useLab((s) => s.checks);
  const ssid = useLab((s) => s.ssid);
  const channel = useLab((s) => s.channel);
  const btName = useLab((s) => s.btName);
  const setSsid = useLab((s) => s.setSsid);
  const setChannel = useLab((s) => s.setChannel);
  const setView = useLab((s) => s.setView);
  const ready = canRun(checks, "ap");

  function download(mode: "ap" | "monitor") {
    downloadText(
      mode === "ap" ? "signal-desk-ap.sh" : "signal-desk-monitor.sh",
      buildHelperScript({ ssid, channel, btName, mode }),
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 pb-20 md:pb-0">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Radio</p>
        <h1 className="font-display text-4xl tracking-tight">Your lab access point</h1>
        <p className="text-muted">
          This broadcasts an open network from the AR9271 you own. It does not collect passwords and it does not attack anyone else’s router.
        </p>
      </header>

      {!ready && (
        <div className="rounded-lg border border-warn/30 bg-raised px-4 py-4 text-sm text-warn">
          Doctor is blocking Radio. Attach the AR9271 to Kali, then return.
          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={() => setView("desk")}>
              Open desk
            </Button>
          </div>
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-line bg-surface p-5">
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-subtle">Network name</span>
          <Input
            value={ssid}
            maxLength={32}
            onChange={(e) => setSsid(e.target.value)}
            placeholder="hello"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-subtle">Channel (1–11)</span>
          <Input
            type="number"
            min={1}
            max={11}
            value={channel}
            onChange={(e) => setChannel(Number(e.target.value))}
          />
        </label>
        <p className="text-sm text-muted">
          Helper will bring the stick out of monitor mode, assign 192.168.77.1, start hostapd + DHCP, and serve a simple lab page.
        </p>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1" disabled={!ready} onClick={() => download("ap")}>
          Download AP helper
        </Button>
        <Button variant="ghost" className="flex-1" disabled={!ready} onClick={() => download("monitor")}>
          Download monitor helper
        </Button>
      </div>
    </div>
  );
}
