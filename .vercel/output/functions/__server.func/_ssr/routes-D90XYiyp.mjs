import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Minus, c as Cpu, d as Antenna, i as ScrollText, l as Check, n as Wrench, o as LoaderCircle, s as LayoutDashboard, t as X, u as Bluetooth } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D90XYiyp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var defaultHardware = {
	vmUsbEnabled: false,
	ar9271Attached: false,
	btDongleAttached: false,
	kaliRunning: true,
	tEmbedOnHand: true
};
function runDoctor(hw) {
	return [
		{
			id: "kali",
			title: "Kali session",
			detail: hw.kaliRunning ? "Guest is running. Doctor can write the one-shot helper." : "Start the Kali virtual machine first.",
			fix: "Power on the Kali guest, then tap Fix all again.",
			requiredFor: ["all"],
			status: hw.kaliRunning ? "pass" : "fail"
		},
		{
			id: "usb",
			title: "USB passthrough",
			detail: hw.vmUsbEnabled ? "USB 2.0/3.0 controller is on. Adapters can reach the guest." : "VirtualBox is not handing USB to Kali. Internal Wi-Fi and Bluetooth never appear inside the VM.",
			fix: "VM Settings → USB → enable USB 2.0 or 3.0. Install the Extension Pack on the host if the option is greyed out.",
			requiredFor: [
				"wifi",
				"ap",
				"ble"
			],
			status: hw.vmUsbEnabled ? "pass" : "fail"
		},
		{
			id: "ar9271",
			title: "Atheros AR9271",
			detail: hw.ar9271Attached ? "Adapter is attached to the guest. Native ath9k_htc driver, no extra install." : "No AR9271 in the guest. Monitor mode and a lab access point need this USB Wi-Fi stick.",
			fix: "Plug the Alfa/AR9271 into the host. Devices → USB → tick the Atheros device. Confirm with lsusb (0cf3:9271).",
			requiredFor: ["wifi", "ap"],
			status: hw.ar9271Attached ? "pass" : "fail"
		},
		{
			id: "bt",
			title: "Bluetooth radio",
			detail: hw.btDongleAttached ? "USB Bluetooth is attached. Local name and advertising can run." : "No Bluetooth in the VM. A laptop’s built-in Bluetooth is not passed through. AR9271 is Wi-Fi only.",
			fix: "Use a USB Bluetooth 4.0/5.0 dongle, attach it via Devices → USB. Or skip Bluetooth and use the T-Embed for BLE.",
			requiredFor: ["ble"],
			status: hw.btDongleAttached ? "pass" : "fail"
		},
		{
			id: "nm",
			title: "NetworkManager clash",
			detail: "Managed mode daemons steal the adapter. The helper kills them before monitor or AP mode.",
			fix: "The script runs airmon-ng check kill and stops NetworkManager / wpa_supplicant only for this session.",
			requiredFor: ["wifi", "ap"],
			status: hw.ar9271Attached && hw.vmUsbEnabled ? "pass" : "fail"
		},
		{
			id: "pkgs",
			title: "Lab packages",
			detail: "hostapd, dnsmasq, aircrack-ng, bluez, iw, rfkill.",
			fix: "The helper installs any missing packages with apt, then continues.",
			requiredFor: ["all"],
			status: hw.kaliRunning ? "pass" : "fail"
		},
		{
			id: "tembed",
			title: "T-Embed CC1101",
			detail: hw.tEmbedOnHand ? "Hardware on hand. Flash Bruce from the official web installer — no Kali needed for that radio." : "Optional. Buy later if you want native Bruce menus.",
			fix: "Flash at bruce.computer/flasher → LilyGo → T-Embed CC1101. Hold encoder, press RST, connect USB-C data cable.",
			requiredFor: ["all"],
			status: hw.tEmbedOnHand ? "pass" : "skip"
		}
	];
}
function canRun(checks, feature) {
	return checks.filter((c) => c.requiredFor.includes(feature) || c.requiredFor.includes("all")).every((c) => c.status === "pass" || c.status === "fixed" || c.status === "skip");
}
function withHardware(hw) {
	return {
		hardware: hw,
		checks: runDoctor(hw)
	};
}
var useLab = create()(persist((set, get) => ({
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
		set(withHardware({
			...get().hardware,
			[key]: !get().hardware[key]
		}));
	},
	setSsid: (ssid) => set({ ssid }),
	setChannel: (channel) => set({ channel }),
	setBtName: (btName) => set({ btName }),
	refresh: () => set(withHardware(get().hardware)),
	markHydrated: () => set({
		hydrated: true,
		...withHardware(get().hardware)
	}),
	fixAll: async () => {
		set({ busy: true });
		const ids = get().checks.map((c) => c.id);
		for (const id of ids) {
			set({ checks: get().checks.map((c) => c.id === id && c.status === "fail" ? {
				...c,
				status: "fixing"
			} : c) });
			await new Promise((r) => setTimeout(r, 380));
			const hw = get().hardware;
			set({ checks: runDoctor(hw).map((fresh) => {
				if (fresh.id === "pkgs" || fresh.id === "nm") {
					if (hw.kaliRunning && (fresh.id === "pkgs" || hw.ar9271Attached)) return {
						...fresh,
						status: "fixed",
						detail: "Queued inside the helper — it installs and stops clashing services."
					};
				}
				return fresh;
			}) });
		}
		set({
			busy: false,
			lastRun: (/* @__PURE__ */ new Date()).toISOString()
		});
	}
}), {
	name: "signal-desk",
	skipHydration: true,
	partialize: (s) => ({
		hardware: s.hardware,
		ssid: s.ssid,
		channel: s.channel,
		btName: s.btName
	})
}));
var NAV = [
	{
		id: "desk",
		label: "Desk",
		icon: LayoutDashboard
	},
	{
		id: "radio",
		label: "Radio",
		icon: Antenna
	},
	{
		id: "bluetooth",
		label: "Bluetooth",
		icon: Bluetooth
	},
	{
		id: "device",
		label: "T-Embed",
		icon: Cpu
	},
	{
		id: "pack",
		label: "Helper",
		icon: ScrollText
	}
];
function AppShell({ children }) {
	const view = useLab((s) => s.view);
	const setView = useLab((s) => s.setView);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex min-h-dvh max-w-6xl flex-col md:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden w-56 shrink-0 flex-col border-r border-line px-4 py-8 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-10 flex flex-col gap-1",
						children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
							active: view === item.id,
							onClick: () => setView(item.id),
							icon: item.icon,
							label: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-auto pt-8 text-xs leading-relaxed text-subtle",
						children: "Authorized lab use on radios you own. The desk prepares the helper; Kali runs it."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between border-b border-line px-5 py-4 md:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "md:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { compact: true })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden text-sm text-muted md:block",
							children: "Wireless lab control"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-muted",
							children: "Local only"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 px-5 py-6 md:px-8 md:py-8",
					children
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 backdrop-blur md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-5",
				children: NAV.map((item) => {
					const Icon = item.icon;
					const active = view === item.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setView(item.id),
						className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.12em]", active ? "text-fg" : "text-subtle"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4",
							strokeWidth: 1.6
						}), item.label]
					}, item.id);
				})
			})
		})]
	});
}
function Brand({ compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-xl tracking-tight",
			children: "Signal Desk"
		}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] uppercase tracking-[0.16em] text-subtle",
			children: "v3"
		})]
	});
}
function NavBtn({ active, onClick, icon: Icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150", active ? "bg-raised text-fg" : "text-muted hover:bg-surface hover:text-fg"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-4",
			strokeWidth: 1.6
		}), label]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/40 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:bg-fg",
			ghost: "bg-transparent text-fg border border-line hover:border-line-strong hover:bg-raised",
			sage: "bg-sage text-bg hover:opacity-90",
			danger: "bg-danger-dim text-danger border border-danger/30"
		},
		size: {
			md: "h-11 px-5",
			lg: "h-12 px-6 text-[0.95rem]",
			sm: "h-9 px-4 text-xs",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md border border-line bg-raised px-3 text-sm text-fg placeholder:text-subtle outline-none transition-colors duration-150 focus:border-line-strong focus:ring-2 focus:ring-fg/20", className),
		...props
	});
}
function downloadText(filename, contents) {
	const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
async function copyText(contents) {
	await navigator.clipboard.writeText(contents);
}
function shellEscape(value) {
	return `'${value.replace(/'/g, `'\\''`)}'`;
}
function buildHelperScript(opts) {
	const ssid = shellEscape(opts.ssid || "LabNet");
	const btName = shellEscape(opts.btName || "hello");
	const channel = Math.min(11, Math.max(1, Number(opts.channel) || 6));
	const mode = opts.mode;
	return `#!/usr/bin/env bash
# Signal Desk helper — authorized lab use on hardware you own.
# Auto-detects radios, installs missing tools, and refuses to continue when a required device is missing.
set -euo pipefail

SSID=${ssid}
CHANNEL=${channel}
BT_NAME=${btName}
MODE=${shellEscape(mode)}

RED='\\033[0;31m'; GRN='\\033[0;32m'; YLW='\\033[1;33m'; NC='\\033[0m'
ok()   { echo -e "\${GRN}[ok]\${NC} $*"; }
warn() { echo -e "\${YLW}[fix]\${NC} $*"; }
die()  { echo -e "\${RED}[stop]\${NC} $*"; exit 1; }

if [[ \${EUID} -ne 0 ]]; then
  exec sudo -E bash "\$0" "\$@"
fi

need_pkg() {
  local p
  for p in "\$@"; do
    dpkg -s "\$p" >/dev/null 2>&1 || echo "\$p"
  done
}

echo
echo "  Signal Desk · lab helper"
echo "  mode=\$MODE  ssid=\$SSID  ch=\$CHANNEL"
echo

MISSING=\$(need_pkg aircrack-ng hostapd dnsmasq iw rfkill bluez bluez-tools wireless-tools net-tools iptables python3 || true)
if [[ -n "\$MISSING" ]]; then
  warn "Installing: \$MISSING"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y \$MISSING
  ok "Packages ready"
else
  ok "Packages already present"
fi

# --- detect Wi-Fi ---
WIFI=""
MON=""
if command -v iw >/dev/null; then
  WIFI=\$(iw dev 2>/dev/null | awk '/Interface/{print \$2}' | grep -v mon | head -n1 || true)
  MON=\$(iw dev 2>/dev/null | awk '/Interface/{print \$2}' | grep -E 'mon' | head -n1 || true)
fi

lsusb | grep -qi '0cf3:9271\\|Atheros' && AR=1 || AR=0
if [[ "\$AR" -eq 1 ]]; then
  ok "Atheros AR9271 visible on USB"
else
  warn "No AR9271 (0cf3:9271) on USB. Attach it to the VM: Devices → USB."
fi

# --- detect Bluetooth ---
BT=""
if command -v hciconfig >/dev/null; then
  BT=\$(hciconfig 2>/dev/null | grep -o 'hci[0-9]' | head -n1 || true)
fi
if [[ -z "\$BT" ]]; then
  warn "No hci adapter. Built-in laptop Bluetooth is not passed into VirtualBox."
  warn "Plug a USB Bluetooth dongle and attach it to the guest, or skip BLE."
fi

stop_clash() {
  warn "Stopping NetworkManager / wpa_supplicant for this session"
  airmon-ng check kill >/dev/null 2>&1 || true
  systemctl stop NetworkManager 2>/dev/null || true
  systemctl stop wpa_supplicant 2>/dev/null || true
  rfkill unblock wifi 2>/dev/null || true
}

start_monitor() {
  [[ -n "\$WIFI" ]] || die "No Wi-Fi interface. Attach the AR9271 to the VM and re-run."
  stop_clash
  if [[ -z "\$MON" ]]; then
    airmon-ng start "\$WIFI" >/dev/null 2>&1 || {
      ip link set "\$WIFI" down
      iw dev "\$WIFI" set type monitor
      ip link set "\$WIFI" up
    }
    sleep 1
    MON=\$(iw dev 2>/dev/null | awk '/Interface/{print \$2}' | grep -E 'mon' | head -n1 || true)
    [[ -z "\$MON" ]] && MON="\$WIFI"
  fi
  ok "Monitor interface: \$MON"
  iwconfig "\$MON" 2>/dev/null | head -n 3 || true
}

start_ap() {
  [[ -n "\$WIFI" ]] || die "No Wi-Fi interface for the lab access point."
  stop_clash
  if [[ -n "\$MON" ]]; then
    airmon-ng stop "\$MON" >/dev/null 2>&1 || true
    sleep 1
    WIFI=\$(iw dev 2>/dev/null | awk '/Interface/{print \$2}' | grep -v mon | head -n1 || true)
  fi
  [[ -n "\$WIFI" ]] || die "Lost Wi-Fi interface after leaving monitor mode."

  mkdir -p /tmp/signal-desk
  cat > /tmp/signal-desk/hostapd.conf <<EOF
interface=\$WIFI
driver=nl80211
ssid=\$SSID
hw_mode=g
channel=\$CHANNEL
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
EOF
  cat > /tmp/signal-desk/dnsmasq.conf <<EOF
interface=\$WIFI
bind-interfaces
dhcp-range=192.168.77.10,192.168.77.80,12h
dhcp-option=3,192.168.77.1
dhcp-option=6,192.168.77.1
listen-address=192.168.77.1
EOF
  cat > /tmp/signal-desk/index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lab network</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0c0c0b; color: #efece4; margin: 0; min-height: 100vh; display: grid; place-items: center; }
    main { width: min(28rem, 92vw); border: 1px solid rgba(239,236,228,.12); border-radius: 28px; padding: 2rem; }
    h1 { font-weight: 500; font-size: 1.6rem; margin: 0 0 .5rem; }
    p { color: #9a958a; }
  </style>
</head>
<body>
  <main>
    <h1>Lab network</h1>
    <p>This is your own access point. No credentials are collected.</p>
  </main>
</body>
</html>
EOF

  ip link set "\$WIFI" down
  ip addr flush dev "\$WIFI"
  ip addr add 192.168.77.1/24 dev "\$WIFI"
  ip link set "\$WIFI" up

  pkill -f 'hostapd /tmp/signal-desk' 2>/dev/null || true
  pkill -f 'dnsmasq.*signal-desk' 2>/dev/null || true
  pkill -f 'python3 -m http.server 8088' 2>/dev/null || true

  hostapd /tmp/signal-desk/hostapd.conf -B
  dnsmasq -C /tmp/signal-desk/dnsmasq.conf
  (cd /tmp/signal-desk && python3 -m http.server 8088 >/tmp/signal-desk/http.log 2>&1 &)
  ok "Lab access point up"
  echo "    SSID     \$SSID"
  echo "    Channel  \$CHANNEL"
  echo "    Gateway  192.168.77.1"
  echo "    Page     http://192.168.77.1:8088"
  echo "    Stop     pkill hostapd; pkill dnsmasq"
}

set_bt_name() {
  [[ -n "\$BT" ]] || die "No Bluetooth adapter in this VM. Attach a USB dongle (AR9271 cannot do Bluetooth)."
  local i
  for i in \$(seq 1 10); do
    hciconfig "\$BT" down || true
    sleep 0.3
    hciconfig "\$BT" up
    hciconfig "\$BT" name "\$BT_NAME"
    hciconfig "\$BT" leadv 3 || true
    echo "    pass \$i/10"
    sleep 0.4
  done
  ok "Bluetooth name is \$BT_NAME on \$BT"
  hciconfig "\$BT" name
}

case "\$MODE" in
  fix)
    if [[ "\$AR" -eq 1 && -n "\$WIFI" ]]; then
      start_monitor
    else
      warn "Wi-Fi skipped — attach AR9271 first."
    fi
    if [[ -n "\$BT" ]]; then
      set_bt_name || true
    else
      warn "Bluetooth skipped — no hci device."
    fi
    ok "Fix pass complete."
    ;;
  ap)
    start_ap
    ;;
  monitor)
    start_monitor
    ;;
  bt)
    set_bt_name
    ;;
  *)
    die "Unknown mode \$MODE"
    ;;
