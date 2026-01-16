export function getUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const parsedUrl = new URL(url);
  const isSecureDb = !url.includes("localhost");

  if (isSecureDb) {
    parsedUrl.searchParams.set("sslmode", "no-verify");
  }

  return parsedUrl.toString();
}
