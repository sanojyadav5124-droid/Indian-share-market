import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization for Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Yahoo Finance Live Market Price Engine
const YAHOO_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const KNOWN_SYMBOL_MAP: Record<string, string[]> = {
  INFOSYS: ['INFY.NS', 'INFOSYS.NS', '500209.BO'],
  INFY: ['INFY.NS', '500209.BO'],
  TATAMOTORS: ['TMPV.NS', 'TMCV.NS', '500570.BO', 'TATAMOTORS.NS'],
  PPFAS_FLEXI: ['0P0000YWL1.BO', '0P0000YWL0.BO'],
  MIRAE_LARGEMID: ['0P0000XW0F.BO'],
  QUANT_SMALLCAP: ['0P0000XW23.BO'],
};

async function fetchYahooQuote(rawSymbol: string): Promise<{
  symbol: string;
  name?: string;
  cmp: number;
  previousClose: number;
  dayChange?: number;
  dayChangePercent?: number;
  currency?: string;
  exchange?: string;
  lastUpdated: string;
  yahooTicker: string;
} | null> {
  const symUpper = rawSymbol.trim().toUpperCase();
  if (!symUpper || symUpper === 'INR_CASH') return null;

  // Candidates to try
  const candidates: string[] = [];
  if (KNOWN_SYMBOL_MAP[symUpper]) {
    candidates.push(...KNOWN_SYMBOL_MAP[symUpper]);
  }

  if (symUpper.endsWith('.NS') || symUpper.endsWith('.BO')) {
    candidates.push(symUpper);
  } else {
    candidates.push(`${symUpper}.NS`, `${symUpper}.BO`);
  }

  for (const ticker of candidates) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        ticker
      )}?interval=1d&range=1d`;
      const response = await fetch(url, {
        headers: { 'User-Agent': YAHOO_USER_AGENT },
      });

      if (response.ok) {
        const data: any = await response.json();
        const meta = data.chart?.result?.[0]?.meta;
        if (meta && typeof meta.regularMarketPrice === 'number' && meta.regularMarketPrice > 0) {
          const cmp = meta.regularMarketPrice;
          const previousClose = meta.chartPreviousClose || meta.previousClose || cmp;
          const dayChange = Math.round((cmp - previousClose) * 100) / 100;
          const dayChangePercent =
            previousClose > 0 ? Math.round(((cmp - previousClose) / previousClose) * 10000) / 100 : 0;
          const lastUpdated = meta.regularMarketTime
            ? new Date(meta.regularMarketTime * 1000).toISOString().replace('T', ' ').substring(0, 19)
            : new Date().toISOString().replace('T', ' ').substring(0, 19);

          return {
            symbol: symUpper,
            name: meta.shortName || meta.longName || symUpper,
            cmp,
            previousClose,
            dayChange,
            dayChangePercent,
            currency: meta.currency || 'INR',
            exchange: meta.exchangeName || 'NSE',
            lastUpdated,
            yahooTicker: ticker,
          };
        }
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  // Fallback: Try Yahoo Search API to find Indian ticker
  try {
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      symUpper
    )}&quotesCount=4&newsCount=0`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': YAHOO_USER_AGENT },
    });
    if (searchRes.ok) {
      const searchData: any = await searchRes.json();
      const matchingQuote = searchData.quotes?.find(
        (q: any) =>
          (q.exchange === 'NSI' || q.exchange === 'BSE' || q.symbol?.endsWith('.NS') || q.symbol?.endsWith('.BO')) &&
          q.symbol
      );
      if (matchingQuote?.symbol) {
        const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
          matchingQuote.symbol
        )}?interval=1d&range=1d`;
        const chartRes = await fetch(chartUrl, {
          headers: { 'User-Agent': YAHOO_USER_AGENT },
        });
        if (chartRes.ok) {
          const cData: any = await chartRes.json();
          const meta = cData.chart?.result?.[0]?.meta;
          if (meta && typeof meta.regularMarketPrice === 'number' && meta.regularMarketPrice > 0) {
            const cmp = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose || meta.previousClose || cmp;
            return {
              symbol: symUpper,
              name: matchingQuote.shortname || matchingQuote.longname || meta.shortName || symUpper,
              cmp,
              previousClose,
              dayChange: Math.round((cmp - previousClose) * 100) / 100,
              dayChangePercent:
                previousClose > 0 ? Math.round(((cmp - previousClose) / previousClose) * 10000) / 100 : 0,
              currency: meta.currency || 'INR',
              exchange: meta.exchangeName || 'NSE',
              lastUpdated: meta.regularMarketTime
                ? new Date(meta.regularMarketTime * 1000).toISOString().replace('T', ' ').substring(0, 19)
                : new Date().toISOString().replace('T', ' ').substring(0, 19),
              yahooTicker: matchingQuote.symbol,
            };
          }
        }
      }
    }
  } catch (err) {
    // Search fallback error
  }

  return null;
}

// Single Quote Endpoint
app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const quote = await fetchYahooQuote(symbol);
    if (quote) {
      res.json({ success: true, quote });
    } else {
      res.status(404).json({ success: false, error: `Could not fetch live quote for ${symbol}` });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error fetching quote' });
  }
});

// Batch Live Market Prices Endpoint
app.post('/api/market-prices', async (req, res) => {
  try {
    const symbolsInput = req.body.symbols;
    if (!Array.isArray(symbolsInput) || symbolsInput.length === 0) {
      res.status(400).json({ success: false, error: 'Array of symbols is required' });
      return;
    }

    const uniqueSymbols = Array.from(new Set(symbolsInput.map((s: string) => String(s).trim().toUpperCase()))).filter(
      (s) => s && s !== 'INR_CASH'
    );

    // Limit concurrency to prevent socket exhaustion
    const results: any[] = [];
    const errors: string[] = [];

    const CHUNK_SIZE = 6;
    for (let i = 0; i < uniqueSymbols.length; i += CHUNK_SIZE) {
      const chunk = uniqueSymbols.slice(i, i + CHUNK_SIZE);
      const chunkPromises = chunk.map(async (sym) => {
        const quote = await fetchYahooQuote(sym);
        if (quote) {
          results.push(quote);
        } else {
          errors.push(`Price unavailable for ${sym}`);
        }
      });
      await Promise.all(chunkPromises);
    }

    res.json({
      success: true,
      source: 'Yahoo Finance (Live NSE/BSE Feed)',
      syncedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      quotes: results,
      totalRequested: uniqueSymbols.length,
      updatedCount: results.length,
      failedCount: errors.length,
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    console.error('Error fetching live market prices:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch live prices from Yahoo Finance',
    });
  }
});

// Live BSE / NSE Market Catalyst & Corporate Actions Calendar Route
app.post('/api/market-calendar', async (req, res) => {
  try {
    const portfolioSymbols: string[] = Array.isArray(req.body.symbols) ? req.body.symbols : [];
    const targetSymbols = Array.from(
      new Set([
        ...portfolioSymbols.map((s) => String(s).trim().toUpperCase()),
        'TCS',
        'INFY',
        'RELIANCE',
        'HDFCBANK',
        'TATAMOTORS',
        'ICICIBANK',
        'CDSL',
      ])
    ).filter((s) => s && s !== 'INR_CASH');

    const liveCorporateEvents: any[] = [];
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // Fetch live earnings dates from Yahoo Finance for target symbols
    for (const sym of targetSymbols.slice(0, 8)) {
      try {
        const ticker = sym.endsWith('.NS') || sym.endsWith('.BO') ? sym : `${sym}.NS`;
        const summaryUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
          ticker
        )}?modules=calendarEvents,defaultKeyStatistics`;
        const response = await fetch(summaryUrl, {
          headers: { 'User-Agent': YAHOO_USER_AGENT },
        });

        if (response.ok) {
          const data: any = await response.json();
          const cal = data.quoteSummary?.result?.[0]?.calendarEvents;
          if (cal) {
            // Earnings date
            if (cal.earnings?.earningsDate && Array.isArray(cal.earnings.earningsDate) && cal.earnings.earningsDate.length > 0) {
              const rawTimestamp = cal.earnings.earningsDate[0]?.raw;
              if (rawTimestamp) {
                const earnDate = new Date(rawTimestamp * 1000).toISOString().slice(0, 10);
                liveCorporateEvents.push({
                  id: `live-earn-${sym}-${earnDate}`,
                  title: `${sym} - Board Meeting & Financial Results`,
                  category: 'EARNINGS',
                  date: earnDate,
                  description: `Live corporate action from NSE/BSE: Board meeting for quarterly financial results & dividend announcement.`,
                  badgeText: 'Board Concall',
                  symbol: sym,
                  relatedSymbol: sym,
                  impact: 'HIGH',
                  isAlertSet: true,
                  status: earnDate >= todayStr ? 'UPCOMING' : 'PASSED',
                });
              }
            }
            // Ex-Dividend date
            if (cal.exDividendDate?.raw) {
              const divDate = new Date(cal.exDividendDate.raw * 1000).toISOString().slice(0, 10);
              liveCorporateEvents.push({
                id: `live-div-${sym}-${divDate}`,
                title: `${sym} - Ex-Dividend / Corporate Action`,
                category: 'EARNINGS',
                date: divDate,
                description: `Ex-dividend record date for ${sym} shareholders registered with NSDL / CDSL.`,
                badgeText: 'Dividend Action',
                symbol: sym,
                relatedSymbol: sym,
                impact: 'MEDIUM',
                isAlertSet: true,
                status: divDate >= todayStr ? 'UPCOMING' : 'PASSED',
              });
            }
          }
        }
      } catch (err) {
        // Continue to next symbol
      }
    }

    res.json({
      success: true,
      source: 'NSE / BSE & Yahoo Financial Calendar',
      syncedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      liveEvents: liveCorporateEvents,
    });
  } catch (err: any) {
    console.error('Error fetching market calendar:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch live market calendar',
    });
  }
});

