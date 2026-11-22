'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface Asset {
  symbol: string;
  name: string;
  basePrice: number;
  price: number;
  change: string;
  amount: number;
  icon: string;
  address?: string;
}

interface ActivityItem {
  id: string;
  type: 'Buy' | 'Sell' | 'Receive';
  symbol: string;
  amount: number;
  usdValue: number;
  timestamp: string;
}

interface MarketPayload {
  prices: Record<string, number>;
  changes: Record<string, string>;
}

const LIVE_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'USDC', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK'];

const EMPTY_ASSETS: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', basePrice: 0, price: 0, change: '—', amount: 0, icon: '₿', address: 'bc1q098234hjt994k' },
  { symbol: 'ETH', name: 'Ethereum', basePrice: 0, price: 0, change: '—', amount: 0, icon: 'Ξ', address: '0x71C84922b9183Ea482b' },
  { symbol: 'SOL', name: 'Solana', basePrice: 0, price: 0, change: '—', amount: 0, icon: '◎', address: '8SExE819vJxK994nx' },
  { symbol: 'BNB', name: 'BNB', basePrice: 0, price: 0, change: '—', amount: 0, icon: 'B' },
  { symbol: 'USDC', name: 'USD Coin', basePrice: 0, price: 0, change: '—', amount: 0, icon: '$' },
  { symbol: 'XRP', name: 'Ripple', basePrice: 0, price: 0, change: '—', amount: 0, icon: '✕' },
  { symbol: 'DOGE', name: 'Dogecoin', basePrice: 0, price: 0, change: '—', amount: 0, icon: 'Ð' },
  { symbol: 'ADA', name: 'Cardano', basePrice: 0, price: 0, change: '—', amount: 0, icon: '₳' },
  { symbol: 'AVAX', name: 'Avalanche', basePrice: 0, price: 0, change: '—', amount: 0, icon: 'A' },
  { symbol: 'LINK', name: 'Chainlink', basePrice: 0, price: 0, change: '—', amount: 0, icon: '⬡' },
];

