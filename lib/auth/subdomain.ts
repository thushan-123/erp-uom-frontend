export function getSubdomainFromHost(host: string | null): string {
  if (!host) return "demo";

  // Clean host from port if present
  const hostname = host.split(":")[0].toLowerCase();

  // Localhost, IP addresses, or internal domains
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost") ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  ) {
    return "demo";
  }

  const parts = hostname.split(".");
  // If e.g. tenant.domain.com -> 3 parts
  if (parts.length >= 3) {
    return parts[0];
  }

  return "demo";
}
