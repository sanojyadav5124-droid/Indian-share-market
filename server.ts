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
