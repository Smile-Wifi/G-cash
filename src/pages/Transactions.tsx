import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth.tsx';
import { Send, Plus, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function Transactions() {
  const { transactions, loading } = useWallet();
  const { profile } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600">
          <Filter size={20} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search transactions..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => {
          const isSender = tx.senderId === profile?.uid;
          const date = tx.timestamp?.seconds ? new Date(tx.timestamp.seconds * 1000) : new Date();
          
          return (
            <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isSender ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {isSender ? <Send size={24} /> : <Plus size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {tx.type === 'cash-in' ? 'Cash In' : 
                     isSender ? `Sent to ${tx.receiverName || 'User'}` : `Received from ${tx.senderName || 'User'}`}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {format(date, 'MMM dd, yyyy • hh:mm a')}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">
                    Ref: {tx.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold text-lg ${isSender ? 'text-red-600' : 'text-green-600'}`}>
                  {isSender ? '-' : '+'} ₱{tx.amount.toLocaleString()}
                </span>
                <p className="text-[10px] text-green-500 font-bold uppercase mt-1">Success</p>
              </div>
            </div>
          );
        })}
        {transactions.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="text-gray-400" size={32} />
            </div>
            <h3 className="text-gray-900 font-bold">No transactions found</h3>
            <p className="text-gray-500 text-sm">Start using your wallet to see history</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { History } from 'lucide-react';
