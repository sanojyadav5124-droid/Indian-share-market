export type InstrumentType = 'EQUITY' | 'MUTUAL_FUND' | 'CASH';

export type Sector = 
  | 'Financial Services'
  | 'IT'
  | 'Oil & Gas'
  | 'Auto'
  | 'Pharma & Healthcare'
  | 'FMCG'
  | 'Capital Goods'
  | 'Chemicals'
  | 'Consumer Durables'
  | 'Metals'
  | 'Power'
  | 'Telecommunication'
  | 'Cash & Liquid'
  | (string & {});

export interface StockDirectoryItem {
  symbol: string;
  name: string;
  sector: Sector;
  marketCap: MarketCap;
  instrumentType: InstrumentType;
  defaultPrice: number;
  isCustom?: boolean;
}

export type MarketCap = 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Cash';

export type ProfileId = string;

export interface FamilyProfile {
  id: ProfileId;
  name: string;
  relation: string;
  pan: string; // e.g. ABCPS****D
  broker: string;
  avatarColor: string;
  dematAccountNo?: string;
}

export type ThemeMode = 'slate' | 'emerald' | 'navy' | 'midnight';

export type TransactionType = 
  | 'BUY' 
  | 'SELL' 
  | 'DIVIDEND' 
  | 'BONUS' 
  | 'SPLIT' 
  | 'DEMERGER' 
  | 'CASH_DEPOSIT' 
  | 'CASH_WITHDRAW';

export interface StatutoryCharges {
  stt: number; // Securities Transaction Tax
  stampDuty: number; // 0.015% on buy
  exchangeCharges: number; // NSE/BSE transaction fee
  gstAndBrokerage: number; // Brokerage + 18% GST
  total: number;
}

export interface Transaction {
  id: string;
  profileId: ProfileId;
  symbol: string;
  name: string;
  instrumentType: InstrumentType;
  sector: Sector;
  marketCap: MarketCap;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  quantity: number;
  price: number;
  charges: StatutoryCharges;
  notes?: string;
  ratio?: string; // e.g., "1:1" for bonus, "1:2" for split
  useCashBalance?: boolean;
}

export interface MarketPrice {
  symbol: string;
  name: string;
  cmp: number; // Current Market Price / NAV
  previousClose: number;
  lastUpdated: string;
  sector: Sector;
  marketCap: MarketCap;
  instrumentType: InstrumentType;
}

export interface HoldingLot {
  lotId: string;
  transactionId: string;
  date: string;
  originalQuantity: number;
  remainingQuantity: number;
  buyPrice: number;
  chargesPerUnit: number;
  netCostPerUnit: number;
}

export interface HoldingItem {
  symbol: string;
  name: string;
  instrumentType: InstrumentType;
  sector: Sector;
  marketCap: MarketCap;
  totalQuantity: number;
  wacPrice: number; // Weighted Average Cost per share
  fifoPrice: number; // FIFO average cost per share
  cmp: number;
  investedValueWAC: number;
  investedValueFIFO: number;
  currentValue: number;
  unrealizedPnLWAC: number;
  unrealizedPnLPercentWAC: number;
  unrealizedPnLFIFO: number;
  unrealizedPnLPercentFIFO: number;
  dayChangePnL: number;
  dayChangePercent: number;
  weightagePercent: number;
  profileBreakdown: Record<ProfileId, number>; // qty owned by each profile
  openLots: HoldingLot[];
}

export interface RealizedGainLot {
  id: string;
  profileId: ProfileId;
  symbol: string;
  name: string;
  buyDate: string;
  sellDate: string;
  holdingDays: number;
  isLTCG: boolean; // >= 365 days
  quantity: number;
  buyPricePerUnit: number;
  buyChargesPerUnit: number;
  sellPricePerUnit: number;
  sellChargesPerUnit: number;
  netBuyCost: number;
  netSellProceed: number;
  realizedPnL: number;
  taxRate: number; // 20% for STCG, 12.5% for LTCG
  taxApplicable: number;
}

export interface PortfolioSummary {
  totalNetWorth: number;
  totalInvestedWAC: number;
  totalInvestedFIFO: number;
  totalCurrentValue: number;
  totalUnrealizedPnLWAC: number;
  totalUnrealizedPnLPercentWAC: number;
  totalUnrealizedPnLFIFO: number;
  totalUnrealizedPnLPercentFIFO: number;
  totalDayChangePnL: number;
  totalDayChangePercent: number;
  uninvestedCash: number;
  cashPerProfile: Record<ProfileId, number>;
  totalRealizedSTCG: number;
  totalRealizedLTCG: number;
  exemptLTCGUsed: number;
  remainingLTCGExemption: number;
  taxableLTCG: number;
  stcgTaxLiability: number;
  ltcgTaxLiability: number;
  totalTaxLiability: number;
}

export type CostBasisMethod = 'WAC' | 'FIFO';