// 1. Zero-Code NSDL/CDSL CAS Processing Route
app.post('/api/ai/parse-cas', async (req, res) => {
  try {
    const { casText } = req.body;
    if (!casText || typeof casText !== 'string') {
      res.status(400).json({ error: 'casText is required' });
      return;
    }

    const ai = getAI();
    const prompt = `You are an expert Indian financial data engineer specializing in NSDL and CDSL Consolidated Account Statements (CAS).
Analyze the provided CAS statement text or table and extract all equity holdings and mutual funds into a clean, normalized JSON array.

Input CAS Statement:
"""
${casText.slice(0, 15000)}
"""

Extraction Rules:
1. For each distinct holding, extract:
   - "symbol": NSE/BSE stock ticker (e.g., "RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS", "CDSL", or clean mutual fund key like "PPFAS_FLEXI").
   - "name": Clean official company or fund name.
   - "isin": Valid ISIN (e.g. "INE002A01018"). If missing or obscured, infer from ticker or leave empty string.
   - "quantity": Number of shares or units held (positive integer or decimal for MF).
   - "avgPrice": Average cost price per unit in INR. If not found in CAS, estimate using current price or 0.
   - "cmp": Current Market Price or NAV in INR if present in statement.
   - "instrumentType": "EQUITY" or "MUTUAL_FUND".
   - "sector": Relevant Nifty sector (e.g., "Financial Services", "IT", "Energy", "Automobile", "FMCG", "Pharma & Healthcare").
   - "marketCap": "Large Cap", "Mid Cap", or "Small Cap" per SEBI norms.
2. Return ONLY a valid JSON object matching this schema:
{
  "holdings": [
    {
      "symbol": "RELIANCE",
      "name": "Reliance Industries Limited",
      "isin": "INE002A01018",
      "quantity": 50,
      "avgPrice": 2450.00,
      "cmp": 2980.50,
      "instrumentType": "EQUITY",
      "sector": "Energy",
      "marketCap": "Large Cap"
    }
  ],
  "statementSummary": {
    "depository": "NSDL or CDSL or CamS/KFintech",
    "statementPeriod": "e.g. As on 31-Mar-2025",
    "totalHoldingsCount": 1
  }
}
Respond with pure JSON only, no markdown backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error parsing CAS statement:', err);
    res.status(500).json({
      error: err.message || 'Failed to parse CAS statement with AI',
    });
  }
});

// 2. Multi-Broker Order Book Sync Route (Zerodha, Groww, Upstox)
app.post('/api/ai/parse-broker-trades', async (req, res) => {
  try {
    const { csvOrText, brokerHint } = req.body;
    if (!csvOrText || typeof csvOrText !== 'string') {
      res.status(400).json({ error: 'csvOrText is required' });
      return;
    }

    const ai = getAI();
    const prompt = `You are an expert Indian securities broker order book parser.
The user has exported their trade book or order history from an Indian stock broker (such as Zerodha Kite, Groww, Upstox, Angel One, or ICICI Direct).
Parse the raw CSV/text, clean up broker artifacts, deduplicate orders, and normalize into standard transaction records.

Broker Hint: ${brokerHint || 'Auto-detect'}
Raw Trade Export Data:
"""
${csvOrText.slice(0, 15000)}
"""

Rules:
1. Detect transaction type: "BUY", "SELL", "DIVIDEND", "BONUS", or "SPLIT".
2. Parse date into ISO format "YYYY-MM-DD".
3. Extract clean NSE/BSE symbol without exchange suffix (e.g. "TCS" not "TCS-EQ").
4. Extract quantity (positive integer), trade price (INR), and statutory charges/brokerage if present.
5. Return ONLY a valid JSON object matching this schema:
{
  "detectedBroker": "Zerodha Kite / Groww / Upstox / etc",
  "transactions": [
    {
      "symbol": "TCS",
      "name": "Tata Consultancy Services Ltd",
      "type": "BUY",
      "date": "2025-04-12",
      "quantity": 10,
      "price": 3850.00,
      "charges": 45.20,
      "notes": "Imported from Zerodha Tradebook",
      "instrumentType": "EQUITY",
      "sector": "IT",
      "marketCap": "Large Cap"
    }
  ],
  "totalTradesCount": 1
}
Respond with pure JSON only, no markdown codeblocks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error parsing broker trade book:', err);
    res.status(500).json({
      error: err.message || 'Failed to parse broker trade book with AI',
    });
  }
});

