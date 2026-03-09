"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildContractCall, simulateView, submitSignedTx } from "@/lib/transactions";
import { CONTRACTS, toI128, toU32, toAddress, toBytes32 } from "@/lib/stellar";
import { useWallet, useWalletStore } from "./useWallet";
import { toast } from "sonner";

// Mirrors the Soroban PositionInfo contracttype
export interface PositionInfo {
  collateral_amount: bigint;
  debt_amount: bigint;
  leverage_bps: number;
  entry_price: bigint;
  created_ledger: number;
}

// ── Factory: resolve user's vault address ─────────────────────
export function useVaultAddress() {
  const { address } = useWallet();
  const { setVaultAddress } = useWalletStore();

  return useQuery({
    queryKey: ["vaultAddress", address],
    enabled: !!address && !!CONTRACTS.factory,
    queryFn: async () => {
      const result = await simulateView(
        address!,
        CONTRACTS.factory,
        "get_vault",
        [toAddress(address!)]
      );
      const vaultAddr = result as string | null;
      setVaultAddress(vaultAddr);
      return vaultAddr;
    },
  });
}

// ── Position info ─────────────────────────────────────────────
export function usePosition() {
  const { vaultAddress } = useWalletStore();
  const { address } = useWallet();

  return useQuery({
    queryKey: ["position", vaultAddress],
    enabled: !!vaultAddress && !!address,
    refetchInterval: 15_000,
    queryFn: async () => {
      const result = await simulateView(address!, vaultAddress!, "get_position", []);
      return result as PositionInfo | null;
    },
  });
}

// ── Health factor (u32 bps, 10000 = 1.0) ─────────────────────
export function useHealthFactor() {
  const { vaultAddress } = useWalletStore();
  const { address } = useWallet();

  return useQuery({
    queryKey: ["healthFactor", vaultAddress],
    enabled: !!vaultAddress && !!address,
    refetchInterval: 10_000,
    queryFn: async () => {
      const result = await simulateView(address!, vaultAddress!, "get_health_factor", []);
      return result != null ? Number(result) : 100_000;
    },
  });
}

// ── Deploy vault (factory) ────────────────────────────────────
export function useDeployVault() {
  const { address, signTransaction } = useWallet();
  const { setVaultAddress } = useWalletStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Wallet bağlı değil");
      const xdr = await buildContractCall(
        address,
        CONTRACTS.factory,
        "deploy_vault",
        [toAddress(address)]
      );
      const signed = await signTransaction(xdr);
      const { result } = await submitSignedTx(signed);
      const vaultAddr = result as string;
      setVaultAddress(vaultAddr);
      return vaultAddr;
    },
    onSuccess: (addr: string) => {
      toast.success(`Vault oluşturuldu: ${addr.slice(0, 8)}...`);
      qc.invalidateQueries({ queryKey: ["vaultAddress", address] });
    },
    onError: (e: Error) => {
      toast.error(`Vault oluşturulamadı: ${e.message ?? "Bilinmeyen hata"}`);
    },
  });
}

// Vault v3 WASM hash — exit buffer fix
const VAULT_V3_WASM_HASH =
  "20281f69c47005bc0392e12ad914254e07cca0297b43341373e486e81a7f016e";

// ── Vault version check ───────────────────────────────────────
export function useVaultVersion() {
  const { vaultAddress } = useWalletStore();
  const { address } = useWallet();

  return useQuery({
    queryKey: ["vaultVersion", vaultAddress],
    enabled: !!vaultAddress && !!address,
    queryFn: async () => {
      const result = await simulateView(address!, vaultAddress!, "version", []);
      return result != null ? Number(result) : 0;
    },
  });
}

// ── Upgrade vault WASM in-place (owner signs) ─────────────────
export function useUpgradeVault() {
  const { address, signTransaction } = useWallet();
  const { vaultAddress } = useWalletStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!address || !vaultAddress) throw new Error("Vault bağlı değil");
      const xdr = await buildContractCall(
        address,
        vaultAddress,
        "upgrade",
        [toBytes32(VAULT_V3_WASM_HASH)]
      );
      const signed = await signTransaction(xdr);
      return submitSignedTx(signed, (s) => toast.info(s));
    },
    onSuccess: ({ hash }: { hash: string }) => {
      toast.success(`Vault güncellendi! TX: ${hash.slice(0, 8)}...`);
      qc.invalidateQueries({ queryKey: ["vaultVersion", vaultAddress] });
    },
    onError: (e: Error) => {
      toast.error(`Vault güncellenemedi: ${e.message ?? "Bilinmeyen hata"}`);
    },
  });
}

// ── Enter leveraged position ──────────────────────────────────
export function useEnterPosition() {
  const { address, signTransaction } = useWallet();
  const { vaultAddress } = useWalletStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      principal,
      leverageBps,
      minCollateral,
    }: {
      principal: bigint;
      leverageBps: number;
      minCollateral: bigint;
    }) => {
      if (!address || !vaultAddress) throw new Error("Vault bağlı değil");
      const xdr = await buildContractCall(
        address,
        vaultAddress,
        "enter",
        [toI128(principal), toU32(leverageBps), toI128(minCollateral)]
      );
      const signed = await signTransaction(xdr);
      return submitSignedTx(signed, (s) => toast.info(s));
    },
    onSuccess: ({ hash }: { hash: string }) => {
      toast.success(`Pozisyon açıldı! TX: ${hash.slice(0, 8)}...`);
      qc.invalidateQueries({ queryKey: ["position"] });
      qc.invalidateQueries({ queryKey: ["healthFactor"] });
    },
    onError: (e: Error) => {
      toast.error(`Pozisyon açılamadı: ${e.message ?? "Bilinmeyen hata"}`);
    },
  });
}

// ── Exit position ─────────────────────────────────────────────
export function useExitPosition() {
  const { address, signTransaction } = useWallet();
  const { vaultAddress } = useWalletStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (minReturn: bigint) => {
      if (!address || !vaultAddress) throw new Error("Vault bağlı değil");
      const xdr = await buildContractCall(
        address,
        vaultAddress,
        "exit",
        [toI128(minReturn)]
      );
      const signed = await signTransaction(xdr);
      return submitSignedTx(signed, (s) => toast.info(s));
    },
    onSuccess: ({ hash }: { hash: string }) => {
      toast.success(`Pozisyon kapatıldı! TX: ${hash.slice(0, 8)}...`);
      qc.invalidateQueries({ queryKey: ["position"] });
      qc.invalidateQueries({ queryKey: ["healthFactor"] });
    },
    onError: (e: Error) => {
      toast.error(`Pozisyon kapatılamadı: ${e.message ?? "Bilinmeyen hata"}`);
    },
  });
}
