import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  defaultHardware,
  runDoctor,
  type Check,
  type HardwareState,
} from "@/lib/doctor";

export type ViewId = "desk" | "radio" | "bluetooth" | "device" | "pack";

type LabState = {
  view: ViewId;
  hardware: HardwareState;
  checks: Check[];
  ssid: string;
  channel: number;
  btName: string;
  busy: boolean;
  lastRun: string | null;
  hydrated: boolean;
  setView: (view: ViewId) => void;
  toggleHardware: (key: keyof HardwareState) => void;
  setSsid: (ssid: string) => void;
  setChannel: (channel: number) => void;
  setBtName: (name: string) => void;
  refresh: () => void;
  markHydrated: () => void;
  fixAll: () => Promise<void>;
};

function withHardware(hw: HardwareState): Pick<LabState, "hardware" | "checks"> {
  return { hardware: hw, checks: runDoctor(hw) };
}

export const useLab = create<LabState>()(
  persist(
    (set, get) => ({
      view: "desk",
      ...withHardware(defaultHardware),
      ssid: "hello",
      channel: 6,
      btName: "hello",
      busy: false,
      lastRun: null,
      hydrated: false,
      setView: (view) => set({ view }),
      toggleHardware: (key) => {
        const hardware = { ...get().hardware, [key]: !get().hardware[key] };
        set(withHardware(hardware));
      },
      setSsid: (ssid) => set({ ssid }),
      setChannel: (channel) => set({ channel }),
      setBtName: (btName) => set({ btName }),
      refresh: () => set(withHardware(get().hardware)),
      markHydrated: () => set({ hydrated: true, ...withHardware(get().hardware) }),
      fixAll: async () => {
        set({ busy: true });
        const ids = get().checks.map((c) => c.id);
        for (const id of ids) {
          set({
            checks: get().checks.map((c) =>
              c.id === id && c.status === "fail" ? { ...c, status: "fixing" } : c,
            ),
          });
          await new Promise((r) => setTimeout(r, 380));
          const hw = get().hardware;
          set({
            checks: runDoctor(hw).map((fresh) => {
              if (fresh.id === "pkgs" || fresh.id === "nm") {
                if (hw.kaliRunning && (fresh.id === "pkgs" || hw.ar9271Attached)) {
                  return {
                    ...fresh,
                    status: "fixed" as const,
                    detail: "Queued inside the helper — it installs and stops clashing services.",
                  };
                }
              }
              return fresh;
            }),
          });
        }
        set({ busy: false, lastRun: new Date().toISOString() });
      },
    }),
    {
      name: "signal-desk",
      skipHydration: true,
      partialize: (s) => ({
        hardware: s.hardware,
        ssid: s.ssid,
        channel: s.channel,
        btName: s.btName,
      }),
    },
  ),
);
