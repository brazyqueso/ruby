export type HardwareState = {
  vmUsbEnabled: boolean;
  ar9271Attached: boolean;
  btDongleAttached: boolean;
  kaliRunning: boolean;
  tEmbedOnHand: boolean;
};

export type CheckStatus = "pass" | "fail" | "skip" | "fixing" | "fixed";

export type Check = {
  id: string;
  title: string;
  detail: string;
  fix: string;
  requiredFor: Array<"wifi" | "ap" | "ble" | "all">;
  status: CheckStatus;
};

export const defaultHardware: HardwareState = {
  vmUsbEnabled: false,
  ar9271Attached: false,
  btDongleAttached: false,
  kaliRunning: true,
  tEmbedOnHand: true,
};

export function runDoctor(hw: HardwareState): Check[] {
  return [
    {
      id: "kali",
      title: "Kali session",
      detail: hw.kaliRunning
        ? "Guest is running. Doctor can write the one-shot helper."
        : "Start the Kali virtual machine first.",
      fix: "Power on the Kali guest, then tap Fix all again.",
      requiredFor: ["all"],
      status: hw.kaliRunning ? "pass" : "fail",
    },
    {
      id: "usb",
      title: "USB passthrough",
      detail: hw.vmUsbEnabled
        ? "USB 2.0/3.0 controller is on. Adapters can reach the guest."
        : "VirtualBox is not handing USB to Kali. Internal Wi-Fi and Bluetooth never appear inside the VM.",
      fix: "VM Settings → USB → enable USB 2.0 or 3.0. Install the Extension Pack on the host if the option is greyed out.",
      requiredFor: ["wifi", "ap", "ble"],
      status: hw.vmUsbEnabled ? "pass" : "fail",
    },
    {
      id: "ar9271",
      title: "Atheros AR9271",
      detail: hw.ar9271Attached
        ? "Adapter is attached to the guest. Native ath9k_htc driver, no extra install."
        : "No AR9271 in the guest. Monitor mode and a lab access point need this USB Wi-Fi stick.",
      fix: "Plug the Alfa/AR9271 into the host. Devices → USB → tick the Atheros device. Confirm with lsusb (0cf3:9271).",
      requiredFor: ["wifi", "ap"],
      status: hw.ar9271Attached ? "pass" : "fail",
    },
    {
      id: "bt",
      title: "Bluetooth radio",
      detail: hw.btDongleAttached
        ? "USB Bluetooth is attached. Local name and advertising can run."
        : "No Bluetooth in the VM. A laptop’s built-in Bluetooth is not passed through. AR9271 is Wi-Fi only.",
      fix: "Use a USB Bluetooth 4.0/5.0 dongle, attach it via Devices → USB. Or skip Bluetooth and use the T-Embed for BLE.",
      requiredFor: ["ble"],
      status: hw.btDongleAttached ? "pass" : "fail",
    },
    {
      id: "nm",
      title: "NetworkManager clash",
      detail: "Managed mode daemons steal the adapter. The helper kills them before monitor or AP mode.",
      fix: "The script runs airmon-ng check kill and stops NetworkManager / wpa_supplicant only for this session.",
      requiredFor: ["wifi", "ap"],
      status: hw.ar9271Attached && hw.vmUsbEnabled ? "pass" : "fail",
    },
    {
      id: "pkgs",
      title: "Lab packages",
      detail: "hostapd, dnsmasq, aircrack-ng, bluez, iw, rfkill.",
      fix: "The helper installs any missing packages with apt, then continues.",
      requiredFor: ["all"],
      status: hw.kaliRunning ? "pass" : "fail",
    },
    {
      id: "tembed",
      title: "T-Embed CC1101",
      detail: hw.tEmbedOnHand
        ? "Hardware on hand. Flash Bruce from the official web installer — no Kali needed for that radio."
        : "Optional. Buy later if you want native Bruce menus.",
      fix: "Flash at bruce.computer/flasher → LilyGo → T-Embed CC1101. Hold encoder, press RST, connect USB-C data cable.",
      requiredFor: ["all"],
      status: hw.tEmbedOnHand ? "pass" : "skip",
    },
  ];
}

export function canRun(checks: Check[], feature: "wifi" | "ap" | "ble"): boolean {
  return checks
    .filter((c) => c.requiredFor.includes(feature) || c.requiredFor.includes("all"))
    .every((c) => c.status === "pass" || c.status === "fixed" || c.status === "skip");
}
