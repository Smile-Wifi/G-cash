import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Wallet, Mail, Lock, Phone, User, Fingerprint, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    const enabled = localStorage.getItem('biometrics_enabled') === 'true';
    const savedEmail = localStorage.getItem('saved_email');
    if (enabled && savedEmail) {
      setBiometricsEnabled(true);
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName });
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email,
          phoneNumber,
          displayName,
          balance: 0,
          role: 'user',
          createdAt: serverTimestamp(),
        });
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('saved_email', email);
        // In a real app, we'd use a secure token. For simulation, we'll store the password if they enable biometrics later.
        toast.success("Logged in successfully!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = () => {
    setIsScanning(true);
    setTimeout(async () => {
      const savedPassword = localStorage.getItem('saved_password');
      if (savedPassword) {
        try {
          await signInWithEmailAndPassword(auth, email, savedPassword);
          toast.success("Biometric login successful!");
          setIsScanning(false);
          setShowBiometric(false);
        } catch (error: any) {
          toast.error("Biometric authentication failed. Please use password.");
          setIsScanning(false);
          setShowBiometric(false);
        }
      } else {
        toast.error("Biometric data not found. Please login with password first.");
        setIsScanning(false);
        setShowBiometric(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-600 p-6 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-30"></div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-blue-100 p-4 rounded-2xl mb-4"
          >
            <Wallet className="text-blue-600" size={40} />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">G-Wallet</h1>
          <p className="text-gray-500 text-sm">Your digital wallet companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        {!isRegister && biometricsEnabled && (
          <div className="mt-4">
            <button
              onClick={() => setShowBiometric(true)}
              className="w-full py-3 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <Fingerprint size={20} className="text-blue-600" />
              Login with Biometrics
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 font-medium hover:underline text-sm"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showBiometric && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xs rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl"
            >
              <div className="w-full flex justify-end mb-2">
                <button onClick={() => setShowBiometric(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="relative mb-6">
                <div className={`p-6 rounded-full ${isScanning ? 'bg-blue-50' : 'bg-gray-50'} transition-colors`}>
                  <Fingerprint size={64} className={`${isScanning ? 'text-blue-600' : 'text-gray-300'} transition-colors`} />
                </div>
                {isScanning && (
                  <motion.div 
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10"
                  />
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isScanning ? 'Scanning...' : 'Biometric Login'}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {isScanning ? 'Please hold your finger on the sensor' : 'Confirm your identity to continue'}
              </p>

              {!isScanning && (
                <button
                  onClick={handleBiometricLogin}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Start Scan
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
