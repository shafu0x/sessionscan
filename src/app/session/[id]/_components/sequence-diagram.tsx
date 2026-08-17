"use client";

import { useEffect, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function SequenceDiagram({ chart }: { chart: string }) {
  const nodeRef = useRef<HTMLPreElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    let cancelled = false;
    setReady(false);
    node.textContent = chart;
    node.removeAttribute("data-processed");

    void import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "strict",
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        sequence: {
          actorMargin: 100,
          diagramMarginX: 16,
          diagramMarginY: 16,
          messageMargin: 28,
          mirrorActors: false,
          useMaxWidth: true,
        },
        themeVariables: {
          background: "#0a0a0a",
          mainBkg: "#171717",
          primaryColor: "#171717",
          primaryTextColor: "#fafafa",
          primaryBorderColor: "#2e2e2e",
          secondaryColor: "#171717",
          tertiaryColor: "#0a0a0a",
          lineColor: "#a1a1a1",
          textColor: "#fafafa",
          actorBkg: "#171717",
          actorBorder: "#2e2e2e",
          actorTextColor: "#fafafa",
          actorLineColor: "#525252",
          signalColor: "#a1a1a1",
          signalTextColor: "#fafafa",
          labelBoxBkgColor: "#171717",
          labelBoxBorderColor: "#2e2e2e",
          labelTextColor: "#fafafa",
          loopTextColor: "#a1a1a1",
          noteBkgColor: "#171717",
          noteTextColor: "#a1a1a1",
          noteBorderColor: "#2e2e2e",
          activationBkgColor: "#262626",
          activationBorderColor: "#525252",
          sequenceNumberColor: "#0a0a0a",
        },
      });

      await mermaid.run({ nodes: [node] });
      const svg = node.querySelector("svg");
      const height = svg?.viewBox.baseVal.height;
      if (svg && height) {
        for (const line of svg.querySelectorAll("line.actor-line")) {
          line.setAttribute("y2", String(height));
        }
      }
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div className={ready ? "relative" : "relative min-h-80"}>
      {ready ? null : (
        <Skeleton className="absolute inset-0 rounded-xl" aria-hidden />
      )}
      <pre
        ref={nodeRef}
        className={
          ready
            ? "[&_svg]:mx-auto [&_svg]:max-w-full"
            : "sr-only"
        }
      />
    </div>
  );
}
