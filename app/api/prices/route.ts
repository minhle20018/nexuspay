import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK'];

export async function GET() {
  const prices: Record<string, number> = {
    USDC: 1.0,
  };

  await Promise.all(
    SYMBOLS.map(async (symbol) => {
      try {
        const res = await fetch(`https://api.coinbase.com/v2/prices/${symbol}-USD/spot`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return;
        const json = await res.json();
        const parsed = Number(json?.data?.amount);
        if (Number.isFinite(parsed) && parsed > 0) {
          prices[symbol] = parsed;
        }
      } catch {
        // Bỏ qua symbol lỗi để không làm hỏng toàn bộ response
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