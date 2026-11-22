import { NextRequest, NextResponse } from 'next/server';

const CACHE_TTL_MS = 4000;
let priceCache: { expiresAt: number; data: Record<string, number> } = {
  expiresAt: 0,
  data: {},
};

async function fetchSpotPrice(symbol: string): Promise<number | null> {
  if (symbol === 'USDC') return 1.0;
  if (symbol === 'NVDA') return null;

  try {
    const res = await fetch(
      `https://api.coinbase.com/v2/prices/${encodeURIComponent(symbol)}-USD/spot`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const val = parseFloat(json?.data?.amount);
    return !Number.isNaN(val) && val > 0 ? val : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSymbols = searchParams.get('symbols') || 'BTC,ETH,SOL,BNB,USDC';
  const symbols = Array.from(
    new Set(
      rawSymbols
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    )
  );

  const now = Date.now();
  const hasAllCached =
    priceCache.expiresAt > now && symbols.every((sym) => sym in priceCache.data);

  if (hasAllCached) {
    const sliced: Record<string, number> = {};
    for (const sym of symbols) {
      sliced[sym] = priceCache.data[sym];
    }
    return NextResponse.json({ prices: sliced, cached: true, updatedAt: now });
  }

  const entries = await Promise.all(
    symbols.map(async (sym) => {
      const price = await fetchSpotPrice(sym);
      return [sym, price] as const;
    })
  );

  const result: Record<string, number> = {};
  for (const [sym, price] of entries) {
    if (price !== null) {
      result[sym] = price;
      priceCache.data[sym] = price;
    }
  }
  priceCache.expiresAt = now + CACHE_TTL_MS;

  return NextResponse.json({ prices: result, cached: false, updatedAt: now });
}