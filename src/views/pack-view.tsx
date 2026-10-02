import { Button } from "@/components/ui/button";
import { copyText, downloadText } from "@/lib/download";
import { buildHelperScript } from "@/lib/helper-script";
import { useLab } from "@/store/lab";
import { useState } from "react";

export function PackView() {
  const ssid = useLab((s) => s.ssid);
  const channel = useLab((s) => s.channel);
  const btName = useLab((s) => s.btName);
  const [copied, setCopied] = useState(false);
  const script = buildHelperScript({ ssid, channel, btName, mode: "fix" });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-20 md:pb-0">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Helper</p>
        <h1 className="font-display text-4xl tracking-tight">One file. It refuses to guess.</h1>
        <p className="text-muted">
          On Kali: copy to the guest, chmod +x, run. It elevates itself, installs missing packages, and stops if USB radios are missing instead of printing empty hciconfig errors.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => downloadText("signal-desk.sh", script)}
        >
          Download signal-desk.sh
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            await copyText(script);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? "Copied" : "Copy script"}
        </Button>
      </div>

      <pre className="max-h-[28rem] overflow-auto rounded-lg border border-line bg-raised p-4 font-mono text-[11px] leading-relaxed text-muted">
        {script}
      </pre>
    </div>
  );
}
