import "server-only";

import { decodeEventLog, getAddress, isHex } from "viem";
import { Abis } from "viem/tempo";

import type { DecodedEvent, IndexedEvent, TidxLogRow } from "./types";

function toHex(value: string) {
  const hex = value.startsWith("0x") ? value : `0x${value}`;
  if (!isHex(hex)) {
    throw new Error(`invalid hex: ${value}`);
  }
  return hex;
}

function parseTidxTimestamp(timestamp: string): Date {
  const parsed = new Date(`${timestamp.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`invalid tidx block timestamp: ${timestamp}`);
  }
  return parsed;
}

export function decodeLog(row: TidxLogRow): IndexedEvent {
  const decoded = decodeEventLog({
    abi: Abis.tip20ChannelReserve,
    data: toHex(row.data),
    topics: [
      toHex(row.topic0),
      toHex(row.topic1),
      toHex(row.topic2),
      toHex(row.topic3),
    ],
    strict: true,
  });

  const event = toDecodedEvent(decoded);
  const txHash = toHex(row.txHash);

  return {
    ...event,
    txHash,
    logIndex: row.logIdx,
    blockNum: row.blockNum,
    timestamp: parseTidxTimestamp(row.blockTimestamp),
  };
}

function toDecodedEvent(
  decoded: ReturnType<typeof decodeEventLog<typeof Abis.tip20ChannelReserve>>,
): DecodedEvent {
  switch (decoded.eventName) {
    case "ChannelOpened":
      return {
        type: "opened",
        channelId: decoded.args.channelId,
        payer: getAddress(decoded.args.payer),
        payee: getAddress(decoded.args.payee),
        operator: getAddress(decoded.args.operator),
        token: getAddress(decoded.args.token),
        authorizedSigner: getAddress(decoded.args.authorizedSigner),
        salt: decoded.args.salt,
        expiringNonceHash: decoded.args.expiringNonceHash,
        deposit: decoded.args.deposit,
      };
    case "Settled":
      return {
        type: "settled",
        channelId: decoded.args.channelId,
        payer: getAddress(decoded.args.payer),
        payee: getAddress(decoded.args.payee),
        cumulative: decoded.args.cumulativeAmount,
        deltaPaid: decoded.args.deltaPaid,
        newSettled: decoded.args.newSettled,
      };
    case "TopUp":
      return {
        type: "top_up",
        channelId: decoded.args.channelId,
        payer: getAddress(decoded.args.payer),
        payee: getAddress(decoded.args.payee),
        additionalDeposit: decoded.args.additionalDeposit,
        newDeposit: decoded.args.newDeposit,
      };
    case "CloseRequested":
      return {
        type: "close_requested",
        channelId: decoded.args.channelId,
        payer: getAddress(decoded.args.payer),
        payee: getAddress(decoded.args.payee),
        closeGraceEnd: decoded.args.closeGraceEnd,
      };
    case "CloseRequestCancelled":
      return {
        type: "close_cancelled",
        channelId: decoded.args.channelId,
        payer: getAddress(decoded.args.payer),
        payee: getAddress(decoded.args.payee),
      };
    case "ChannelClosed":
      return {
        type: "closed",
        channelId: decoded.args.channelId,
        payer: getAddress(decoded.args.payer),
        payee: getAddress(decoded.args.payee),
        settledToPayee: decoded.args.settledToPayee,
        refundedToPayer: decoded.args.refundedToPayer,
      };
    default: {
      const exhaustive: never = decoded;
      throw new Error(`unhandled channel event ${JSON.stringify(exhaustive)}`);
    }
  }
}
