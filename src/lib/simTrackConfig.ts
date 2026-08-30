export type SimTrackProvider = "mock" | "generic" | "off";

export function getSimTrackConfig() {
  const provider = (process.env.SIM_TRACK_PROVIDER ?? "mock").toLowerCase() as SimTrackProvider;
  const pollMinutes = Math.max(1, Number(process.env.SIM_TRACK_POLL_MINUTES) || 5);
  const skipConsent = process.env.SIM_TRACK_SKIP_CONSENT === "true";

  return {
    provider: provider === "generic" || provider === "off" ? provider : "mock",
    apiUrl: process.env.SIM_TRACK_API_URL ?? "",
    apiKey: process.env.SIM_TRACK_API_KEY ?? "",
    bulkUrl: process.env.SIM_TRACK_BULK_API_URL ?? "",
    pollMinutes,
    skipConsent,
    enabled: provider !== "off" && (provider === "mock" || Boolean(process.env.SIM_TRACK_API_URL)),
  };
}

export function toMsisdn(phone10: string) {
  const p = phone10.replace(/\D/g, "").slice(-10);
  return p.length === 10 ? `91${p}` : "";
}
