import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export interface WalletAsset {
  symbol: string;
  name: string;
  basePrice: number;
  price: number;
  change: string;
  amount: number;
  icon: string;
  address?: string;
}

export interface WalletActivity {
  id: string;
  type: 'Buy' | 'Sell' | 'Receive';
  symbol: string;
  amount: number;
  usdValue: number;
  timestamp: string;
}

export interface WalletPayload {
  assets: WalletAsset[];
  activities: WalletActivity[];
  updatedAt: number;
}

const STORE_FILE = path.join('/tmp', 'nexuspay_shared_wallet_v1.json');

const DEFAULT_WALLET: WalletPayload = {
  assets: [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      basePrice: 60865.64,
      price: 60865.64,
      change: '+2.4%',
      amount: 87.00205338809035,
      icon: '₿',
      address: 'bc1q098234hjt994k',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      basePrice: 1713.88,
      price: 1713.88,
      change: '+1.8%',
      amount: 1748.1748908296943,
      icon: 'Ξ',
      address: '0x71C84922b9183Ea482b',
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      basePrice: 70.39,
      price: 70.39,
      change: '-0.5%',
      amount: 12.5,
      icon: '◎',
      address: '8SExE819vJxK994nx',
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      basePrice: 554.28,
      price: 554.28,
      change: '+3.1%',
      amount: 1.2,
      icon: 'B',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      basePrice: 1.0,
      price: 1.0,
      change: '0.0%',
      amount: 1000448.6,
      icon: '$',
    },
    {
      symbol: 'XRP',
      name: 'Ripple',
      basePrice: 1.45,
      price: 1.45,
      change: '+4.2%',
      amount: 0,
      icon: '✕',
    },
    {
      symbol: 'DOGE',
      name: 'Dogecoin',
      basePrice: 0.24,
      price: 0.24,
      change: '+6.1%',
      amount: 0,
      icon: 'Ð',
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      basePrice: 0.78,
      price: 0.78,
      change: '-1.2%',
      amount: 0,
      icon: '₳',
    },
    {
      symbol: 'AVAX',
      name: 'Avalanche',
      basePrice: 38.5,
      price: 38.5,
      change: '+2.9%',
      amount: 0,
      icon: 'A',
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      basePrice: 18.2,
      price: 18.2,
      change: '+1.5%',
      amount: 0,
      icon: '⬡',
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp',
      basePrice: 125.53,
      price: 125.53,
      change: '-14.0%',
      amount: 0,
      icon: '🟢',
    },
  ],
  activities: [
    {
      id: 'act-1',
      type: 'Receive',
      symbol: 'BTC',
      amount: 87.00205339,
      usdValue: 87.00205338809035 * 60865.64,
      timestamp: 'Today, 08:15 AM',
    },
    {
      id: 'act-2',
      type: 'Receive',
      symbol: 'ETH',
      amount: 1748.17489083,
      usdValue: 1748.1748908296943 * 1713.88,
      timestamp: 'Yesterday, 04:40 PM',
    },
    {
      id: 'act-3',
      type: 'Receive',
      symbol: 'USDC',
      amount: 1000448.6,
      usdValue: 1000448.6,
      timestamp: '2 days ago',
    },
  ],
  updatedAt: Date.now(),
};

async function readWalletStore(): Promise<WalletPayload> {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.assets) && Array.isArray(parsed?.activities)) {
      return {
        assets: parsed.assets,
        activities: parsed.activities,
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
      };
    }
  } catch {
    // Chưa có file thì trả về mặc định
  }
  return { ...DEFAULT_WALLET, updatedAt: Date.now() };
}

async function writeWalletStore(payload: WalletPayload): Promise<void> {
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(payload), 'utf8');
}

export async function GET() {
  const data = await readWalletStore();
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body?.assets) || !Array.isArray(body?.activities)) {
      return NextResponse.json({ error: 'Invalid wallet payload' }, { status: 400 });
    }

    const nextPayload: WalletPayload = {
      assets: body.assets,
      activities: body.activities,
      updatedAt: Date.now(),
    };

    await writeWalletStore(nextPayload);
    return NextResponse.json(nextPayload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('Failed to save wallet:', err);
    return NextResponse.json({ error: 'Failed to save wallet' }, { status: 500 });
  }
}