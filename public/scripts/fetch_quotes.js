const fs = require("fs");
const path = require("path");

const API_KEY = process.env.FINNHUB_API_KEY;
if (!API_KEY) {
  console.error("Missing FINNHUB_API_KEY env var.");
  process.exit(1);
}

// ✅ HIER deine Aktien eintragen (US-Ticker am einfachsten)
const SYMBOLS = ["AAPL", "MSFT", "TSLA", "NVDA"];

async function finnhubQuote(symbol) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${symbol}`);
  const data = await res.json();
  return {
    symbol,
    price: data.c,
    prevClose: data.pc,
    change: data.d,
    changePct: data.dp,
  };
}

async function main() {
  const startedAt = new Date().toISOString();

  const results = [];
  for (const s of SYMBOLS) {
    const q = await finnhubQuote(s);
    results.push(q);
    await new Promise(r => setTimeout(r, 350)); // kleines Delay
  }

  const payload = { startedAt, source: "finnhub", symbols: results };

  const outPath = path.join(process.cwd(), "public", "data.json");
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
