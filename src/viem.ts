import "server-only";

import { createPublicClient, http } from "viem";
import { tempo } from "viem/chains";
import { tempoActions } from "viem/tempo";

import { env } from "@/env";

export const client = createPublicClient({
  chain: tempo,
  transport: http(env.TEMPO_RPC_URL),
}).extend(tempoActions());
