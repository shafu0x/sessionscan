import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto pt-10 text-center text-muted-foreground text-sm">
      <p className="inline-flex flex-wrap items-center justify-center gap-1.5">
        Made with
        <Heart className="size-3.5 fill-current" aria-hidden />
        by{" "}
        <a
          href="https://x.com/shafu0x"
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit underline"
        >
          @shafu0x
        </a>
      </p>
    </footer>
  );
}
