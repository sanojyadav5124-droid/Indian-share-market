import { InstrumentType, StatutoryCharges } from '../types';

/**
 * Calculates Indian statutory friction costs according to Indian exchange rules:
 * - STT (Securities Transaction Tax):
 *   - Equity delivery: 0.1% on both Buy and Sell
 *   - Mutual Funds (Equity): 0.001% on redemption (Sell), 0% on Buy
 *   - Cash/Liquid: 0%
 * - Stamp Duty:
 *   - Equity delivery: 0.015% on Buy only
 *   - Mutual Funds: 0.005% on Buy
 * - Exchange Transaction Charges:
 *   - NSE/BSE: ~0.00345%
 * - SEBI Turnover Fee + GST:
 *   - 18% GST applied on exchange charges + SEBI charges (~₹10 per crore)
 */
export function calculateIndianFriction(
  instrumentType: InstrumentType,
  actionType: 'BUY' | 'SELL',
  tradeValue: number
): StatutoryCharges {
  if (tradeValue <= 0 || instrumentType === 'CASH') {
    return { stt: 0, stampDuty: 0, exchangeCharges: 0, gstAndBrokerage: 0, total: 0 };
  }

  let stt = 0;
  let stampDuty = 0;
  let exchangeCharges = 0;
  let gstAndBrokerage = 0;

  if (instrumentType === 'EQUITY') {
    // STT: 0.1% for both delivery buy and sell
    stt = tradeValue * 0.001;

    // Stamp Duty: 0.015% on Buy only
    if (actionType === 'BUY') {
      stampDuty = tradeValue * 0.00015;
    }

    // Exchange transaction charges: NSE 0.00345%
    exchangeCharges = tradeValue * 0.0000345;

    // SEBI Turnover charge (₹10 / crore = 0.0001%) + 18% GST on (Exchange + SEBI charges)
    const sebiCharges = tradeValue * 0.000001;
    gstAndBrokerage = (exchangeCharges + sebiCharges) * 0.18;
  } else if (instrumentType === 'MUTUAL_FUND') {
    // Equity Mutual Funds: Stamp duty 0.005% on purchase
    if (actionType === 'BUY') {
      stampDuty = tradeValue * 0.00005;
    }
    // STT on redemption: 0.001% on sell
    if (actionType === 'SELL') {
      stt = tradeValue * 0.00001;
    }
  }

  // Round to 2 decimal places
  stt = Math.round(stt * 100) / 100;
  stampDuty = Math.round(stampDuty * 100) / 100;
  exchangeCharges = Math.round(exchangeCharges * 100) / 100;
  gstAndBrokerage = Math.round(gstAndBrokerage * 100) / 100;

  const total = Math.round((stt + stampDuty + exchangeCharges + gstAndBrokerage) * 100) / 100;

  return {
    stt,
    stampDuty,
    exchangeCharges,
    gstAndBrokerage,
    total,
  };
}
