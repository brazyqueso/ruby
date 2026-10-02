import {
  Antenna,
  Bluetooth,
  Cpu,
  LayoutDashboard,
  ScrollText,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLab, type ViewId } from "@/store/lab";

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "desk", label: "Desk", icon: LayoutDashboard },
  { id: "radio", label: "Radio", icon: Antenna },
  { id: "bluetooth", label: "Bluetooth", icon: Bluetooth },
  { id: "device", label: "T-Embed", icon: Cpu },
  { id: "pack", label: "Helper", icon: ScrollText },
];

export function AppShell({ children }: { children: ReactNode }) {
  const view = useLab((s) => s.view);
  const setView = useLab((s) => s.setView);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col md:flex-row">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-line px-4 py-8 md:flex">
          <Brand />
          <nav className="mt-10 flex flex-col gap-1">
            {NAV.map((item) => (
              <NavBtn
                key={item.id}
                active={view === item.id}
                onClick={() => setView(item.id)}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
          <p className="mt-auto pt-8 text-xs leading-relaxed text-subtle">
            Authorized lab use on radios you own. The desk prepares the helper; Kali runs it.
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-line px-5 py-4 md:px-8">
            <div className="md:hidden">
              <Brand compact />
            </div>
            <p className="hidden text-sm text-muted md:block">Wireless lab control</p>
            <span className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-muted">
              Local only
            </span>
          </header>
          <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.12em]",
                  active ? "text-fg" : "text-subtle",
                )}
              >
                <Icon className="size-4" strokeWidth={1.6} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-xl tracking-tight">Signal Desk</span>
      {!compact && (
        <span className="text-[11px] uppercase tracking-[0.16em] text-subtle">v3</span>
      )}
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150",
        active ? "bg-raised text-fg" : "text-muted hover:bg-surface hover:text-fg",
      )}
    >
      <Icon className="size-4" strokeWidth={1.6} />
      {label}
    </button>
  );
}
