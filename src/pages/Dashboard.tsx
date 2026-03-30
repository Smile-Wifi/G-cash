import { useAuth } from '../hooks/useAuth.tsx';
import { useWallet } from '../hooks/useWallet';
import { useNotifications } from '../hooks/useNotifications';
import { Send, Plus, CreditCard, ShoppingBag, Phone, ChevronRight, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useAuth();
  const { transactions, cashIn } = useWallet();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const quickActions = [
    { icon: Send, label: 'Send', color: 'bg-blue-100 text-blue-600', path: '/scan' },
    { icon: Plus, label: 'Cash In', color: 'bg-green-100 text-green-600', action: () => cashIn(500) },
    { icon: CreditCard, label: 'Bills', color: 'bg-orange-100 text-orange-600' },
    { icon: Phone, label: 'Load', color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-500 text-sm">Hello,</h2>
          <h1 className="text-xl font-bold text-gray-900">{profile?.displayName || 'User'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {profile?.displayName?.[0] || 'U'}
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <p className="text-blue-100 text-sm mb-1">Available Balance</p>
          <h2 className="text-3xl font-bold">₱ {profile?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          <div className="mt-4 flex gap-2">
            <span className="bg-blue-500/30 px-3 py-1 rounded-full text-xs font-medium">GCash Fully Verified</span>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            {action.path ? (
              <Link to={action.path} className={`${action.color} p-4 rounded-2xl transition-transform active:scale-95`}>
                <action.icon size={24} />
              </Link>
            ) : (
              <button 
                onClick={action.action}
                className={`${action.color} p-4 rounded-2xl transition-transform active:scale-95`}
              >
                <action.icon size={24} />
              </button>
            )}
            <span className="text-[11px] font-medium text-gray-600">{action.label}</span>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
          <Link to="/transactions" className="text-blue-600 text-sm font-medium flex items-center">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="space-y-3">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${tx.type === 'send' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {tx.type === 'send' ? <Send size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    {tx.type === 'send' ? `Sent to ${tx.receiverName || 'User'}` : 
                     tx.type === 'cash-in' ? 'Cash In' : `Received from ${tx.senderName || 'User'}`}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {tx.timestamp?.seconds ? new Date(tx.timestamp.seconds * 1000).toLocaleDateString() : 'Pending'}
                  </p>
                </div>
              </div>
              <span className={`font-bold text-sm ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                {tx.type === 'send' ? '-' : '+'} ₱{tx.amount.toLocaleString()}
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm italic">
              No transactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
