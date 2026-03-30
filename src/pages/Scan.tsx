import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QrScanner from 'react-qr-scanner';
import { useAuth } from '../hooks/useAuth.tsx';
import { useWallet } from '../hooks/useWallet';
import { X, QrCode, Scan as ScanIcon, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function Scan() {
  const { profile } = useAuth();
  const { sendMoney } = useWallet();
  const [mode, setMode] = useState<'scan' | 'receive' | 'send'>('scan');
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = (data: any) => {
    if (data) {
      try {
        const result = JSON.parse(data.text);
        if (result.uid) {
          setRecipientId(result.uid);
          setMode('send');
        }
      } catch (e) {
        // If not JSON, assume it's just the UID
        setRecipientId(data.text);
        setMode('send');
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendMoney(recipientId, parseFloat(amount));
      toast.success("Money sent successfully!");
      setMode('scan');
      setRecipientId('');
      setAmount('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => setMode('scan')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${mode === 'scan' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
        >
          <ScanIcon size={20} /> Scan
        </button>
        <button 
          onClick={() => setMode('receive')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${mode === 'receive' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
        >
          <QrCode size={20} /> Receive
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'scan' && (
          <motion.div 
            key="scan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="aspect-square bg-black rounded-3xl overflow-hidden relative border-4 border-blue-600">
              <QrScanner
                delay={300}
                onError={(err: any) => console.error(err)}
                onScan={handleScan}
                style={{ width: '100%' }}
              />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/50 rounded-2xl"></div>
            </div>
            <p className="text-center text-gray-500 text-sm">Align QR code within the frame to scan</p>
          </motion.div>
        )}

        {mode === 'receive' && (
          <motion.div 
            key="receive"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center space-y-6"
          >
            <div className="bg-blue-50 p-4 rounded-2xl">
              <QRCodeSVG 
                value={JSON.stringify({ uid: profile?.uid, name: profile?.displayName })} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-900">{profile?.displayName}</h3>
              <p className="text-gray-500 text-sm">{profile?.phoneNumber}</p>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Scan to pay me</p>
          </motion.div>
        )}

        {mode === 'send' && (
          <motion.div 
            key="send"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Send Money</h3>
              <button onClick={() => setMode('scan')} className="text-gray-400"><X size={24} /></button>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                R
              </div>
              <div>
                <p className="text-[10px] text-blue-600 font-bold uppercase">Recipient ID</p>
                <p className="font-medium text-gray-900 truncate w-40">{recipientId}</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Amount to Send</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₱</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send size={20} /> {loading ? 'Sending...' : 'Send Now'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
