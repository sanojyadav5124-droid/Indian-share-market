import React, { useMemo, useState } from 'react';
import {
  ReceiptText,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Coins,
  Calendar,
  Layers,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProfileId, TransactionType } from '../types';
import { formatINR } from '../utils/formatters';

export const TransactionLedgerView: React.FC = () => {
  const {
    transactions,
    deleteTransaction,
    setIsAddTxModalOpen,
    activeProfile,
    profiles,
  } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterProfile, setFilterProfile] = useState<string>(activeProfile === 'consolidated' ? 'ALL' : activeProfile);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch =
          t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'ALL' || t.type === filterType;
        const matchesProfile = filterProfile === 'ALL' || t.profileId === filterProfile;

        return matchesSearch && matchesType && matchesProfile;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id.localeCompare(a.id));
  }, [transactions, searchQuery, filterType, filterProfile]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalDividends = 0;
    let totalBuys = 0;
    let totalSells = 0;
    let totalCharges = 0;

    for (const t of filteredTransactions) {
      totalCharges += t.charges?.total || 0;
      if (t.type === 'DIVIDEND') totalDividends += t.quantity * t.price;
      if (t.type === 'BUY') totalBuys += t.quantity * t.price;
      if (t.type === 'SELL') totalSells += t.quantity * t.price;
    }

    return { totalDividends, totalBuys, totalSells, totalCharges, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const getTypeBadge = (type: TransactionType, ratio?: string) => {
    switch (type) {
      case 'BUY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            BUY
          </span>
        );
      case 'SELL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            SELL
          </span>
        );
      case 'DIVIDEND':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            DIVIDEND
          </span>
        );
      case 'BONUS':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            BONUS {ratio ? `(${ratio})` : ''}
          </span>
        );
      case 'SPLIT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            SPLIT {ratio ? `(${ratio})` : ''}
          </span>
        );
      case 'DEMERGER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            DEMERGER
          </span>
        );
      case 'CASH_DEPOSIT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            DEPOSIT
          </span>
        );
      case 'CASH_WITHDRAW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            WITHDRAW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Transaction Ledger</h1>
            <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">
              {transactions.length} Total Records
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Complete audit trail of all buy, sell, corporate actions, dividends, and cash movements.
          </p>
        </div>

        <button
          id="ledger-log-trade-btn"
          onClick={() => setIsAddTxModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Record New Transaction</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500">Filtered Trades</span>
          <div className="text-lg font-bold text-zinc-900 mt-1">{stats.count}</div>
          <div className="text-[11px] text-zinc-400">Total logged orders</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500">Dividends Logged</span>
          <div className="text-lg font-bold text-emerald-700 mt-1">
            {formatINR(stats.totalDividends)}
          </div>
          <div className="text-[11px] text-zinc-400">Credited to cash ledger</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500">Gross Buy Volume</span>
          <div className="text-lg font-bold text-zinc-900 mt-1">{formatINR(stats.totalBuys)}</div>
          <div className="text-[11px] text-zinc-400">Total capital deployed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500">Statutory Charges</span>
          <div className="text-lg font-bold text-zinc-800 mt-1">
            {formatINR(stats.totalCharges)}
          </div>
          <div className="text-[11px] text-zinc-400">STT, Stamp Duty, GST, Exch</div>
        </div>
      </div>

      {/* Filters Bar & Ledger Table */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-transactions-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scrip, symbol, or notes..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800"
            />
          </div>

          {/* Type & Profile Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none"
            >
              <option value="ALL">All Action Types</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
              <option value="DIVIDEND">DIVIDEND</option>
              <option value="BONUS">BONUS</option>
              <option value="SPLIT">SPLIT</option>
              <option value="DEMERGER">DEMERGER</option>
              <option value="CASH_DEPOSIT">CASH DEPOSIT</option>
              <option value="CASH_WITHDRAW">CASH WITHDRAW</option>
            </select>

            <select
              value={filterProfile}
              onChange={(e) => setFilterProfile(e.target.value)}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none"
            >
              <option value="ALL">All Family Profiles</option>
              <option value="self">Arjun (Self)</option>
              <option value="spouse">Pooja (Spouse)</option>
              <option value="parent">Ramesh (Parent)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 font-medium bg-zinc-50/60">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Profile</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Symbol & Description</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3 text-right">Price (₹)</th>
                <th className="py-3 px-3 text-right">Charges</th>
                <th className="py-3 px-3 text-right">Net Value</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800 font-mono">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => {
                  const gross = t.quantity * t.price;
                  const net =
                    t.type === 'BUY'
                      ? gross + (t.charges?.total || 0)
                      : t.type === 'SELL'
                      ? gross - (t.charges?.total || 0)
                      : gross;

                  const profileObj = profiles.find((p) => p.id === t.profileId);

                  return (
                    <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-zinc-600 font-sans">
                        {t.date}
                      </td>

                      {/* Profile */}
                      <td className="py-3 px-3 font-sans whitespace-nowrap">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            t.profileId === 'self'
                              ? 'bg-emerald-50 text-emerald-700'
                              : t.profileId === 'spouse'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {profileObj?.name.split(' ')[0]}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3 whitespace-nowrap font-sans">
                        {getTypeBadge(t.type, t.ratio)}
                      </td>

                      {/* Symbol & Name */}
                      <td className="py-3 px-3">
                        <div className="font-sans font-semibold text-zinc-900 text-xs">
                          {t.symbol}
                        </div>
                        <div className="font-sans text-[11px] text-zinc-400 truncate max-w-[160px]">
                          {t.name}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right font-medium">
                        {t.type === 'CASH_DEPOSIT' || t.type === 'CASH_WITHDRAW'
                          ? '-'
                          : t.quantity}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right">
                        {formatINR(t.price)}
                      </td>

                      {/* Charges */}
                      <td className="py-3 px-3 text-right text-zinc-500 font-sans">
                        {t.charges?.total > 0 ? (
                          <span title={`STT: ₹${t.charges.stt}, Stamp: ₹${t.charges.stampDuty}, Exch: ₹${t.charges.exchangeCharges}, GST: ₹${t.charges.gstAndBrokerage}`}>
                            {formatINR(t.charges.total)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Net Value */}
                      <td className="py-3 px-3 text-right font-semibold text-zinc-900">
                        {formatINR(net)}
                      </td>

                      {/* Notes & Cash routing */}
                      <td className="py-3 px-3 font-sans text-[11px] text-zinc-500 max-w-[150px] truncate">
                        {t.notes || '-'}
                        {t.useCashBalance && (
                          <span className="block text-[9px] text-indigo-600 font-medium">
                            • Routed via cash
                          </span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-3 text-center">
                        <button
                          id={`delete-tx-${t.id}-btn`}
                          onClick={() => {
                            if (window.confirm(`Delete transaction for ${t.symbol}?`)) {
                              deleteTransaction(t.id);
                            }
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-400 font-sans">
                    No transactions match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
