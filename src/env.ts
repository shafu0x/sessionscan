const ENV_KEYS = ["DATABASE_URL", "CRON_SECRET", "TEMPO_API_KEY"] as const;

type EnvKey = (typeof ENV_KEYS)[number];

const ENV_HELP: Record<EnvKey, string> = {
  DATABASE_URL: "Postgres connection string (Neon, from vercel env pull)",
  CRON_SECRET: "Secret for /api/cron/sync (pnpm sync sends Bearer token)",
  TEMPO_API_KEY: "Tempo Indexer API key (tempo:sk:...)",
};

function readEnv(key: EnvKey): string {
  return process.env[key]?.trim() ?? "";
}

function validateEnv(): Record<EnvKey, string> & { TEMPO_RPC_URL: string } {
  const missing = ENV_KEYS.filter((key) => !readEnv(key));

  if (missing.length > 0) {
    const lines = missing.map((key) => `  ${key} — ${ENV_HELP[key]}`);
    throw new Error(
      `Missing required environment variables:\n${lines.join("\n")}\nCopy .env.example to .env.local and fill in all values.`,
    );
  }

  return {
    DATABASE_URL: readEnv("DATABASE_URL"),
    CRON_SECRET: readEnv("CRON_SECRET"),
    TEMPO_API_KEY: readEnv("TEMPO_API_KEY"),
    TEMPO_RPC_URL: process.env.TEMPO_RPC_URL?.trim() || "https://rpc.tempo.xyz",
  };
}

export const env =
  process.env.SKIP_ENV_VALIDATION === "1"
    ? {
        DATABASE_URL: readEnv("DATABASE_URL"),
        CRON_SECRET: readEnv("CRON_SECRET"),
        TEMPO_API_KEY: readEnv("TEMPO_API_KEY"),
        TEMPO_RPC_URL:
          process.env.TEMPO_RPC_URL?.trim() || "https://rpc.tempo.xyz",
      }
    : validateEnv();