// 3. Mutual Fund vs Direct Stock Over-Overlap Audit Route
app.post('/api/ai/overlap-audit', async (req, res) => {
  try {
    const { directStocks, mutualFunds } = req.body;
    const ai = getAI();

    const prompt = `You are a Senior Portfolio Risk Manager specialized in Indian mutual funds and direct equities.
Analyze the concentration risk and overlap between the user's direct Indian equities and their mutual fund holdings.

User Direct Stock Holdings:
${JSON.stringify(directStocks || [], null, 2)}

User Mutual Fund Holdings:
${JSON.stringify(mutualFunds || [], null, 2)}

Task:
1. Identify high-overlap holdings (e.g., holding HDFC Bank or ICICI Bank directly while also having Parag Parikh Flexi Cap or HDFC Top 100 which hold huge allocations in the exact same stocks).
2. Calculate effective composite exposure to top common stocks.
3. Provide a concentration risk rating ("Low", "Moderate", "High", "Extreme") with specific mitigation steps.
4. Return ONLY a valid JSON object matching this structure:
{
  "riskRating": "Moderate",
  "summary": "Concise 2-sentence summary of overall household concentration",
  "overlapItems": [
    {
      "stockSymbol": "HDFCBANK",
      "stockName": "HDFC Bank Ltd",
      "directAllocationPct": 8.5,
      "overlappingFunds": [
        { "fundName": "Parag Parikh Flexi Cap Fund", "fundWeightPct": 7.8 },
        { "fundName": "HDFC Top 100 Fund", "fundWeightPct": 9.4 }
      ],
      "compositeExposurePct": 14.2,
      "warningLevel": "HIGH",
      "recommendation": "Consider trimming direct buy tranches as your flexi cap fund already provides heavy underlying exposure."
    }
  ],
  "actionableInsights": [
    "Insight 1 with concrete SEBI market context",
    "Insight 2 with sector diversification advice"
  ]
}
Respond with pure JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error conducting overlap audit:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate overlap audit',
    });
  }
});

// 4. Earnings Call & Exchange Filing Synthesizer Route
app.post('/api/ai/earnings-synthesizer', async (req, res) => {
  try {
    const { symbol, companyName, announcementText, quarterlyResult } = req.body;
    const ai = getAI();

    const prompt = `You are an elite Indian equities research analyst for NSE/BSE listed companies.
Synthesize the provided corporate quarterly earnings, management commentary, or exchange filing for ${symbol} (${companyName}).

Announcement / Filing Input:
"""
${(announcementText || quarterlyResult || `Recent quarterly results and corporate filings for ${symbol}`).slice(0, 10000)}
"""

Format Requirements:
Generate a crisp, high-impact 3-bullet synthesis answering why the stock moved and what the future trigger is.
Return ONLY a valid JSON object matching:
{
  "symbol": "${symbol}",
  "headline": "Punchy 1-line verdict (e.g. Beat on Revenue, Margin Expansion Led by Auto Segment)",
  "bullets": [
    {
      "title": "1. Topline & Operational Metrics",
      "content": "Specific revenue, EBITDA margin, and PAT numbers with YoY/QoQ comparison."
    },
    {
      "title": "2. Management Commentary & Guidance",
      "content": "Key takeaways from the MD/CEO concall regarding order book, capex, or raw material tailwinds."
    },
    {
      "title": "3. Portfolio Impact & Key Trigger",
      "content": "Clear forward catalyst to monitor (valuation vs historical PE, upcoming capacity commissioning, or sector risks)."
    }
  ],
  "analystVerdict": "ACCUMULATE / HOLD / TRIM / WATCH"
}
Pure JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error synthesizing earnings:', err);
    res.status(500).json({
      error: err.message || 'Failed to synthesize earnings announcement',
    });
  }
});

