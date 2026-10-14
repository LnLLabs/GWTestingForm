import "server-only";

export type AppEnv = {
  sessionSecret: string;
  databasePath: string;
  appUrl: string;
  adminStakeAddresses: string[];
  secureCookies: boolean;
};

const DEV_SESSION_SECRET = "dev-only-session-secret-change-before-production";

export function getEnv(): AppEnv {
  const isProd = process.env.NODE_ENV === "production";
  const sessionSecret =
    process.env.SESSION_SECRET?.trim() || (isProd ? "" : DEV_SESSION_SECRET);
  const databasePath =
    process.env.DATABASE_PATH?.trim() ||
    (isProd ? "" : `${process.cwd()}/data/tester.db`);

  if (!sessionSecret || !databasePath) {
    throw new Error(
      "SESSION_SECRET and DATABASE_PATH are required. Copy .env.example to .env.",
    );
  }

  if (isProd && sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  const appUrl = process.env.APP_URL?.trim() || "http://localhost:3000";
  const adminStakeAddresses = (process.env.ADMIN_STAKE_ADDRESSES ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  return {
    sessionSecret,
    databasePath,
    appUrl,
    adminStakeAddresses,
    secureCookies: appUrl.startsWith("https:"),
  };
}

export function isAdminStake(stakeAddress: string | null | undefined): boolean {
  if (!stakeAddress) return false;
  return getEnv().adminStakeAddresses.includes(stakeAddress);
}
