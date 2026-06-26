"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { VaultConfig, ProfileId } from "../config/types";
import { freshDefaultConfig } from "../config/defaults";
import { applyProfile } from "../config/presets";
import { decodeConfigFromHash, encodeConfigToHash } from "../share/shareConfig";
import { parseConfigJson } from "../config/io";

const STORAGE_KEY = "vault-configurator:config:v1";

interface VaultConfigContextValue {
  config: VaultConfig;
  /** True once client-side hydration (hash/localStorage) has run. */
  hydrated: boolean;
  /** Replace the entire config. */
  setConfig: (next: VaultConfig) => void;
  /** Mutate a structural clone of the config (ergonomic nested updates). */
  update: (mutator: (draft: VaultConfig) => void) => void;
  /** Apply a starter profile, preserving the vault name. */
  setProfile: (profile: ProfileId) => void;
  /** Reset to defaults and clear persistence. */
  reset: () => void;
  /** Notice shown when an incoming share hash was invalid. */
  shareError: boolean;
  dismissShareError: () => void;
}

const VaultConfigContext = createContext<VaultConfigContextValue | null>(null);

function loadInitial(): { config: VaultConfig; shareError: boolean } {
  if (typeof window === "undefined") {
    return { config: freshDefaultConfig(), shareError: false };
  }
  // Priority: URL hash > localStorage > defaults.
  if (window.location.hash) {
    const fromHash = decodeConfigFromHash(window.location.hash);
    if (fromHash) return { config: fromHash, shareError: false };
    // Hash present but invalid → flag it, fall through.
    if (window.location.hash.includes("cfg=")) {
      return { config: freshDefaultConfig(), shareError: true };
    }
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseConfigJson(stored);
      if (parsed.ok) return { config: parsed.config, shareError: false };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return { config: freshDefaultConfig(), shareError: false };
}

export function VaultConfigProvider({ children }: { children: ReactNode }) {
  // Start from defaults on both server and first client render to avoid mismatch.
  const [config, setConfigState] = useState<VaultConfig>(freshDefaultConfig);
  const [hydrated, setHydrated] = useState(false);
  const [shareError, setShareError] = useState(false);
  const didInit = useRef(false);

  // Hydrate from hash / localStorage after mount.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const { config: initial, shareError: err } = loadInitial();
    setConfigState(initial);
    setShareError(err);
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever config changes (post-hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* storage may be unavailable */
    }
  }, [config, hydrated]);

  const setConfig = useCallback((next: VaultConfig) => setConfigState(next), []);

  const update = useCallback((mutator: (draft: VaultConfig) => void) => {
    setConfigState((prev) => {
      const draft = structuredClone(prev);
      mutator(draft);
      return draft;
    });
  }, []);

  const setProfile = useCallback((profile: ProfileId) => {
    setConfigState((prev) => applyProfile(prev, profile));
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    } catch {
      /* ignore */
    }
    setConfigState(freshDefaultConfig());
    setShareError(false);
  }, []);

  const dismissShareError = useCallback(() => setShareError(false), []);

  return (
    <VaultConfigContext.Provider
      value={{
        config,
        hydrated,
        setConfig,
        update,
        setProfile,
        reset,
        shareError,
        dismissShareError,
      }}
    >
      {children}
    </VaultConfigContext.Provider>
  );
}

export function useVaultConfig(): VaultConfigContextValue {
  const ctx = useContext(VaultConfigContext);
  if (!ctx) throw new Error("useVaultConfig must be used within VaultConfigProvider");
  return ctx;
}

export { encodeConfigToHash };
