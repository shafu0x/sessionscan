import "server-only";

import { getAbiItem, toEventSelector } from "viem";
import { Abis, Addresses } from "viem/tempo";

const EVENT_NAMES = [
  "ChannelOpened",
  "Settled",
  "TopUp",
  "CloseRequested",
  "CloseRequestCancelled",
  "ChannelClosed",
] as const;

export const channelReserveAddress = Addresses.tip20ChannelReserve;

const topic0ByName = Object.fromEntries(
  EVENT_NAMES.map((name) => [
    name,
    toEventSelector(
      getAbiItem({ abi: Abis.tip20ChannelReserve, name }),
    ).toLowerCase(),
  ]),
) as Record<(typeof EVENT_NAMES)[number], string>;

export const topic0List = Object.values(topic0ByName);