// 5. Tax-Loss Harvesting Co-Pilot Route
app.post('/api/ai/tax-loss-harvest', async (req, res) => {
  try {
    const { lossHoldings, realizedGains, currentFY } = req.body;
    const ai = getAI();

    const prompt = `You are a Chartered Accountant and Indian Capital Gains Tax Specialist under the Income Tax Act (Finance Act 2024).
Analyze the user's current unrealized loss positions against their realized gains for ${currentFY || 'FY 2025-26'}.

Tax Rules in India (Finance Act 2024):
- Short-Term Capital Gains (STCG, Section 111A) on equity: Taxed at flat 20%.
- Long-Term Capital Gains (LTCG, Section 112A) on equity held >= 365 days: Taxed at 12.5% above ₹1.25 Lakh exemption.
- Loss Set-off Rules: Short-term capital loss (STCL) can be set off against BOTH STCG and LTCG. Long-term capital loss (LTCL) can ONLY be set off against LTCG.

User's Realized Gains this FY:
${JSON.stringify(realizedGains || {}, null, 2)}

Unrealized Loss Candidates:
${JSON.stringify(lossHoldings || [], null, 2)}

Provide a step-by-step tax-loss harvesting execution plan before the March 31st fiscal year deadline.
Return ONLY a valid JSON object matching:
{
  "totalUnrealizedLossAvailable": 0,
  "potentialTaxSavingsINR": 0,
  "recommendedHarvests": [
    {
      "symbol": "SYMBOL",
      "sharesToSell": 10,
      "unrealizedLoss": 5000,
      "gainOffsetType": "STCG or LTCG",
      "taxSavedINR": 1000,
      "rebuyGuidance": "Can be repurchased on T+1 or T+2 to avoid wash-sale and maintain long-term fundamental conviction."
    }
  ],
  "deadlineWarning": "March 31st settlement cutoff note",
  "caNote": "Important disclaimer regarding demat transfer and Section 70/74 set-off rules"
}
Pure JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing tax loss harvesting:', err);
    res.status(500).json({
      error: err.message || 'Failed to analyze tax loss harvesting',
    });
  }
});

// Vite middleware or static serving
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Indian Wealth Dashboard Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
