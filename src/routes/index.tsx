import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { BluetoothView } from "@/views/bluetooth-view";
import { DeskView } from "@/views/desk-view";
import { DeviceView } from "@/views/device-view";
import { PackView } from "@/views/pack-view";
import { RadioView } from "@/views/radio-view";
import { useLab } from "@/store/lab";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const view = useLab((s) => s.view);

  useEffect(() => {
    const result = useLab.persist.rehydrate();
    void Promise.resolve(result).then(() => {
      useLab.getState().markHydrated();
    });
  }, []);

  return (
    <AppShell>
      {view === "desk" && <DeskView />}
      {view === "radio" && <RadioView />}
      {view === "bluetooth" && <BluetoothView />}
      {view === "device" && <DeviceView />}
      {view === "pack" && <PackView />}
    </AppShell>
  );
}
