import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { canRun } from "@/lib/doctor";
import { downloadText } from "@/lib/download";
import { buildHelperScript } from "@/lib/helper-script";
import { useLab } from "@/store/lab";

export function BluetoothView() {
  const checks = useLab((s) => s.checks);
  const ssid = useLab((s) => s.ssid);
  const channel = useLab((s) => s.channel);
  const btName = useLab((s) => s.btName);
  const setBtName = useLab((s) => s.setBtName);
  const setView = useLab((s) => s.setView);
  const ready = canRun(checks, "ble");

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 pb-20 md:pb-0">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Bluetooth</p>
        <h1 className="font-display text-4xl tracking-tight">Name the dongle, not the Atheros stick</h1>
        <p className="text-muted">
          AR9271 is Wi-Fi only. A name like hello requires a USB Bluetooth adapter passed into the VM, or the T-Embed running Bruce.
        </p>
      </header>

      {!ready && (
        <div className="rounded-lg border border-danger/25 bg-danger-dim px-4 py-4 text-sm text-danger">
          No Bluetooth radio in the guest. Built-in laptop Bluetooth will never appear in VirtualBox.
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView("desk")}>
              Mark dongle attached
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setView("device")}>
              Use T-Embed instead
            </Button>
          </div>
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-line bg-surface p-5">
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-subtle">Advertised name</span>
          <Input
            value={btName}
            maxLength={20}
            onChange={(e) => setBtName(e.target.value)}
            placeholder="hello"
          />
        </label>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Plug a USB Bluetooth 4/5 dongle into the host.</li>
          <li>Kali window → Devices → USB → tick that dongle.</li>
          <li>Download the helper. On Kali it brings hci0 up and sets the name ten times until it sticks.</li>
        </ol>
      </section>

      <Button
        disabled={!ready}
        onClick={() =>
          downloadText(
            "signal-desk-bt.sh",
            buildHelperScript({ ssid, channel, btName, mode: "bt" }),
          )
        }
      >
        Download Bluetooth helper
      </Button>
    </div>
  );
}
