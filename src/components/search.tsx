"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";

import { truncateHex } from "@/channels/format";
import type { SearchHit } from "@/channels/types";
import { StatusBadge } from "@/components/status-badge";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const QUERY_RE = /^0x[0-9a-f]{4,66}$/i;
const SESSION_ID_RE = /^0x[0-9a-f]{64}$/i;

export function Search() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [fetched, setFetched] = useState(false);
  const deferredResults = useDeferredValue(results);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!QUERY_RE.test(q)) {
      setResults([]);
      setFetched(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : []))
        .then((data: SearchHit[]) => {
          setResults(data);
          setFetched(true);
        })
        .catch(() => {
          // Aborted or network error; keep prior results.
        });
    }, 200);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [open, query]);

  function go(id: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    setFetched(false);
    router.push(`/session/${id}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 w-64 items-center gap-2 rounded-lg bg-card px-2.5 text-sm text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
      >
        <SearchIcon className="size-4 shrink-0 opacity-50" aria-hidden />
        <span className="flex-1 truncate text-left">Search sessions…</span>
        <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-sans text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
            setResults([]);
            setFetched(false);
          }
        }}
        title="Search sessions"
        description="Search by session ID, payer, or payee"
        className="sm:max-w-lg"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search by session ID, payer, or payee"
            onKeyDown={(event) => {
              if (event.key === "Enter" && SESSION_ID_RE.test(query.trim())) {
                event.preventDefault();
                go(query.trim().toLowerCase());
              }
            }}
          />
          <CommandList>
            {query.trim() === "" ? (
              <p className="px-3 py-6 text-center text-muted-foreground text-sm">
                Search by session ID, payer, or payee
              </p>
            ) : fetched && deferredResults.length === 0 ? (
              <CommandEmpty>No sessions found</CommandEmpty>
            ) : deferredResults.length > 0 ? (
              <CommandGroup heading="Sessions">
                {deferredResults.map((hit) => (
                  <CommandItem
                    key={hit.channelId}
                    value={hit.channelId}
                    onSelect={() => go(hit.channelId)}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm" translate="no">
                          {truncateHex(hit.channelId)}
                        </span>
                        <StatusBadge status={hit.status} />
                      </div>
                      <span
                        className="truncate font-mono text-muted-foreground text-xs"
                        translate="no"
                      >
                        {truncateHex(hit.payer)} → {truncateHex(hit.payee)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
