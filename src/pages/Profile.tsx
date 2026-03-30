import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { LogOut, User, Phone, Mail, Shield, ChevronRight, Settings, HelpCircle, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { profile } = useAuth();
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    const enabled = localStorage.getItem('biometrics_enabled') === 'true';
    setBiometricsEnabled(enabled);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleBiometrics = () => {
    const newState = !biometricsEnabled;
    if (newState) {
      const password = prompt("Please enter your password to enable biometrics (Simulation):");
      if (password) {
        localStorage.setItem('biometrics_enabled', 'true');
        localStorage.setItem('saved_password', password);
        localStorage.setItem('saved_email', profile?.email || '');
        setBiometricsEnabled(true);
        toast.success("Biometric login enabled!");
      }
    } else {
      localStorage.removeItem('biometrics_enabled');
      localStorage.removeItem('saved_password');
      setBiometricsEnabled(false);
      toast.success("Biometric login disabled");
    }
  };

  const menuItems = [
    { icon: Shield, label: 'Security & Privacy', color: 'text-green-600' },
    { icon: Settings, label: 'Settings', color: 'text-gray-600' },
    { icon: HelpCircle, label: 'Help Center', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg shadow-blue-100">
          {profile?.displayName?.[0] || 'U'}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{profile?.displayName || 'User'}</h2>
        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-1">Fully Verified</p>
      </div>

      {/* Biometrics Toggle */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Fingerprint size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Biometric Login</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Fingerprint or Face ID</p>
            </div>
          </div>
          <button 
            onClick={toggleBiometrics}
            className={`w-12 h-6 rounded-full transition-colors relative ${biometricsEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${biometricsEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Info List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Phone size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Mobile Number</p>
            <p className="font-medium text-gray-900">{profile?.phoneNumber}</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Mail size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
            <p className="font-medium text-gray-900">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {menuItems.map((item, i) => (
          <button 
            key={i}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 bg-gray-50 ${item.color} rounded-xl`}>
                <item.icon size={20} />
              </div>
              <span className="font-medium text-gray-700">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
      >
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
}
