import Image from "next/image";

import { truncateHex } from "@/channels/format";
import { lookupService } from "@/channels/known-services";

export function ServiceLabel({
  payee,
  link = true,
}: {
  payee: string;
  link?: boolean;
}) {
  const service = lookupService(payee);
  if (!service) {
    return <>{truncateHex(payee)}</>;
  }

  const label = (
    <>
      <Image
        src={service.logoUrl}
        alt=""
        width={16}
        height={16}
        className="size-4 rounded-sm"
      />
      {service.name}
    </>
  );

  if (!link) {
    return (
      <span className="inline-flex items-center gap-1.5" translate="no">
        {label}
      </span>
    );
  }

  return (
    <a
      href={service.href}
      target="_blank"
      rel="noreferrer"
      className="relative inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
      translate="no"
    >
      {label}
    </a>
  );
}
