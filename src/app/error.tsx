"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="font-semibold text-2xl">Something went wrong</h1>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="w-fit text-sm underline underline-offset-4 hover:text-muted-foreground"
      >
        Try again
      </button>
    </div>
  );
}