esac
`;
}
function BluetoothView() {
	const checks = useLab((s) => s.checks);
	const ssid = useLab((s) => s.ssid);
	const channel = useLab((s) => s.channel);
	const btName = useLab((s) => s.btName);
	const setBtName = useLab((s) => s.setBtName);
	const setView = useLab((s) => s.setView);
	const ready = canRun(checks, "ble");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-xl flex-col gap-8 pb-20 md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-subtle",
						children: "Bluetooth"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "Name the dongle, not the Atheros stick"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "AR9271 is Wi-Fi only. A name like hello requires a USB Bluetooth adapter passed into the VM, or the T-Embed running Bruce."
					})
				]
			}),
			!ready && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-danger/25 bg-danger-dim px-4 py-4 text-sm text-danger",
				children: ["No Bluetooth radio in the guest. Built-in laptop Bluetooth will never appear in VirtualBox.", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setView("desk"),
						children: "Mark dongle attached"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setView("device"),
						children: "Use T-Embed instead"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4 rounded-xl border border-line bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs uppercase tracking-[0.16em] text-subtle",
						children: "Advertised name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: btName,
						maxLength: 20,
						onChange: (e) => setBtName(e.target.value),
						placeholder: "hello"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "list-decimal space-y-2 pl-5 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Plug a USB Bluetooth 4/5 dongle into the host." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Kali window → Devices → USB → tick that dongle." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Download the helper. On Kali it brings hci0 up and sets the name ten times until it sticks." })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: !ready,
				onClick: () => downloadText("signal-desk-bt.sh", buildHelperScript({
					ssid,
					channel,
					btName,
					mode: "bt"
				})),
				children: "Download Bluetooth helper"
			})
		]
	});
}
var TOGGLES = [
	{
		key: "kaliRunning",
		label: "Kali VM is running"
	},
	{
		key: "vmUsbEnabled",
		label: "USB 2.0/3.0 is enabled in the VM"
	},
	{
		key: "ar9271Attached",
		label: "AR9271 is attached to Kali"
	},
	{
		key: "btDongleAttached",
		label: "USB Bluetooth dongle is attached"
	},
	{
		key: "tEmbedOnHand",
		label: "T-Embed CC1101 is here"
	}
];
function DeskView() {
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
		downloadText("signal-desk.sh", buildHelperScript({
			ssid,
			channel,
			btName,
			mode: "fix"
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-8 pb-20 md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-subtle",
						children: "Doctor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl leading-tight tracking-tight md:text-5xl",
						children: "Tell the desk what is plugged in. It writes the rest."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xl text-muted",
						children: "Tick what you actually have. Fix all queues every repair into one helper. Drop that file on Kali and it installs tools, kills clashing services, and refuses to continue if a radio is missing."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-line bg-surface p-4 shadow-soft md:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-sm font-medium",
					children: "Hardware truth"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2",
					children: TOGGLES.map((t) => {
						const on = hardware[t.key];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => toggleHardware(t.key),
							className: "flex min-h-12 w-full items-center justify-between rounded-md bg-raised px-4 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								children: t.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: on ? "text-xs uppercase tracking-[0.14em] text-sage" : "text-xs uppercase tracking-[0.14em] text-subtle",
								children: on ? "Yes" : "No"
							})]
						}) }, t.key);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Checks"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: downloadFixer,
							children: "Download helper"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => void fixAll(),
							disabled: busy,
							children: busy ? "Fixing" : "Fix all"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-lg border border-line bg-surface px-4 py-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { status: c.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-sm font-medium",
											children: c.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] uppercase tracking-[0.14em] text-subtle",
											children: c.status
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: c.detail
									}),
									c.status === "fail" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-warn",
										children: c.fix
									})
								]
							})]
						})
					}, c.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadyCard, {
					title: "Lab access point",
					ready: wifiReady,
					hint: wifiReady ? "AR9271 is ready. Open Radio to name the network." : "Attach the AR9271 through USB passthrough.",
					onClick: () => setView("radio")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadyCard, {
					title: "Bluetooth name",
					ready: bleReady,
					hint: bleReady ? "Dongle attached. Open Bluetooth to set hello." : "AR9271 cannot do Bluetooth. Attach a USB dongle or use the T-Embed.",
					onClick: () => setView("bluetooth")
				})]
			})
		]
	});
}
function StatusIcon({ status }) {
	if (status === "pass" || status === "fixed") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
		className: "mt-0.5 size-4 text-sage",
		strokeWidth: 1.8
	});
	if (status === "fixing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mt-0.5 size-4 animate-spin text-muted" });
	if (status === "skip") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "mt-0.5 size-4 text-subtle" });
	if (status === "fail") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mt-0.5 size-4 text-danger" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "mt-0.5 size-4 text-muted" });
}
function ReadyCard({ title, ready, hint, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "rounded-lg border border-line bg-surface p-5 text-left transition-colors duration-150 hover:border-line-strong",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.16em] text-subtle",
				children: ready ? "Ready" : "Blocked"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 font-display text-2xl tracking-tight",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: hint
			})
		]
	});
}
var STEPS = [
	{
		n: "01",
		title: "Data cable",
		body: "Use a USB-C cable that actually carries data. Charge-only cables fail silently."
	},
	{
		n: "02",
		title: "Download mode",
		body: "Hold the encoder (middle button). Press RST on the board, or plug in while holding the encoder. Release after the host sees a serial port."
	},
	{
		n: "03",
		title: "Official flasher",
		body: "Open bruce.computer/flasher. Choose LilyGo → T-Embed CC1101 (Plus uses the same build). Connect, erase if you want a clean slate, install."
	},
	{
		n: "04",
		title: "First boot",
		body: "Press RST. Wi-Fi AP, BLE spam/name tools, Sub-GHz, and Evil Portal live in the Bruce menus on the device — not inside the Kali VM."
	}
];
function DeviceView() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-xl flex-col gap-8 pb-20 md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-subtle",
						children: "T-Embed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "Flash Bruce. Skip the VM for radios."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "The CC1101 Plus is the device that actually has Wi-Fi, Bluetooth, and Sub-GHz on one board. Kali plus AR9271 stays useful for 2.4 GHz lab work; Bruce is the pocket console."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-3",
				children: STEPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-line bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-subtle",
							children: s.n
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-2xl tracking-tight",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: s.body
						})
					]
				}, s.n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "https://bruce.computer/flasher",
					target: "_blank",
					rel: "noreferrer",
					children: "Open Bruce flasher"
				})
			})
		]
	});
}
function PackView() {
	const ssid = useLab((s) => s.ssid);
	const channel = useLab((s) => s.channel);
	const btName = useLab((s) => s.btName);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const script = buildHelperScript({
		ssid,
		channel,
		btName,
		mode: "fix"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-8 pb-20 md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-subtle",
						children: "Helper"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "One file. It refuses to guess."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "On Kali: copy to the guest, chmod +x, run. It elevates itself, installs missing packages, and stops if USB radios are missing instead of printing empty hciconfig errors."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => downloadText("signal-desk.sh", script),
					children: "Download signal-desk.sh"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: async () => {
						await copyText(script);
						setCopied(true);
						setTimeout(() => setCopied(false), 1600);
					},
					children: copied ? "Copied" : "Copy script"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "max-h-[28rem] overflow-auto rounded-lg border border-line bg-raised p-4 font-mono text-[11px] leading-relaxed text-muted",
				children: script
			})
		]
	});
}
function RadioView() {
	const checks = useLab((s) => s.checks);
	const ssid = useLab((s) => s.ssid);
	const channel = useLab((s) => s.channel);
	const btName = useLab((s) => s.btName);
	const setSsid = useLab((s) => s.setSsid);
	const setChannel = useLab((s) => s.setChannel);
	const setView = useLab((s) => s.setView);
	const ready = canRun(checks, "ap");
	function download(mode) {
		downloadText(mode === "ap" ? "signal-desk-ap.sh" : "signal-desk-monitor.sh", buildHelperScript({
			ssid,
			channel,
			btName,
			mode
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-xl flex-col gap-8 pb-20 md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-subtle",
						children: "Radio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "Your lab access point"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "This broadcasts an open network from the AR9271 you own. It does not collect passwords and it does not attack anyone else’s router."
					})
				]
			}),
			!ready && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-warn/30 bg-raised px-4 py-4 text-sm text-warn",
				children: ["Doctor is blocking Radio. Attach the AR9271 to Kali, then return.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setView("desk"),
						children: "Open desk"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4 rounded-xl border border-line bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs uppercase tracking-[0.16em] text-subtle",
							children: "Network name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: ssid,
							maxLength: 32,
							onChange: (e) => setSsid(e.target.value),
							placeholder: "hello"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs uppercase tracking-[0.16em] text-subtle",
							children: "Channel (1–11)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 1,
							max: 11,
							value: channel,
							onChange: (e) => setChannel(Number(e.target.value))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Helper will bring the stick out of monitor mode, assign 192.168.77.1, start hostapd + DHCP, and serve a simple lab page."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					disabled: !ready,
					onClick: () => download("ap"),
					children: "Download AP helper"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "flex-1",
					disabled: !ready,
					onClick: () => download("monitor"),
					children: "Download monitor helper"
				})]
			})
		]
	});
}
function Home() {
	const view = useLab((s) => s.view);
	(0, import_react.useEffect)(() => {
		const result = useLab.persist.rehydrate();
		Promise.resolve(result).then(() => {
			useLab.getState().markHydrated();
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		view === "desk" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskView, {}),
		view === "radio" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioView, {}),
		view === "bluetooth" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BluetoothView, {}),
		view === "device" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceView, {}),
		view === "pack" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackView, {})
	] });
}
//#endregion
export { Home as component };
