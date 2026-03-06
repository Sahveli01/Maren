"use client";
import { useState, useCallback, useEffect } from "react";
import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WalletStore {
  address: string | null;
  vaultAddress: string | null;
  setAddress: (a: string | null) => void;
  setVaultAddress: (a: string | null) => void;
  clear: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      address: null,
      vaultAddress: null,
      setAddress: (address) => set({ address }),
      setVaultAddress: (vaultAddress) => set({ vaultAddress }),
      clear: () => set({ address: null, vaultAddress: null }),
    }),
    { name: "loopvault-wallet" }
  )
);

let initialized = false;

function ensureInit() {
  if (!initialized) {
    StellarWalletsKit.init({
      modules: [new FreighterModule()],
      network: Networks.TESTNET,
    });
    initialized = true;
  }
}

export function useWallet() {
  const { address, setAddress, clear } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-hydrate address from kit if wallet was already connected
  useEffect(() => {
    if (!address) return;
    ensureInit();
    StellarWalletsKit.setWallet(FREIGHTER_ID);
  }, [address]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      ensureInit();
      const { address: addr } = await StellarWalletsKit.authModal();
      setAddress(addr);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Wallet bağlantı hatası";
      setError(msg);
    } finally {
      setIsConnecting(false);
    }
  }, [setAddress]);

  const disconnect = useCallback(async () => {
    try {
      ensureInit();
      await StellarWalletsKit.disconnect();
    } catch {
      // ignore disconnect errors
    }
    clear();
  }, [clear]);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      if (!address) throw new Error("Wallet bağlı değil");
      ensureInit();
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        address,
        networkPassphrase: Networks.TESTNET,
      });
      return signedTxXdr;
    },
    [address]
  );

  return {
    address,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
    signTransaction,
  };
}
