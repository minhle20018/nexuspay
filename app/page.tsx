'use client';

import React, { useState } from 'react';

export default function Home() {
  const [balance, setBalance] = useState("10.0000");
  const [copied, setCopied] = useState(false);

  const walletAddress = "0x71C...38a9";

  const handleCopy = () => {
    navigator.clipboard.writeText("0x71C82938492834a9");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0c0d10] text-white flex flex-col items-center justify-center p-4">
      {/* Khung giao diện ví chính */}
      <div className="w-full max-w-md bg-[#161821] border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-emerald-950/20">
        
        {/* Header: Logo và tên thương hiệu */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="NexusPay Logo" 
              className="w-10 h-10 object-contain rounded-xl border border-emerald-500/20 shadow-md" 
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">NexusPay</h1>
              <p className="text-emerald-400 text-xs font-medium">Secured by MPC</p>
            </div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-semibold">
            Live on Render
          </div>
        </div>

        {/* Thông tin tài khoản & Địa chỉ ví */}
        <div className="bg-black/40 border border-slate-800/80 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs">HARRY BUI</p>
            <p className="text-sm font-mono text-slate-300 mt-0.5">{walletAddress}</p>
          </div>
          <button 
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Số dư tài sản */}
        <div className="text-center my-8">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Portfolio Balance</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-1">
            {balance} <span className="text-emerald-400 text-2xl">BTC</span>
          </h2>
          <p className="text-emerald-500 text-xs font-semibold">
            +5.42% ($684,210.50 USD)
          </p>
        </div>

        {/* Nút thao tác nhanh */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/10 text-sm cursor-pointer">
            Send Asset
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition text-sm cursor-pointer">
            Receive
          </button>
        </div>

        {/* Footer trạng thái hệ thống */}
        <div className="text-center border-t border-slate-800/80 pt-4">
          <p className="text-slate-500 text-xs">
            High-End Web3 Fintech Infrastructure
          </p>
        </div>

      </div>
    </main>
  );
}