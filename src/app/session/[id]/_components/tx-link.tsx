import { explorerTxUrl, truncateHex } from "@/channels/format";

export function TxLink({ txHash }: { txHash: string }) {
  return (
    <a
      href={explorerTxUrl(txHash)}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-muted-foreground text-xs underline underline-offset-4 hover:text-foreground"
      translate="no"
    >
      {truncateHex(txHash)}
    </a>
  );
}
