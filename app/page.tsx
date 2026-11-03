'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [inputUser, setInputUser] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeUsd, setTradeUsd] = useState('1000');
  const [tradeCoin, setTradeCoin] = useState('BTC');

  const [assets, setAssets] = useState([
    { symbol: 'BTC', name: 'Bitcoin', price: 77920.00, change: '+2.4%', amount: 10.0, icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', price: 2290.00, change: '+1.8%', amount: 1748.17, icon: 'Ξ' },
    { symbol: 'SOL', name: 'Solana', price: 97.00, change: '-0.5%', amount: 12.5, icon: '◎' },
    { symbol: 'BNB', name: 'BNB', price: 705.00, change: '+3.1%', amount: 1.2, icon: 'B' },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00, change: '0.0%', amount: 448.60, icon: '$' }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) setCurrentUser(savedUser);

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

  const handleAuth = () => {
    const usernameToUse = inputUser.trim() || "harrybui";
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setErrorMsg('');
    setCurrentUser(usernameToUse);
    localStorage.setItem('nexus_user', usernameToUse);
  };

  const logout = () => {
    localStorage.removeItem('nexus_user');
    setCurrentUser(null);
    setPassword('');
    setInputUser('');
  };

  const calculateTotal = () => {
    return assets.reduce((acc, item) => acc + (item.amount * item.price), 0);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard: " + text);
  };

  return (
    <main className="min-h-screen bg-black text-slate-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-[414px] h-screen sm:h-[896px] bg-[#0c0d10] sm:rounded-[48px] sm:border-[8px] sm:border-[#1a1c23] shadow-2xl flex flex-col overflow-hidden relative">

        {!currentUser ? (
          <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto z-20 bg-[#0c0d10]">
            <div className="pt-12">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-xl" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">NexusPay</h1>
              <p className="text-slate-400 text-sm">Smart Web3 wallet with institutional-grade MPC security & Live Market Feed.</p>
            </div>

            <div className="space-y-4 my-auto">
              <div className="flex bg-[#161821] p-1 rounded-2xl mb-4 border border-slate-800">
                <button onClick={() => setIsSignUp(false)} className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${!isSignUp ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400'}`}>Sign In</button>
                <button onClick={() => setIsSignUp(true)} className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${isSignUp ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400'}`}>Create Wallet</button>
              </div>

              {errorMsg && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs">{errorMsg}</div>}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Username / Email</label>
                <input 
                  type="text" 
                  value={inputUser} 
                  onChange={(e) => setInputUser(e.target.value)} 
                  placeholder="Enter your username..." 
                  className="w-full bg-[#161821] border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password (min 6 chars)</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-[#161821] border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <button onClick={handleAuth} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 mt-2 cursor-pointer">
                {isSignUp ? "Create New Wallet" : "Unlock Wallet"}
              </button>
            </div>

            <div className="text-center pb-6">
              <p className="text-[11px] text-slate-500">No complex seed phrase required.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden relative bg-[#0c0d10]">
            
            <div className="px-6 pt-10 pb-4 flex items-center justify-between bg-[#0c0d10]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm uppercase">
                  {currentUser.substring(0, 2)}
                </div>
                <div>
                  <span className="text-base font-bold text-white tracking-tight capitalize">{currentUser}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-2 animate-ping"></span>
                </div>
              </div>
              <button onClick={logout} className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 cursor-pointer">Sign Out</button>
            </div>

            <div className="flex-1 overflow-y-auto pb-32 px-6 space-y-6">
              
              {activeTab === 'home' && (
                <div className="space-y-6">
                  <div className="text-center py-2">
                    <h2 className="text-4xl font-extrabold tracking-tight text-white">
                      ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p className="text-xs text-emerald-400 font-medium mt-1">Wallet 1 (Live Feed Active)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => alert("Deposit successful!")} className="flex flex-col items-center justify-center py-4 px-5 rounded-2xl bg-[#161821] border border-slate-800 hover:bg-[#1f222e] cursor-pointer">
                      <span className="text-emerald-400 font-bold text-lg mb-1">+</span>
                      <span className="text-sm font-semibold text-white">Deposit</span>
                    </button>
                    <button onClick={() => copyText("0x71C84922b9183Ea482b")} className="flex flex-col items-center justify-center py-4 px-5 rounded-2xl bg-[#161821] border border-slate-800 hover:bg-[#1f222e] cursor-pointer">
                      <span className="text-sky-400 font-bold text-lg mb-1">↓</span>
                      <span className="text-sm font-semibold text-white">Receive</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input type="text" placeholder="Search Assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#161821] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white">Your Assets</h3>
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
                            <p className="text-sm font-semibold text-white">${(asset.amount * asset.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
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
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Receive Coin</label>
                      <select value={tradeCoin} onChange={(e) => setTradeCoin(e.target.value)} className="w-full bg-[#0c0d10] text-xs font-semibold px-4 py-3.5 rounded-2xl border border-slate-800 text-white focus:outline-none">
                        {assets.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                      </select>
                    </div>
                    <button onClick={() => alert("Trade executed successfully!")} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer">
                      Confirm Trade
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'explore' && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-bold text-white">Explore Markets</h3>
                  <div className="bg-[#161821] p-4 rounded-2xl border border-slate-800 space-y-3">
                    <p className="text-xs font-bold text-slate-400">Trending Live Feed</p>
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
                  <h3 className="text-lg font-bold text-white">Wallet Activity</h3>
                  <div className="bg-[#161821] p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                      <div>
                        <p className="text-xs font-semibold text-white">Account Owner</p>
                        <p className="text-[11px] text-emerald-400 capitalize">{currentUser} (MPC Secure)</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20">Active</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="absolute bottom-4 left-6 right-6 h-16 bg-[#161821]/90 backdrop-blur-xl border border-slate-800 rounded-3xl flex items-center justify-around px-4 shadow-2xl z-30">
              <button onClick={() => setActiveTab('home')} className={`p-2 cursor-pointer ${activeTab === 'home' ? 'text-emerald-400' : 'text-slate-400'}`}>Home</button>
              <button onClick={() => setActiveTab('trade')} className={`p-2 cursor-pointer ${activeTab === 'trade' ? 'text-emerald-400' : 'text-slate-400'}`}>Trade</button>
              <button onClick={() => setActiveTab('explore')} className={`p-2 cursor-pointer ${activeTab === 'explore' ? 'text-emerald-400' : 'text-slate-400'}`}>Explore</button>
              <button onClick={() => setActiveTab('activity')} className={`p-2 cursor-pointer ${activeTab === 'activity' ? 'text-emerald-400' : 'text-slate-400'}`}>Activity</button>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}