function formatChangeFromStats(openVal: number, lastVal: number): string | null {
  if (!Number.isFinite(openVal) || openVal <= 0 || !Number.isFinite(lastVal) || lastVal <= 0) {
    return null;
  }
  const pct = ((lastVal - openVal) / openVal) * 100;
  if (!Number.isFinite(pct) || Math.abs(pct) < 0.005) return '0.0%';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function applyMarketToAssets(
  list: Asset[],
  priceMap: Record<string, number>,
  changeMap: Record<string, string>
): Asset[] {
  return list.map((item) => {
    const nextPrice = priceMap[item.symbol];
    const nextChange = changeMap[item.symbol];
    const hasValidPrice = typeof nextPrice === 'number' && Number.isFinite(nextPrice) && nextPrice > 0;
    const hasValidChange = typeof nextChange === 'string' && nextChange.length > 0;

    if (!hasValidPrice && !hasValidChange) {
      return item;
    }

    return {
      ...item,
      price: hasValidPrice ? nextPrice : item.price,
      basePrice: hasValidPrice ? (item.basePrice > 0 ? item.basePrice : nextPrice) : item.basePrice,
      change: hasValidChange ? nextChange : item.change,
    };
  });
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'home' | 'trade' | 'explore' | 'activity'>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>(EMPTY_ASSETS);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'offline'>('syncing');
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string>('Updating...');

  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [usdInput, setUsdInput] = useState<string>('1000');
  const [coinInput, setCoinInput] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'usd' | 'coin'>('usd');
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);

  const lastUpdatedAtRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);
  const latestMarketRef = useRef<MarketPayload>({
    prices: {},
    changes: {},
  });

  const pullLivePrices = useCallback(async () => {
    const collectedPrices: Record<string, number> = { ...latestMarketRef.current.prices };
    const collectedChanges: Record<string, string> = { ...latestMarketRef.current.changes };
    let gotAnyMarketData = false;

    try {
      const res = await fetch(`/api/prices?symbols=${LIVE_SYMBOLS.join(',')}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const rawPrices = data?.prices && typeof data.prices === 'object' ? data.prices : data;
        const rawChanges = data?.changes && typeof data.changes === 'object' ? data.changes : {};

        if (rawPrices && typeof rawPrices === 'object') {
          for (const [sym, val] of Object.entries(rawPrices as Record<string, unknown>)) {
            const num = typeof val === 'number' ? val : Number(val);
            if (Number.isFinite(num) && num > 0) {
              collectedPrices[sym.toUpperCase()] = num;
              gotAnyMarketData = true;
            }
          }
        }

        if (rawChanges && typeof rawChanges === 'object') {
          for (const [sym, val] of Object.entries(rawChanges as Record<string, unknown>)) {
            if (typeof val === 'string' && val.trim().length > 0) {
              collectedChanges[sym.toUpperCase()] = val.trim();
              gotAnyMarketData = true;
            }
          }
        }
      }
    } catch {
      // Fallback to direct Coinbase endpoints
    }

    const missingPrice = LIVE_SYMBOLS.filter((sym) => !(collectedPrices[sym] > 0));
    if (missingPrice.length > 0) {
      await Promise.all(
        missingPrice.map(async (sym) => {
          try {
            const r = await fetch(`https://api.coinbase.com/v2/prices/${sym}-USD/spot`, { cache: 'no-store' });
            if (!r.ok) return;
            const j = await r.json();
            const n = Number(j?.data?.amount);
            if (Number.isFinite(n) && n > 0) {
              collectedPrices[sym] = n;
              gotAnyMarketData = true;
            }
          } catch {
            // Ignore failed symbol
          }
        })
      );
    }

    const missingChange = LIVE_SYMBOLS.filter((sym) => !collectedChanges[sym]);
    if (missingChange.length > 0) {
      await Promise.all(
        missingChange.map(async (sym) => {
          try {
            const r = await fetch(`https://api.exchange.coinbase.com/products/${sym}-USD/stats`, {
              cache: 'no-store',
            });
            if (!r.ok) return;
            const st = await r.json();
            const openVal = Number(st?.open);
            const lastVal = collectedPrices[sym] || Number(st?.last);
            const pctStr = formatChangeFromStats(openVal, lastVal);
            if (pctStr) {
              collectedChanges[sym] = pctStr;
              gotAnyMarketData = true;
            }
          } catch {
            // Ignore failed stats symbol
          }
        })
      );
    }

    if (gotAnyMarketData) {
      latestMarketRef.current = { prices: collectedPrices, changes: collectedChanges };
      setAssets((prev) => applyMarketToAssets(prev, collectedPrices, collectedChanges));
      setPriceUpdatedAt(new Date().toLocaleTimeString());
    }
  }, []);

  const pullWalletFromServer = useCallback(async (force = false) => {
    if (isSavingRef.current && !force) return;
    try {
      const res = await fetch('/api/wallet', { cache: 'no-store' });
      if (!res.ok) {
        setSyncStatus('offline');
        return;
      }
      const data = await res.json();
      if (Array.isArray(data?.assets) && Array.isArray(data?.activities)) {
        const remoteTs = typeof data.updatedAt === 'number' ? data.updatedAt : 0;
        if (force || remoteTs !== lastUpdatedAtRef.current) {
          lastUpdatedAtRef.current = remoteTs;
          setAssets(
            applyMarketToAssets(
              data.assets,
              latestMarketRef.current.prices,
              latestMarketRef.current.changes
            )
          );
          setActivities(data.activities);
        }
        setSyncStatus('synced');
      }
    } catch {
      setSyncStatus('offline');
    }
  }, []);

  const pushWalletToServer = useCallback(async (nextAssets: Asset[], nextActivities: ActivityItem[]) => {
    isSavingRef.current = true;
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ assets: nextAssets, activities: nextActivities }),
      });
      if (!res.ok) {
        setSyncStatus('offline');
        return;
      }
      const saved = await res.json();
      if (typeof saved?.updatedAt === 'number') {
        lastUpdatedAtRef.current = saved.updatedAt;
      }
      if (Array.isArray(saved?.assets) && Array.isArray(saved?.activities)) {
        setAssets(
          applyMarketToAssets(
            saved.assets,
            latestMarketRef.current.prices,
            latestMarketRef.current.changes
          )
        );
        setActivities(saved.activities);
      }
      setSyncStatus('synced');
    } catch {
      setSyncStatus('offline');
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    pullLivePrices();
    pullWalletFromServer(true);

    const onReturn = () => {
      if (document.visibilityState === 'visible') {
        pullLivePrices();
        pullWalletFromServer(true);
      }
    };

    window.addEventListener('focus', onReturn);
    document.addEventListener('visibilitychange', onReturn);

    const walletTimer = setInterval(() => {
      if (document.visibilityState === 'visible') pullWalletFromServer(false);
    }, 3000);

    const priceTimer = setInterval(() => {
      if (document.visibilityState === 'visible') pullLivePrices();
    }, 4000);

    return () => {
      window.removeEventListener('focus', onReturn);
      document.removeEventListener('visibilitychange', onReturn);
      clearInterval(walletTimer);
      clearInterval(priceTimer);
    };
  }, [isLoggedIn, pullLivePrices, pullWalletFromServer]);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.symbol === selectedSymbol) || assets[0],
    [assets, selectedSymbol]
  );

  useEffect(() => {
    const currentPrice = selectedAsset?.price || 0;
    if (currentPrice <= 0) return;
    if (lastEdited === 'usd') {
      const usdVal = parseFloat(usdInput);
      setCoinInput(!isNaN(usdVal) && usdVal >= 0 ? (usdVal / currentPrice).toFixed(6) : '');
    } else {
      const coinVal = parseFloat(coinInput);
      setUsdInput(!isNaN(coinVal) && coinVal >= 0 ? (coinVal * currentPrice).toFixed(2) : '');
    }
  }, [usdInput, coinInput, lastEdited, selectedAsset?.price]);

  const totalPortfolioUsd = useMemo(
    () => assets.reduce((sum, item) => sum + item.amount * item.price, 0),
    [assets]
  );

  const walletAssets = useMemo(() => assets.filter((a) => a.amount > 0), [assets]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    const lower = q.toLowerCase();
    const upper = q.toUpperCase();
    const matched = assets.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        a.symbol.toLowerCase().includes(lower) ||
        (a.address && a.address.toLowerCase().includes(lower))
    );
    return matched.length > 0
      ? matched
      : [
          {
            symbol: upper,
            name: `${upper} Asset`,
            basePrice: 0,
            price: latestMarketRef.current.prices[upper] || 0,
            change: latestMarketRef.current.changes[upper] || '—',
            amount: 0,
            icon: '✨',
          },
        ];
  }, [assets, searchQuery]);

  const handleCopyAddress = (addr: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress((prev) => (prev === addr ? null : prev)), 1500);
  };

  const handleExecuteTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setTradeMessage(null);
    const usdAmount = parseFloat(usdInput);
    const coinAmount = parseFloat(coinInput);
    if (isNaN(usdAmount) || isNaN(coinAmount) || usdAmount <= 0 || coinAmount <= 0) {
      setTradeMessage('Please enter a valid amount greater than 0.');
      return;
    }
    if (!selectedAsset || selectedAsset.price <= 0) {
      setTradeMessage('Waiting for live market price, please try again.');
      return;
    }
    if (tradeMode === 'sell' && coinAmount > selectedAsset.amount) {
      setTradeMessage(`Insufficient ${selectedAsset.symbol} balance to sell.`);
      return;
    }

    const soldCompletely =
      tradeMode === 'sell' && Number(Math.max(0, selectedAsset.amount - coinAmount).toFixed(8)) <= 0;

    const updatedAssets = assets
      .map((item) => {
        if (item.symbol === selectedAsset.symbol) {
          const updatedAmount = tradeMode === 'buy' ? item.amount + coinAmount : item.amount - coinAmount;
          return { ...item, amount: Number(Math.max(0, updatedAmount).toFixed(8)) };
        }
        return item;
      })
      .filter((item) => !(tradeMode === 'sell' && item.symbol === selectedAsset.symbol && item.amount <= 0));

    const remainingWithBalance = updatedAssets.filter((item) => item.amount > 0);
    if (soldCompletely && remainingWithBalance.length > 0) {
      setSelectedSymbol(remainingWithBalance[0].symbol);
    }

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: tradeMode === 'buy' ? 'Buy' : 'Sell',
      symbol: selectedAsset.symbol,
      amount: coinAmount,
      usdValue: usdAmount,
      timestamp: 'Just now',
    };

    const nextActivities = [newActivity, ...activities];
    setAssets(updatedAssets);
    setActivities(nextActivities);
    await pushWalletToServer(updatedAssets, nextActivities);

    setTradeMessage(
      soldCompletely
        ? `Sold all ${selectedAsset.symbol} and synced wallet ($${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`
        : `${tradeMode === 'buy' ? 'Bought' : 'Sold'} ${coinAmount.toFixed(6)} ${selectedAsset.symbol} ($${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) — synced.`
    );
  };

  const formatUsd = (val: number) =>
    val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatCoinPrice = (val: number) => {
    if (!Number.isFinite(val) || val <= 0) return 'Loading...';
    return val < 2
      ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
      : `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const syncLabel =
    syncStatus === 'synced'
      ? `Wallet 1 • Live (${priceUpdatedAt})`
      : syncStatus === 'syncing'
      ? 'Wallet 1 • Syncing...'
      : 'Wallet 1 • Offline / Retrying';

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-[#121216] border border-white/10 rounded-3xl p-7 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm font-bold text-emerald-400">N</div>
              <span className="text-base font-bold">NexusPay</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">Web3 Wallet</span>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold">Signed Out</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">Your session is locked. Sign back in to access Wallet 1 across your devices.</p>
          </div>
          <div className="bg-[#0c0d10] border border-white/10 rounded-2xl p-4 space-y-1">
            <div className="text-xs text-zinc-400">Estimated Portfolio</div>
            <div className="text-2xl font-extrabold text-emerald-400">${formatUsd(totalPortfolioUsd)}</div>
          </div>
          <button
            type="button"
            onClick={() => setIsLoggedIn(true)}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition cursor-pointer"
          >
            Sign Back In to Wallet 1
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white flex justify-center">
      <div className="relative w-full max-w-[460px] min-h-screen bg-[#0c0d10] border-x border-white/10 flex flex-col pb-24">
        <header className="sticky top-0 z-20 bg-[#0c0d10]/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm font-bold text-emerald-400">N</div>
            <div>
              <div className="text-sm font-bold leading-tight">NexusPay</div>
              <div className="text-[11px] text-emerald-400 leading-tight">{syncLabel}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLoggedIn(false)}
            className="relative z-30 text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-300 border border-white/10 transition cursor-pointer"
          >
            Sign Out
          </button>
        </header>

        <main className="flex-1 px-5 pt-5 space-y-6">
          {activeTab === 'home' && (
            <>
              <section className="text-center space-y-1.5 pt-1">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">${formatUsd(totalPortfolioUsd)}</div>
                <div className="text-xs font-medium text-emerald-400">{syncLabel}</div>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('trade')}
                  className="bg-[#16181e] hover:bg-[#1e2129] border border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-base font-bold">+</span>
                  <span className="text-sm font-semibold">Deposit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('activity')}
                  className="bg-[#16181e] hover:bg-[#1e2129] border border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-base font-bold">↓</span>
                  <span className="text-sm font-semibold">Receive</span>
                </button>
              </section>

              <section className="space-y-2.5">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any symbol to buy (e.g. BTC, DOGE, SOL...)"
                    className="w-full bg-[#14161c] border border-white/10 rounded-2xl px-4 py-3 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white px-1.5 py-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {searchQuery.trim().length > 0 && (
                  <div className="bg-[#12141a] border border-emerald-500/30 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Search Results ({searchResults.length})
                      </span>
                      <span className="text-[11px] text-emerald-400">Tap Buy to trade</span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.map((coin) => (
                        <div
                          key={`search-${coin.symbol}`}
                          className="bg-[#181b23] border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm shrink-0">{coin.icon}</div>
                            <div className="truncate">
                              <div className="text-sm font-bold truncate">
                                {coin.name} <span className="text-xs font-normal text-zinc-400">({coin.symbol})</span>
                              </div>
                              <div className="text-xs text-zinc-400">{formatCoinPrice(coin.price)} • Bal: {coin.amount}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const nextAssets = assets.some((item) => item.symbol === coin.symbol) ? assets : [...assets, coin];
                              setAssets(nextAssets);
                              setSelectedSymbol(coin.symbol);
                              setTradeMode('buy');
                              setTradeMessage(null);
                              setActiveTab('trade');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shrink-0 transition cursor-pointer"
                          >
                            Buy
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section
                onClick={() => setActiveTab('trade')}
                className="bg-gradient-to-r from-[#171b24] to-[#13161d] border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-white/20 transition"
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold">Trade on Your Terms</div>
                  <div className="text-xs text-zinc-400">Buy & Sell all supported assets anytime.</div>
                  <div className="text-xs font-semibold text-emerald-400 pt-0.5">Start Trading →</div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold text-lg">📈</div>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-200">Fund your wallet</h2>
                  <span className="text-[11px] text-zinc-400">Wallet Addresses</span>
                </div>
                <div className="bg-[#14161c] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
                  {assets
                    .filter((a) => Boolean(a.address))
                    .map((a) => (
                      <div
                        key={`addr-${a.symbol}`}
                        onClick={() => a.address && handleCopyAddress(a.address)}
                        className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#191c24] transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-sm shrink-0">{a.icon}</div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">
                              {a.name} <span className="text-xs font-normal text-zinc-400">({a.symbol})</span>
                            </div>
                            <div className="text-xs text-zinc-500 font-mono truncate">{a.address}</div>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-400 shrink-0 font-medium">
                          {copiedAddress === a.address ? 'Copied' : '📄'}
                        </span>
                      </div>
                    ))}
                </div>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-200">Your Assets (Harry Bui)</h2>
                  <span className="text-xs font-medium text-emerald-400">• Live Prices</span>
                </div>
                <div className="space-y-2.5">
                  {walletAssets.map((asset) => {
                    const usdTotal = asset.amount * asset.price;
                    const isNegative = asset.change.startsWith('-');
                    const isNeutral = asset.change === '0.0%' || asset.change === '—';

                    return (
                      <div
                        key={asset.symbol}
                        onClick={() => {
                          setSelectedSymbol(asset.symbol);
                          setTradeMessage(null);
                          setActiveTab('trade');
                        }}
                        className="bg-[#14161c] hover:bg-[#191c24] border border-white/5 rounded-2xl p-4 flex items-center justify-between transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-base shrink-0">{asset.icon}</div>
                          <div className="truncate">
                            <div className="text-sm font-bold truncate">{asset.name}</div>
                            <div className="text-xs text-zinc-400 truncate">
                              {asset.amount} {asset.symbol} • {formatCoinPrice(asset.price)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <div className="text-sm font-bold">${formatUsd(usdTotal)}</div>
                          <div
                            className={`text-xs font-semibold ${
                              isNeutral ? 'text-zinc-400' : isNegative ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {asset.change}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activeTab === 'trade' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Trade & Swap</h1>
                <span className="text-xs text-emerald-400">
                  1 {selectedAsset.symbol} = {formatCoinPrice(selectedAsset.price)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#14161c] p-1.5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setTradeMode('buy');
                    setTradeMessage(null);
                  }}
                  className={`py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
                    tradeMode === 'buy' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTradeMode('sell');
                    setTradeMessage(null);
                  }}
                  className={`py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
                    tradeMode === 'sell' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sell
                </button>
              </div>

              <form onSubmit={handleExecuteTrade} className="bg-[#14161c] border border-white/10 rounded-2xl p-4 space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Select Asset (All)</label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => {
                      setSelectedSymbol(e.target.value);
                      setTradeMessage(null);
                    }}
                    className="w-full bg-[#0c0d10] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {assets.map((a) => (
                      <option key={a.symbol} value={a.symbol}>
                        {a.name} ({a.symbol}) — Balance: {a.amount}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Amount (USD)</label>
                  <input
                    type="number"
                    step="any"
                    value={usdInput}
                    onChange={(e) => {
                      setLastEdited('usd');
                      setUsdInput(e.target.value);
                    }}
                    className="w-full bg-[#0c0d10] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Amount ({selectedAsset.symbol})</label>
                  <input
                    type="number"
                    step="any"
                    value={coinInput}
                    onChange={(e) => {
                      setLastEdited('coin');
                      setCoinInput(e.target.value);
                    }}
                    className="w-full bg-[#0c0d10] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {tradeMessage && (
                  <div className="text-xs px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    {tradeMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition cursor-pointer ${
                    tradeMode === 'buy' ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                >
                  {tradeMode === 'buy' ? `Buy ${selectedAsset.symbol}` : `Sell ${selectedAsset.symbol}`}
                </button>
              </form>
            </section>
          )}

          {activeTab === 'explore' && (
            <section className="space-y-3">
              <h1 className="text-xl font-bold">Market Watch (Live)</h1>
              {assets.map((a) => (
                <div
                  key={`exp-${a.symbol}`}
                  onClick={() => {
                    setSelectedSymbol(a.symbol);
                    setTradeMessage(null);
                    setActiveTab('trade');
                  }}
                  className="bg-[#14161c] hover:bg-[#191c24] border border-white/5 rounded-2xl p-4 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center font-bold">{a.icon}</div>
                    <div>
                      <div className="text-sm font-bold">{a.name}</div>
                      <div className="text-xs text-zinc-400">{a.symbol} • Bal: {a.amount}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatCoinPrice(a.price)}</div>
                    <div className="text-xs text-emerald-400">Trade →</div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {activeTab === 'activity' && (
            <section className="space-y-3">
              <h1 className="text-xl font-bold">Recent Activity</h1>
              {activities.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#14161c] border border-white/5 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold">{item.type} {item.symbol}</div>
                    <div className="text-xs text-zinc-400">{item.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.amount} {item.symbol}</div>
                    <div className="text-xs text-emerald-400">${formatUsd(item.usdValue)}</div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>

        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[412px] h-16 bg-[#161821]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-2 flex items-center justify-around z-30">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${activeTab === 'home' ? 'text-emerald-400' : 'text-zinc-400'}`}
          >
            <span>🏠</span>
            <span className="text-[10px] mt-0.5">Home</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trade')}
            className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${activeTab === 'trade' ? 'text-emerald-400' : 'text-zinc-400'}`}
          >
            <span>📊</span>
            <span className="text-[10px] mt-0.5">Trade</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${activeTab === 'explore' ? 'text-emerald-400' : 'text-zinc-400'}`}
          >
            <span>🔍</span>
            <span className="text-[10px] mt-0.5">Explore</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${activeTab === 'activity' ? 'text-emerald-400' : 'text-zinc-400'}`}
          >
            <span>⏰</span>
            <span className="text-[10px] mt-0.5">Activity</span>
          </button>
        </nav>
      </div>
    </div>
  );
}