import {
  HoldingItem,
  HoldingLot,
  MarketPrice,
  PortfolioSummary,
  ProfileId,
  RealizedGainLot,
  Transaction,
} from '../types';

/**
 * Calculates day difference between two YYYY-MM-DD date strings
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Computes FIFO lots, Realized Gains, and WAC values for all transactions
 */
export function processPortfolioTransactions(
  transactions: Transaction[],
  marketPrices: MarketPrice[],
  activeProfile: ProfileId | 'consolidated'
) {
  // Filter transactions by profile if not consolidated
  const relevantTransactions = transactions
    .filter((tx) => (activeProfile === 'consolidated' ? true : tx.profileId === activeProfile))
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id.localeCompare(b.id));

  // Cash Ledger per profile
  const cashBalances: Record<ProfileId, number> = {};

  // Open FIFO lots grouped by profile + symbol
  // Key: `${profileId}:${symbol}`
  const openLotsMap: Record<string, HoldingLot[]> = {};

  // WAC state grouped by profile + symbol
  // { qty: number, totalCost: number }
  const wacMap: Record<string, { qty: number; totalCost: number }> = {};

  // Realized gains ledger
  const realizedLots: RealizedGainLot[] = [];

  // Process transactions chronologically
  for (const tx of relevantTransactions) {
    if (cashBalances[tx.profileId] === undefined) {
      cashBalances[tx.profileId] = 0;
    }
    const key = `${tx.profileId}:${tx.symbol}`;
    if (!openLotsMap[key]) openLotsMap[key] = [];
    if (!wacMap[key]) wacMap[key] = { qty: 0, totalCost: 0 };

    switch (tx.type) {
      case 'CASH_DEPOSIT': {
        cashBalances[tx.profileId] += tx.price;
        break;
      }

      case 'CASH_WITHDRAW': {
        cashBalances[tx.profileId] -= tx.price;
        break;
      }

      case 'DIVIDEND': {
        // Dividend payout = quantity * price (dividend per share)
        const dividendAmount = tx.quantity * tx.price;
        cashBalances[tx.profileId] += dividendAmount;
        break;
      }

      case 'BUY': {
        const tradeCost = tx.quantity * tx.price;
        const totalNetCost = tradeCost + (tx.charges?.total || 0);
        const netCostPerUnit = tx.quantity > 0 ? totalNetCost / tx.quantity : tx.price;
        const chargesPerUnit = tx.quantity > 0 ? (tx.charges?.total || 0) / tx.quantity : 0;

        // Cash balance deduction if routed from cash
        if (tx.useCashBalance) {
          cashBalances[tx.profileId] -= totalNetCost;
        }

        // Add to FIFO open lots
        openLotsMap[key].push({
          lotId: `lot-${tx.id}`,
          transactionId: tx.id,
          date: tx.date,
          originalQuantity: tx.quantity,
          remainingQuantity: tx.quantity,
          buyPrice: tx.price,
          chargesPerUnit,
          netCostPerUnit,
        });

        // Update WAC
        const currentWac = wacMap[key];
        currentWac.qty += tx.quantity;
        currentWac.totalCost += totalNetCost;
        break;
      }

      case 'SELL': {
        const tradeRevenue = tx.quantity * tx.price;
        const totalNetProceed = tradeRevenue - (tx.charges?.total || 0);
        const sellPricePerUnit = tx.price;
        const sellChargesPerUnit = tx.quantity > 0 ? (tx.charges?.total || 0) / tx.quantity : 0;

        // Credit to cash if routed
        if (tx.useCashBalance) {
          cashBalances[tx.profileId] += totalNetProceed;
        }

        // Peel off FIFO lots
        let neededQty = tx.quantity;
        const lots = openLotsMap[key];

        while (neededQty > 0 && lots.length > 0) {
          const oldestLot = lots[0];
          const availableQty = oldestLot.remainingQuantity;

          if (availableQty <= 0) {
            lots.shift();
            continue;
          }

          const peeledQty = Math.min(neededQty, availableQty);
          oldestLot.remainingQuantity -= peeledQty;
          neededQty -= peeledQty;

          // Holding duration
          const holdingDays = getDaysBetween(oldestLot.date, tx.date);
          const isLTCG = holdingDays >= 365;

          const netBuyCost = peeledQty * oldestLot.netCostPerUnit;
          const netSellProceed = peeledQty * (sellPricePerUnit - sellChargesPerUnit);
          const realizedPnL = netSellProceed - netBuyCost;

          // Tax rate under Indian Finance Act 2024:
          // STCG (< 365 days) = 20%
          // LTCG (>= 365 days) = 12.5%
          const taxRate = isLTCG ? 0.125 : 0.20;

          realizedLots.push({
            id: `realized-${tx.id}-${oldestLot.lotId}-${realizedLots.length}`,
            profileId: tx.profileId,
            symbol: tx.symbol,
            name: tx.name,
            buyDate: oldestLot.date,
            sellDate: tx.date,
            holdingDays,
            isLTCG,
            quantity: peeledQty,
            buyPricePerUnit: oldestLot.buyPrice,
            buyChargesPerUnit: oldestLot.chargesPerUnit,
            sellPricePerUnit,
            sellChargesPerUnit,
            netBuyCost,
            netSellProceed,
            realizedPnL,
            taxRate,
            taxApplicable: Math.max(0, realizedPnL * taxRate), // Raw before exemption
          });

          if (oldestLot.remainingQuantity <= 0) {
            lots.shift();
          }
        }

        // Update WAC: quantity drops, average unit cost stays same
        const currentWac = wacMap[key];
        if (currentWac.qty > 0) {
          const avgUnitCost = currentWac.totalCost / currentWac.qty;
          currentWac.qty = Math.max(0, currentWac.qty - tx.quantity);
          currentWac.totalCost = currentWac.qty * avgUnitCost;
        }
        break;
      }

      case 'BONUS': {
        // Indian Section 55: Bonus shares have acquisition cost = ₹0
        // Acquisition date is the bonus allotment date
        openLotsMap[key].push({
          lotId: `bonus-${tx.id}`,
          transactionId: tx.id,
          date: tx.date,
          originalQuantity: tx.quantity,
          remainingQuantity: tx.quantity,
          buyPrice: 0,
          chargesPerUnit: 0,
          netCostPerUnit: 0,
        });

        // WAC: totalCost remains same, quantity increases -> WAC per share drops
        const currentWac = wacMap[key];
        currentWac.qty += tx.quantity;
        break;
      }

      case 'SPLIT': {
        // e.g. 1:2 split means ratio is 2 (shares double, price halves)
        let splitFactor = 2;
        if (tx.ratio) {
          const parts = tx.ratio.split(':');
          if (parts.length === 2 && Number(parts[0]) > 0) {
            splitFactor = Number(parts[1]) / Number(parts[0]);
          }
        }

        // Adjust all open FIFO lots
        for (const lot of openLotsMap[key]) {
          lot.originalQuantity *= splitFactor;
          lot.remainingQuantity *= splitFactor;
          lot.buyPrice /= splitFactor;
          lot.chargesPerUnit /= splitFactor;
          lot.netCostPerUnit /= splitFactor;
        }

        // WAC: quantity multiplies by splitFactor, totalCost remains same
        const currentWac = wacMap[key];
        currentWac.qty *= splitFactor;
        break;
      }

      case 'DEMERGER': {
        // Apportions cost basis (e.g. 90% stays with parent, 10% to new co)
        let apportionmentRatio = 0.9;
        if (tx.ratio) {
          const ratioNum = parseFloat(tx.ratio);
          if (!isNaN(ratioNum) && ratioNum > 0 && ratioNum <= 1) {
            apportionmentRatio = ratioNum;
          }
        }

        for (const lot of openLotsMap[key]) {
          lot.buyPrice *= apportionmentRatio;
          lot.chargesPerUnit *= apportionmentRatio;
          lot.netCostPerUnit *= apportionmentRatio;
        }

        const currentWac = wacMap[key];
        currentWac.totalCost *= apportionmentRatio;
        break;
      }
    }
  }

  // Aggregate current open holdings by symbol
  const priceLookup = new Map<string, MarketPrice>();
  for (const p of marketPrices) {
    priceLookup.set(p.symbol, p);
  }

  // Collect all unique symbols currently held
  const holdingsMap = new Map<string, {
    symbol: string;
    profileBreakdown: Record<ProfileId, number>;
    totalQuantity: number;
    openLots: HoldingLot[];
    totalCostWAC: number;
    totalCostFIFO: number;
  }>();

  for (const [key, lots] of Object.entries(openLotsMap)) {
    const [profId, sym] = key.split(':') as [ProfileId, string];
    const remainingQty = lots.reduce((acc, l) => acc + l.remainingQuantity, 0);

    if (remainingQty > 0) {
      if (!holdingsMap.has(sym)) {
        holdingsMap.set(sym, {
          symbol: sym,
          profileBreakdown: { self: 0, spouse: 0, parent: 0 },
          totalQuantity: 0,
          openLots: [],
          totalCostWAC: 0,
          totalCostFIFO: 0,
        });
      }

      const item = holdingsMap.get(sym)!;
      item.profileBreakdown[profId] += remainingQty;
      item.totalQuantity += remainingQty;
      item.openLots.push(...lots.filter((l) => l.remainingQuantity > 0));

      const wacData = wacMap[key];
      if (wacData && wacData.qty > 0) {
        item.totalCostWAC += wacData.totalCost;
      }

      const fifoCost = lots.reduce((acc, l) => acc + l.remainingQuantity * l.netCostPerUnit, 0);
      item.totalCostFIFO += fifoCost;
    }
  }

  // Build HoldingItem array
  const holdings: HoldingItem[] = [];
  let aggregateCurrentValue = 0;

  for (const [sym, data] of holdingsMap.entries()) {
    const priceInfo = priceLookup.get(sym);
    const cmp = priceInfo ? priceInfo.cmp : 0;
    const prevClose = priceInfo ? priceInfo.previousClose : cmp;
    const name = priceInfo ? priceInfo.name : sym;
    const sector = priceInfo ? priceInfo.sector : 'Cash & Liquid';
    const marketCap = priceInfo ? priceInfo.marketCap : 'Mid Cap';
    const instrumentType = priceInfo ? priceInfo.instrumentType : 'EQUITY';

    const totalQty = data.totalQuantity;
    const investedWAC = data.totalCostWAC;
    const investedFIFO = data.totalCostFIFO;
    const wacPrice = totalQty > 0 ? investedWAC / totalQty : 0;
    const fifoPrice = totalQty > 0 ? investedFIFO / totalQty : 0;

    const currentValue = totalQty * cmp;
    aggregateCurrentValue += currentValue;

    const unrealizedPnLWAC = currentValue - investedWAC;
    const unrealizedPnLPercentWAC = investedWAC > 0 ? (unrealizedPnLWAC / investedWAC) * 100 : 0;

    const unrealizedPnLFIFO = currentValue - investedFIFO;
    const unrealizedPnLPercentFIFO = investedFIFO > 0 ? (unrealizedPnLFIFO / investedFIFO) * 100 : 0;

    const dayChangePnL = totalQty * (cmp - prevClose);
    const dayChangePercent = prevClose > 0 ? ((cmp - prevClose) / prevClose) * 100 : 0;

    holdings.push({
      symbol: sym,
      name,
      instrumentType,
      sector,
      marketCap,
      totalQuantity: totalQty,
      wacPrice,
      fifoPrice,
      cmp,
      investedValueWAC: investedWAC,
      investedValueFIFO: investedFIFO,
      currentValue,
      unrealizedPnLWAC,
      unrealizedPnLPercentWAC,
      unrealizedPnLFIFO,
      unrealizedPnLPercentFIFO,
      dayChangePnL,
      dayChangePercent,
      weightagePercent: 0, // Calculated below
      profileBreakdown: data.profileBreakdown,
      openLots: data.openLots,
    });
  }

  // Assign portfolio weightage %
  for (const h of holdings) {
    h.weightagePercent = aggregateCurrentValue > 0 ? (h.currentValue / aggregateCurrentValue) * 100 : 0;
  }

  // Sort by Current Value descending
  holdings.sort((a, b) => b.currentValue - a.currentValue);

  // Compute Total Realized Gains
  let totalRealizedSTCG = 0;
  let totalRealizedLTCG = 0;

  for (const r of realizedLots) {
    if (r.isLTCG) {
      totalRealizedLTCG += r.realizedPnL;
    } else {
      totalRealizedSTCG += r.realizedPnL;
    }
  }

  // Indian Tax Act 2024 LTCG Exemption limit: ₹1,25,000 per financial year
  const LTCG_EXEMPTION_LIMIT = 125000;
  const exemptLTCGUsed = Math.min(Math.max(0, totalRealizedLTCG), LTCG_EXEMPTION_LIMIT);
  const remainingLTCGExemption = Math.max(0, LTCG_EXEMPTION_LIMIT - Math.max(0, totalRealizedLTCG));
  const taxableLTCG = Math.max(0, totalRealizedLTCG - LTCG_EXEMPTION_LIMIT);

  const stcgTaxLiability = Math.max(0, totalRealizedSTCG) * 0.20; // 20%
  const ltcgTaxLiability = taxableLTCG * 0.125; // 12.5%
  const totalTaxLiability = stcgTaxLiability + ltcgTaxLiability;

  // Uninvested cash for selected profile view
  const uninvestedCash =
    activeProfile === 'consolidated'
      ? Object.values(cashBalances).reduce((acc, val) => acc + (val || 0), 0)
      : (cashBalances[activeProfile] || 0);

  // Portfolio Totals
  const totalInvestedWAC = holdings.reduce((acc, h) => acc + h.investedValueWAC, 0);
  const totalInvestedFIFO = holdings.reduce((acc, h) => acc + h.investedValueFIFO, 0);
  const totalCurrentValue = aggregateCurrentValue;
  const totalNetWorth = totalCurrentValue + uninvestedCash;

  const totalUnrealizedPnLWAC = totalCurrentValue - totalInvestedWAC;
  const totalUnrealizedPnLPercentWAC =
    totalInvestedWAC > 0 ? (totalUnrealizedPnLWAC / totalInvestedWAC) * 100 : 0;

  const totalUnrealizedPnLFIFO = totalCurrentValue - totalInvestedFIFO;
  const totalUnrealizedPnLPercentFIFO =
    totalInvestedFIFO > 0 ? (totalUnrealizedPnLFIFO / totalInvestedFIFO) * 100 : 0;

  const totalDayChangePnL = holdings.reduce((acc, h) => acc + h.dayChangePnL, 0);
  const totalDayChangePercent =
    totalCurrentValue - totalDayChangePnL > 0
      ? (totalDayChangePnL / (totalCurrentValue - totalDayChangePnL)) * 100
      : 0;

  const summary: PortfolioSummary = {
    totalNetWorth,
    totalInvestedWAC,
    totalInvestedFIFO,
    totalCurrentValue,
    totalUnrealizedPnLWAC,
    totalUnrealizedPnLPercentWAC,
    totalUnrealizedPnLFIFO,
    totalUnrealizedPnLPercentFIFO,
    totalDayChangePnL,
    totalDayChangePercent,
    uninvestedCash,
    cashPerProfile: cashBalances,
    totalRealizedSTCG,
    totalRealizedLTCG,
    exemptLTCGUsed,
    remainingLTCGExemption,
    taxableLTCG,
    stcgTaxLiability,
    ltcgTaxLiability,
    totalTaxLiability,
  };

  return {
    holdings,
    realizedLots,
    summary,
    cashBalances,
  };
}
