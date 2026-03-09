"use client";
import { useQuery } from "@tanstack/react-query";
import { PoolV2 } from "@blend-capital/blend-sdk";
import { config, EXTERNAL, TOKENS } from "@/lib/stellar";

export interface BlendAPY {
  supplyApyBps: number;
  borrowApyBps: number;
}

async function fetchBlendAPY(): Promise<BlendAPY> {
  const network = {
    rpc: config.rpcUrl,
    passphrase: config.networkPassphrase,
  };
  const pool = await PoolV2.load(network, EXTERNAL.blendPool);
  const reserve = pool.reserves.get(TOKENS.usdc);
  if (!reserve) throw new Error("USDC reserve not found in Blend pool");
  return {
    supplyApyBps: Math.round(reserve.estSupplyApy * 10_000),
    borrowApyBps: Math.round(reserve.estBorrowApy * 10_000),
  };
}

export function useBlendAPY() {
  return useQuery<BlendAPY>({
    queryKey: ["blendAPY"],
    queryFn: fetchBlendAPY,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 2,
  });
}
