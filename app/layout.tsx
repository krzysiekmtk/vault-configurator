import type { Metadata } from "next";
import "./globals.css";
import { VaultConfigProvider } from "@/lib/state/useVaultConfig";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Vault Configurator — Build your perfect Obsidian vault in minutes",
  description:
    "Configure an Obsidian vault, preview it live, then download it as a ZIP or copy a ready-to-paste Claude Code prompt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VaultConfigProvider>
          <ToastProvider>{children}</ToastProvider>
        </VaultConfigProvider>
      </body>
    </html>
  );
}
