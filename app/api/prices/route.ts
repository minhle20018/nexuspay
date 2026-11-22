$routeCode = @'
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'USDC', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK'];

async function fetchSpotPrice(symbol: string): Promise<number | null> {
  const upper = symbol.trim().toUpperCase();
  if (!upper) return null;
  if (upper === 'USDC') return 1.0;

  try {
    const res = await fetch(
      `https://api.coinbase.com/v2/prices/${encodeURIComponent(upper)}-USD/spot`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;
    const json: { data?: { amount?: string | number } } = await res.json();
    const val = Number(json?.data?.amount);
    return Number.isFinite(val) && val > 0 ? val : null;
  } catch {
    return null;
  }
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

  await Promise.all(
    symbols.map(async (sym) => {
      const price = await fetchSpotPrice(sym);
      if (price !== null) {
        prices[sym] = price;
      }
    })
  );

  return NextResponse.json(
    {
      prices,
      updatedAt: Date.now(),
      source: 'coinbase-spot',
    },
    { status: 200 }
  );
}
'@

if (Test-Path ".\app\api\prices") {
  Set-Content -Path ".\app\api\prices\route.ts" -Value $routeCode -Encoding utf8
} elseif (Test-Path ".\api\prices") {
  Set-Content -Path ".\api\prices\route.ts" -Value $routeCode -Encoding utf8
} else {
  New-Item -ItemType Directory -Force -Path ".\app\api\prices" | Out-Null
  Set-Content -Path ".\app\api\prices\route.ts" -Value $routeCode -Encoding utf8
}