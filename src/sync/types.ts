import type { Address, Hex } from "viem";

export type DecodedEvent =
  | {
      type: "opened";
      channelId: Hex;
      payer: Address;
      payee: Address;
      operator: Address;
      token: Address;
      authorizedSigner: Address;
      salt: Hex;
      expiringNonceHash: Hex;
      deposit: bigint;
    }
  | {
      type: "settled";
      channelId: Hex;
      payer: Address;
      payee: Address;
      cumulative: bigint;
      deltaPaid: bigint;
      newSettled: bigint;
    }
  | {
      type: "top_up";
      channelId: Hex;
      payer: Address;
      payee: Address;
      additionalDeposit: bigint;
      newDeposit: bigint;
    }
  | {
      type: "close_requested";
      channelId: Hex;
      payer: Address;
      payee: Address;
      closeGraceEnd: bigint;
    }
  | {
      type: "close_cancelled";
      channelId: Hex;
      payer: Address;
      payee: Address;
    }
  | {
      type: "closed";
      channelId: Hex;
      payer: Address;
      payee: Address;
      settledToPayee: bigint;
      refundedToPayer: bigint;
    };

export type IndexedEvent = DecodedEvent & {
  txHash: Hex;
  logIndex: number;
  blockNum: number;
  timestamp: Date;
};

export type TidxLogRow = {
  blockNum: number;
  blockTimestamp: string;
  txHash: string;
  logIdx: number;
  address: string;
  topic0: string;
  topic1: string;
  topic2: string;
  topic3: string;
  data: string;
};
