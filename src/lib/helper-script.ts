export type HelperOptions = {
  ssid: string;
  channel: number;
  btName: string;
  mode: "fix" | "ap" | "monitor" | "bt";
};

function shellEscape(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export function buildHelperScript(opts: HelperOptions) {
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
