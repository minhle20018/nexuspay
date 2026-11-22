import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'USDC', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK'];

interface MarketSnapshot {
  price: number | null;
  change: string | null;
}

function formatChangePercent(pct: number): string {
  if (!Number.isFinite(pct) || Math.abs(pct) < 0.005) return '0.0%';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

async function fetchCoinbaseMarket(symbol: string): Promise<MarketSnapshot> {
  const upper = symbol.trim().toUpperCase();
  if (!upper) return { price: null, change: null };
  if (upper === 'USDC') return { price: 1.0, change: '0.0%' };

  let price: number | null = null;
  let change: string | null = null;

  try {
    const spotRes = await fetch(
      `https://api.coinbase.com/v2/prices/${encodeURIComponent(upper)}-USD/spot`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      }
    );
    if (spotRes.ok) {
      const json: { data?: { amount?: string | number } } = await spotRes.json();
      const val = Number(json?.data?.amount);
      if (Number.isFinite(val) && val > 0) {
        price = val;
      }
    }
  } catch {
    // Ignore spot error
  }

  try {
    const statsRes = await fetch(
      `https://api.exchange.coinbase.com/products/${encodeURIComponent(upper)}-USD/stats`,
      {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NexusPay/1.0',
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (statsRes.ok) {
      const stats: { open?: string | number; last?: string | number } = await statsRes.json();
      const openVal = Number(stats?.open);
      const lastVal = price ?? Number(stats?.last);
      if (Number.isFinite(openVal) && openVal > 0 && Number.isFinite(lastVal) && lastVal > 0) {
        const pct = ((lastVal - openVal) / openVal) * 100;
        change = formatChangePercent(pct);
        if (price === null) {
          price = lastVal;
        }
      }
    }
  } catch {
    // Ignore stats error
  }

  return { price, change };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSymbols = searchParams.get('symbols');
  const requested = rawSymbols
    ? rawSymbols
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    : DEFAULT_SYMBOLS;

  const symbols = Array.from(new Set(requested));
  const prices: Record<string, number> = {};
  const changes: Record<string, string> = {};

  await Promise.all(
    symbols.map(async (sym) => {
      const snap = await fetchCoinbaseMarket(sym);
      if (snap.price !== null) {
        prices[sym] = snap.price;
      }
      if (snap.change !== null) {
        changes[sym] = snap.change;
      }
    })
  );

  return NextResponse.json(
    {
      prices,
      changes,
      updatedAt: Date.now(),
      source: 'coinbase-spot-stats',
    },
    { status: 200 }
  );
}