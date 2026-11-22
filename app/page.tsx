'use client';

import React, { useState, useEffect, useMemo } from 'react';

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

const INITIAL_ASSETS: Asset[] = [
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
  // Các đồng tiền khác — có thể Buy & Sell đầy đủ
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
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'home' | 'trade' | 'explore' | 'activity'>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);

  // Trade state
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [usdInput, setUsdInput] = useState<string>('1000');
  const [coinInput, setCoinInput] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'usd' | 'coin'>('usd');
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);

  // Activity log
  const [activities, setActivities] = useState<ActivityItem[]>([
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
  ]);

  useEffect(() => {
    const savedStatus = localStorage.getItem('nexus_logged_in');
    if (savedStatus === 'false') {
      setIsLoggedIn(false);
    }

    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          if (asset.symbol === 'USDC') {
            return { ...asset, price: 1.0 };
          }
          const swingPercent = (Math.random() * 0.4 - 0.2) / 100; // ±0.20% quanh basePrice
          const decimals = asset.basePrice < 2 ? 4 : 2;
          const nextPrice = Number((asset.basePrice * (1 + swingPercent)).toFixed(decimals));
          return {
            ...asset,
            price: nextPrice > 0 ? nextPrice : asset.basePrice,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.symbol === selectedSymbol) || assets[0],
    [assets, selectedSymbol]
  );

  // Đồng bộ quy đổi USD <-> Coin khi đổi input hoặc giá nhảy
  useEffect(() => {
    const currentPrice = selectedAsset?.price || 1;
    if (lastEdited === 'usd') {
      const usdVal = parseFloat(usdInput);
      if (!isNaN(usdVal) && usdVal >= 0) {
        setCoinInput((usdVal / currentPrice).toFixed(6));
      } else {
        setCoinInput('');
      }
    } else {
      const coinVal = parseFloat(coinInput);
      if (!isNaN(coinVal) && coinVal >= 0) {
        setUsdInput((coinVal * currentPrice).toFixed(2));
      } else {
        setUsdInput('');
      }
    }
  }, [usdInput, coinInput, lastEdited, selectedAsset?.price]);

  const totalPortfolioUsd = useMemo(
    () => assets.reduce((sum, item) => sum + item.amount * item.price, 0),
    [assets]
  );

  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.symbol.toLowerCase().includes(q) ||
        (a.address && a.address.toLowerCase().includes(q))
    );
  }, [assets, searchQuery]);

  const handleSignOut = () => {
    localStorage.setItem('nexus_logged_in', 'false');
    setIsLoggedIn(false);
  };

  const handleSignIn = () => {
    localStorage.setItem('nexus_logged_in', 'true');
    setIsLoggedIn(true);
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeMessage(null);

    const usdAmount = parseFloat(usdInput);
    const coinAmount = parseFloat(coinInput);

    if (isNaN(usdAmount) || isNaN(coinAmount) || usdAmount <= 0 || coinAmount <= 0) {
      setTradeMessage('Vui lòng nhập số tiền hợp lệ lớn hơn 0.');
      return;
    }

    if (tradeMode === 'sell' && coinAmount > selectedAsset.amount) {
      setTradeMessage(`Không đủ số dư ${selectedAsset.symbol} để bán.`);
      return;
    }

    const usdcAsset = assets.find((a) => a.symbol === 'USDC');
    if (
      tradeMode === 'buy' &&
      selectedAsset.symbol !== 'USDC' &&
      usdcAsset &&
      usdAmount > usdcAsset.amount
    ) {
      setTradeMessage('Không đủ số dư USDC để mua.');
      return;
    }

    setAssets((prev) =>
      prev.map((item) => {
        if (item.symbol === selectedAsset.symbol) {
          const updatedAmount =
            tradeMode === 'buy' ? item.amount + coinAmount : item.amount - coinAmount;
          return { ...item, amount: Number(Math.max(0, updatedAmount).toFixed(8)) };
        }
        if (item.symbol === 'USDC' && selectedAsset.symbol !== 'USDC') {
          const updatedUsdc =
            tradeMode === 'buy' ? item.amount - usdAmount : item.amount + usdAmount;
          return { ...item, amount: Number(Math.max(0, updatedUsdc).toFixed(2)) };
        }
        return item;
      })
    );

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: tradeMode === 'buy' ? 'Buy' : 'Sell',
      symbol: selectedAsset.symbol,
      amount: coinAmount,
      usdValue: usdAmount,
      timestamp: 'Just now',
    };

    setActivities((prev) => [newActivity, ...prev]);
    setTradeMessage(
      `${tradeMode === 'buy' ? 'Đã mua' : 'Đã bán'} ${coinAmount.toFixed(6)} ${selectedAsset.symbol} ($${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`
    );
  };

  const formatUsd = (val: number) =>
    val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatCoinPrice = (val: number) =>
    val < 2
      ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
      : val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-[#121216] border border-white/10 rounded-3xl p-7 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-bold text-emerald-400">
                N
              </div>
              <span className="font-bold text-lg tracking-tight">NexusPay</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10">
              Web3 Wallet
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Signed Out</h1>
            <p className="text-sm text-zinc-400">
              Your session is locked. Sign back in to access Wallet 1 (Harry Bui) and live asset feeds.
            </p>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-1">
            <div className="text-xs text-zinc-400">Estimated Portfolio</div>
            <div className="text-xl font-bold text-emerald-400">${formatUsd(totalPortfolioUsd)}</div>
          </div>

          <button
            onClick={handleSignIn}
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
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-[#0c0d10]/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm font-bold text-emerald-400">
              N
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">NexusPay</div>
              <div className="text-[11px] text-emerald-400 leading-tight">Wallet 1 • Live Feed Active</div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-300 border border-white/10 transition cursor-pointer"
          >
            Sign Out
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-5 pt-5 space-y-6">
          {activeTab === 'home' && (
            <>
              {/* Portfolio Balance */}
              <section className="text-center space-y-1.5 pt-1">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  ${formatUsd(totalPortfolioUsd)}
                </div>
                <div className="text-xs font-medium text-emerald-400">
                  Wallet 1 (Live Feed Active)
                </div>
              </section>

              {/* Action Buttons */}
              <section className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('trade')}
                  className="bg-[#16181e] hover:bg-[#1e2129] border border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-base font-bold">
                    +
                  </span>
                  <span className="text-sm font-semibold">Deposit</span>
                </button>

                <button
                  onClick={() => setActiveTab('activity')}
                  className="bg-[#16181e] hover:bg-[#1e2129] border border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-base font-bold">
                    ↓
                  </span>
                  <span className="text-sm font-semibold">Receive</span>
                </button>
              </section>

              {/* Search Input */}
              <section>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Assets or URL"
                  className="w-full bg-[#14161c] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60"
                />
              </section>

              {/* Promo Banner */}
              <section
                onClick={() => setActiveTab('trade')}
                className="bg-gradient-to-r from-[#171b24] to-[#13161d] border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-white/20 transition"
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold">Trade on Your Terms</div>
                  <div className="text-xs text-zinc-400">Buy & Sell all supported assets anytime.</div>
                  <div className="text-xs font-semibold text-emerald-400 pt-0.5">Start Trading →</div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold text-lg">
                  📈
                </div>
              </section>

              {/* Fund your wallet addresses */}
              <section className="space-y-2.5">
                <h2 className="text-sm font-bold text-zinc-200">Fund your wallet</h2>
                <div className="space-y-2">
                  {assets
                    .filter((a) => a.address)
                    .map((a) => (
                      <div
                        key={`addr-${a.symbol}`}
                        className="bg-[#14161c] border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm">
                            {a.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{a.name}</div>
                            <div className="text-xs text-zinc-500 font-mono">{a.address}</div>
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400">📄</span>
                      </div>
                    ))}
                </div>
              </section>

              {/* Your Assets */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-200">Your Assets (Harry Bui)</h2>
                  <span className="text-xs font-medium text-emerald-400">• Live Pricing</span>
                </div>

                <div className="space-y-2.5">
                  {filteredAssets.map((asset) => {
                    const usdTotal = asset.amount * asset.price;
                    const isNegative = asset.change.startsWith('-');
                    const isNeutral = asset.change === '0.0%';

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
                          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-base shrink-0">
                            {asset.icon}
                          </div>
                          <div className="truncate">
                            <div className="text-sm font-bold truncate">{asset.name}</div>
                            <div className="text-xs text-zinc-400 truncate">
                              {asset.amount} {asset.symbol} • ${formatCoinPrice(asset.price)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <div className="text-sm font-bold">${formatUsd(usdTotal)}</div>
                          <div
                            className={`text-xs font-semibold ${
                              isNeutral
                                ? 'text-zinc-400'
                                : isNegative
                                ? 'text-rose-400'
                                : 'text-emerald-400'
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
                  1 {selectedAsset.symbol} = ${formatCoinPrice(selectedAsset.price)}
                </span>
              </div>

              {/* Buy / Sell Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#14161c] p-1.5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setTradeMode('buy');
                    setTradeMessage(null);
                  }}
                  className={`py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
                    tradeMode === 'buy'
                      ? 'bg-emerald-500 text-black'
                      : 'text-zinc-400 hover:text-white'
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
                    tradeMode === 'sell'
                      ? 'bg-rose-500 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sell
                </button>
              </div>

              <form
                onSubmit={handleExecuteTrade}
                className="bg-[#14161c] border border-white/10 rounded-2xl p-4 space-y-4"
              >
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Select Asset (All Coins)</label>
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
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Amount ({selectedAsset.symbol})
                  </label>
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
                    tradeMode === 'buy'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                >
                  {tradeMode === 'buy' ? `Buy ${selectedAsset.symbol}` : `Sell ${selectedAsset.symbol}`}
                </button>
              </form>
            </section>
          )}

          {activeTab === 'explore' && (
            <section className="space-y-3">
              <h1 className="text-xl font-bold">Market Watch</h1>
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
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center font-bold">
                      {a.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{a.name}</div>
                      <div className="text-xs text-zinc-400">
                        {a.symbol} • Bal: {a.amount}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">${formatCoinPrice(a.price)}</div>
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
                    <div className="text-sm font-bold">
                      {item.type} {item.symbol}
                    </div>
                    <div className="text-xs text-zinc-400">{item.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {item.amount} {item.symbol}
                    </div>
                    <div className="text-xs text-emerald-400">${formatUsd(item.usdValue)}</div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[412px] h-16 bg-[#161821]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-2 flex items-center justify-around z-30">
          <button
            onClick={() => setActiveTab('home')}
            className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${
              activeTab === 'home' ? 'text-emerald-400' : 'text-zinc-400'
            }`}
          >
            <span>🏠</span>
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('trade')}
            className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${
              activeTab === 'trade' ? 'text-emerald-400' : 'text-zinc-400'
            }`}
          >
            <span>📊</span>
            <span className="text-[10px] mt-0.5">Trade</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${
              activeTab === 'explore' ? 'text-emerald-400' : 'text-zinc-400'
            }`}
          >
            <span>🔍</span>
            <span className="text-[10px] mt-0.5">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${
              activeTab === 'activity' ? 'text-emerald-400' : 'text-zinc-400'
            }`}
          >
            <span>⏰</span>
            <span className="text-[10px] mt-0.5">Activity</span>
          </button>
        </nav>
      </div>
    </div>
  );
}