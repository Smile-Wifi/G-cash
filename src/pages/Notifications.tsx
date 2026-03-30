import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Check, Trash2, Shield, Info, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function Notifications() {
  const { notifications, loading, markAsRead, deleteNotification } = useNotifications();

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  const getIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <CreditCard className="text-blue-600" size={20} />;
      case 'security': return <Shield className="text-red-600" size={20} />;
      default: return <Info className="text-gray-600" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
          {notifications.filter(n => !n.read).length} New
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-4 rounded-2xl shadow-sm border transition-colors ${n.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
            >
              <div className="flex gap-4">
                <div className={`p-2 rounded-xl h-fit ${n.read ? 'bg-gray-50' : 'bg-white'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-sm ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h4>
                    <span className="text-[10px] text-gray-400">
                      {n.timestamp?.seconds ? format(new Date(n.timestamp.seconds * 1000), 'hh:mm a') : 'Just now'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${n.read ? 'text-gray-500' : 'text-gray-700'}`}>{n.message}</p>
                  
                  <div className="flex gap-4 mt-3">
                    {!n.read && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wider"
                      >
                        <Check size={12} /> Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider hover:text-red-500"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400" size={32} />
            </div>
            <h3 className="text-gray-900 font-bold">No notifications</h3>
            <p className="text-gray-500 text-sm">We'll notify you when something happens</p>
          </div>
        )}
      </div>
    </div>
  );
}
