import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="font-semibold text-2xl">Session not found</h1>
      <Link
        href="/"
        className="w-fit text-sm underline underline-offset-4 hover:text-muted-foreground"
      >
        Back to sessions
      </Link>
    </div>
  );
}
