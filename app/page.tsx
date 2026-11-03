'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeUsd, setTradeUsd] = useState('1000');

  const [assets, setAssets] = useState([
    { symbol: 'BTC', name: 'Bitcoin', price: 77920.00, change: '+2.4%', amount: 10.0, icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', price: 2290.00, change: '+1.8%', amount: 1748.17, icon: 'Ξ' },
    { symbol: 'SOL', name: 'Solana', price: 97.00, change: '-0.5%', amount: 12.5, icon: '◎' },
    { symbol: 'BNB', name: 'BNB', price: 705.00, change: '+3.1%', amount: 1.2, icon: 'B' },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00, change: '0.0%', amount: 448.60, icon: '$' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        if (asset.symbol !== 'USDC') {
          const fluctuation = (Math.random() * 0.3 - 0.145) / 100;
          return { ...asset, price: Number((asset.price * (1 + fluctuation)).toFixed(2)) };
        }
        return asset;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const calculateTotal = () => {
    return assets.reduce((acc, item) => acc + (item.amount * item.price), 0);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard: " + text);
  };

  const logout = () => {
    if (confirm("Lock wallet and return to secure screen?")) {
      alert("Wallet locked successfully.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-slate-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-[414px] h-screen sm:h-[896px] bg-[#0c0d10] sm:rounded-[48px] sm:border-[8px] sm:border-[#1a1c23] shadow-2xl flex flex-col overflow-hidden relative">

        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#0c0d10]">
          
          {/* Top Header */}
          <div className="px-6 pt-10 pb-4 flex items-center justify-between bg-[#0c0d10] shrink-0 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                HB
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight capitalize">{activeTab}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-2 animate-ping"></span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => alert('No new rewards.')} className="w-10 h-10 rounded-full bg-[#161821] border border-slate-800 flex items-center justify-center text-emerald-400 cursor-pointer">🎁</button>
              <button onClick={() => alert('Scanning QR...')} className="w-10 h-10 rounded-full bg-[#161821] border border-slate-800 flex items-center justify-center text-slate-300 cursor-pointer">📷</button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-28 px-6 space-y-6">
            
            {activeTab === 'home' && (
              <div className="space-y-6">
                
                <div className="text-center py-2">
                  <h2 className="text-4xl font-extrabold tracking-tight text-white">
                    ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className="text-xs text-emerald-400 font-medium mt-1">Wallet 1 (Live Feed Active)</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => alert("Deposit clicked!")} className="flex flex-col items-center justify-center py-4 px-5 rounded-2xl bg-[#161821] border border-slate-800 hover:bg-[#1f222e] cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-1 font-bold">+</div>
                    <span className="text-sm font-semibold text-white">Deposit</span>
                  </button>
                  <button onClick={() => copyText("0x71C84922b9183Ea482b")} className="flex flex-col items-center justify-center py-4 px-5 rounded-2xl bg-[#161821] border border-slate-800 hover:bg-[#1f222e] cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 mb-1 font-bold">↓</div>
                    <span className="text-sm font-semibold text-white">Receive</span>
                  </button>
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search Assets or URL" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full bg-[#161821] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500" 
                  />
                </div>

                <div className="bg-gradient-to-r from-[#161821] to-[#1e2330] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1 max-w-[210px]">
                    <h4 className="text-xs font-bold text-white">Trade on Your Terms</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">Limit orders are now live. Try it out today.</p>
                    <button onClick={() => setActiveTab('trade')} className="text-xs font-semibold text-emerald-400 pt-1 cursor-pointer">Start Trading →</button>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-2xl flex items-center justify-center text-slate-950 font-bold">📈</div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white">Fund your wallet</h3>
                  <div className="bg-[#161821] rounded-2xl border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
                    <div className="flex items-center justify-between p-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 font-bold">Ξ</div>
                        <div>
                          <p className="text-xs font-semibold text-white">Ethereum</p>
                          <p className="text-[10px] text-slate-400 font-mono">0x71C84922b9183Ea482b</p>
                        </div>
                      </div>
                      <button onClick={() => copyText('0x71C84922b9183Ea482b')} className="text-slate-400 hover:text-white cursor-pointer text-xs">📋</button>
                    </div>
                    <div className="flex items-center justify-between p-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-purple-400 font-bold">◎</div>
                        <div>
                          <p className="text-xs font-semibold text-white">Solana</p>
                          <p className="text-[10px] text-slate-400 font-mono">8SExE819vJxK994nx</p>
                        </div>
                      </div>
                      <button onClick={() => copyText('8SExE819vJxK994nx')} className="text-slate-400 hover:text-white cursor-pointer text-xs">📋</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">Your Assets (Harry Bui)</h3>
                    <span className="text-[10px] text-emerald-400">● Live Pricing</span>
                  </div>
                  <div className="space-y-2.5">
                    {assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).map((asset, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-[#161821] rounded-2xl border border-slate-800">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0c0d10] flex items-center justify-center font-bold text-emerald-400 border border-slate-800">{asset.icon}</div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">{asset.name}</h4>
                            <p className="text-xs text-slate-400">{asset.amount} {asset.symbol} • <span className="text-slate-300">${asset.price.toLocaleString()}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">${(asset.amount * asset.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className={`text-xs font-medium ${asset.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{asset.change}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'trade' && (
              <div className="space-y-6 pt-2">
                <h3 className="text-lg font-bold text-white">Trade & Swap</h3>
                <div className="bg-[#161821] p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">You Pay (USD)</label>
                    <input type="number" value={tradeUsd} onChange={(e) => setTradeUsd(e.target.value)} className="w-full bg-[#0c0d10] border border-slate-800 rounded-2xl px-4 py-3.5 text-lg font-bold text-white focus:outline-none" />
                  </div>
                  <button onClick={() => alert("Trade executed!")} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-4 rounded-2xl cursor-pointer">
                    Confirm Trade
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'explore' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-white">Explore Markets</h3>
                <div className="bg-[#161821] p-4 rounded-2xl border border-slate-800 space-y-3">
                  {assets.map(a => (
                    <div key={a.symbol} className="flex justify-between items-center py-2 border-b border-slate-800/60">
                      <span className="text-xs font-semibold text-white">{a.name} ({a.symbol})</span>
                      <span className="text-xs text-emerald-400">${a.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Wallet Activity</h3>
                  <button onClick={logout} className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/20 cursor-pointer">Sign Out</button>
                </div>
                <div className="bg-[#161821] p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <div>
                      <p className="text-xs font-semibold text-white">Account Owner</p>
                      <p className="text-[11px] text-emerald-400">HARRY BUI (minhle20018)</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20">MPC Secure</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-slate-400">EVM Address</span>
                    <span className="text-xs text-slate-200 font-mono">0x71C...8492</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Navigation Bar */}
          <div className="absolute bottom-4 left-6 right-6 h-16 bg-[#161821]/95 backdrop-blur-xl border border-slate-800 rounded-3xl flex items-center justify-around px-4 shadow-2xl z-30">
            <button onClick={() => setActiveTab('home')} className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${activeTab === 'home' ? 'text-emerald-400' : 'text-slate-400'}`}>
              <span>🏠</span>
              <span className="text-[10px] mt-0.5">Home</span>
            </button>
            <button onClick={() => setActiveTab('trade')} className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${activeTab === 'trade' ? 'text-emerald-400' : 'text-slate-400'}`}>
              <span>📈</span>
              <span className="text-[10px] mt-0.5">Trade</span>
            </button>
            <button onClick={() => setActiveTab('explore')} className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${activeTab === 'explore' ? 'text-emerald-400' : 'text-slate-400'}`}>
              <span>🔍</span>
              <span className="text-[10px] mt-0.5">Explore</span>
            </button>
            <button onClick={() => setActiveTab('activity')} className={`p-2 cursor-pointer font-bold text-xs flex flex-col items-center ${activeTab === 'activity' ? 'text-emerald-400' : 'text-slate-400'}`}>
              <span>⏰</span>
              <span className="text-[10px] mt-0.5">Activity</span>
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}