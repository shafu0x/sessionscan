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
        className="relative top-[0.05em] mr-1 inline-block size-4 rounded-sm align-middle"
      />
      <span className="inline align-middle">{service.name}</span>
    </>
  );

  if (!link) {
    return (
      <span className="inline align-middle whitespace-nowrap" translate="no">
        {label}
      </span>
    );
  }

  return (
    <a
      href={service.href}
      target="_blank"
      rel="noreferrer"
      className="inline align-middle whitespace-nowrap underline-offset-4 hover:underline"
      translate="no"
    >
      {label}
    </a>
  );
}
