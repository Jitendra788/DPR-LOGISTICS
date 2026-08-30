export {
  normalizePhone,
  makeShareToken,
  nowStamp,
  findLiveTripByPhone,
  findTripByShareToken,
  findTripByCustomerToken,
  findTripByLrNo,
  getLocationHistory,
  publicTripPayload,
  recordLocationUpdate,
  runTrackingAlertChecks,
  findTripForIngest,
  createAlertIfNew,
} from "./trackingCoreService";

export type { LocationSource } from "./trackingCoreService";
