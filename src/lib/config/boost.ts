export type BoostPlan = "starter" | "basic" | "standard" | "pro" | "premium";

export interface BoostConfigItem {
  durationHours: number;
  rank: number;
  price: number; // MAD
  isFree: boolean;
  targetViews: number;
}

export const BOOST_CONFIG: Record<BoostPlan, BoostConfigItem> = {
  starter:  { durationHours: 12,   rank: 1, price: 0,   isFree: true,  targetViews: 100 },
  basic:    { durationHours: 168,  rank: 2, price: 19,  isFree: false, targetViews: 500 },  // 7 days
  standard: { durationHours: 336,  rank: 3, price: 39,  isFree: false, targetViews: 2000 },  // 14 days
  pro:      { durationHours: 720,  rank: 4, price: 79,  isFree: false, targetViews: 5000 },  // 30 days
  premium:  { durationHours: 1440, rank: 5, price: 149, isFree: false, targetViews: 15000 },  // 60 days
};


export const VALID_PLANS = Object.keys(BOOST_CONFIG) as BoostPlan[];
