import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { FamilyProfile } from '../types';
import {
  Users,
  UserPlus,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  Building,
  Shield,
  CreditCard,
  Layers,
  Edit2,
} from 'lucide-react';

const AVATAR_COLORS = [
  { name: 'Emerald', value: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  { name: 'Indigo', value: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30' },
  { name: 'Amber', value: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  { name: 'Purple', value: 'bg-purple-500/15 text-purple-700 border-purple-500/30' },
  { name: 'Rose', value: 'bg-rose-500/15 text-rose-700 border-rose-500/30' },
  { name: 'Cyan', value: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/30' },
];

export const FamilyProfileManagerModal: React.FC = () => {
  const {
    isFamilyModalOpen,
    setIsFamilyModalOpen,
    profiles,
    addProfile,
    deleteProfile,
    updateProfile,
    transactions,
    activeProfile,
    setActiveProfile,
  } = usePortfolio();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New member form fields
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Child');
  const [pan, setPan] = useState('');
  const [broker, setBroker] = useState('Zerodha Kite');
  const [dematAccountNo, setDematAccountNo] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[3].value);

  if (!isFamilyModalOpen) return null;

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Member name is required.');
      return;
    }

    addProfile({
      name: name.trim(),
      relation: relation.trim(),
      pan: pan.trim().toUpperCase() || 'ABCPS9999X',
      broker: broker.trim() || 'Direct Demat',
      avatarColor,
      dematAccountNo: dematAccountNo.trim(),
    });

    // Reset form
    setName('');
    setRelation('Child');
    setPan('');
    setDematAccountNo('');
    setIsAddingNew(false);
    setErrorMsg(null);
  };

  const handleConfirmDelete = (id: string) => {
    const result = deleteProfile(id);
    if (!result.success) {
      setErrorMsg(result.message || 'Could not delete profile.');
    } else {
      setDeleteConfirmId(null);
      setErrorMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Family Profiles & Demat Accounts</h2>
              <p className="text-xs text-zinc-500">
                Manage individual family member tax entities, brokers, and consolidated tracking
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsFamilyModalOpen(false);
              setIsAddingNew(false);
              setDeleteConfirmId(null);
              setErrorMsg(null);
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Registered Family Members ({profiles.length})
            </span>
            {!isAddingNew && (
              <button
                id="add-family-member-btn"
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Family Member</span>
              </button>
            )}
          </div>

          {/* Add New Member Form */}
          {isAddingNew && (
            <form onSubmit={handleCreateProfile} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-600" /> Register New Family Member
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Yadav"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Relationship</label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child (Son)">Child (Son)</option>
                    <option value="Child (Daughter)">Child (Daughter)</option>
                    <option value="Parent (Father)">Parent (Father)</option>
                    <option value="Parent (Mother)">Parent (Mother)</option>
                    <option value="HUF">HUF (Hindu Undivided Family)</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">PAN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. ABCPY1234F"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono uppercase text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Primary Broker / Platform</label>
                  <input
                    type="text"
                    placeholder="e.g. Zerodha / Groww / Upstox"
                    value={broker}
                    onChange={(e) => setBroker(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-medium mb-1">Demat / BO ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1208160098765432"
                    value={dematAccountNo}
                    onChange={(e) => setDematAccountNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-medium mb-1">Badge Color</label>
                  <div className="flex items-center gap-2">
                    {AVATAR_COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setAvatarColor(col.value)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${col.value} ${
                          avatarColor === col.value ? 'ring-2 ring-zinc-900 font-bold' : 'opacity-70'
                        }`}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  Save Member Profile
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-3">
            {profiles.map((p) => {
              const memberTxCount = transactions.filter((t) => t.profileId === p.id).length;
              const isCurrentActive = activeProfile === p.id;
              const isDeleting = deleteConfirmId === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrentActive
                      ? 'border-zinc-900 bg-zinc-50/60 shadow-xs'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                          p.avatarColor || 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-900">{p.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                            {p.relation}
                          </span>
                          {isCurrentActive && (
                            <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-full font-medium">
                              Active Lens
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Shield className="w-3 h-3 text-zinc-400" /> PAN: {p.pan || 'N/A'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-zinc-400" /> {p.broker || 'Broker'}
                          </span>
                          {p.dematAccountNo && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[11px]">Demat: {p.dematAccountNo}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-indigo-600 font-medium">{memberTxCount} trades</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveProfile(p.id);
                          setIsFamilyModalOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isCurrentActive
                            ? 'bg-zinc-900 text-white font-semibold'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {isCurrentActive ? 'Selected' : 'View Holdings'}
                      </button>

                      {profiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(isDeleting ? null : p.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Delete Confirmation */}
                  {isDeleting && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2 animate-in fade-in duration-100">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Confirm Deletion of {p.name}?</span>
                      </div>
                      <p className="text-rose-700 text-[11px]">
                        This member has <strong>{memberTxCount} logged trades</strong>. Deleting this profile will also delete its transaction history and open lots. This action is irreversible unless you have a JSON backup.
                      </p>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(p.id)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs"
                        >
                          Yes, Delete Member & Trades
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Educational Callout */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1.5">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Indian Family Wealth Sovereignty
            </div>
            <p className="leading-relaxed">
              Every family member retains their own separate PAN, Demat account, and capital gains tax brackets (STCG 20% / LTCG 12.5% with separate ₹1.25L exemption limits under Sec 112A). Use the Consolidated lens to view combined household wealth, or filter by member for individual tax returns and ITR-2 filing.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 flex justify-end">
          <button
            onClick={() => {
              setIsFamilyModalOpen(false);
              setIsAddingNew(false);
              setDeleteConfirmId(null);
            }}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
