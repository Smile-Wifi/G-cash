import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Users, CreditCard, TrendingUp, Search, Ban, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0, totalTransactions: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const txSnap = await getDocs(collection(db, 'transactions'));
      
      const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
      
      const totalBalance = usersList.reduce((acc, user: any) => acc + (user.balance || 0), 0);
      setStats({
        totalUsers: usersList.length,
        totalBalance,
        totalTransactions: txSnap.size
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const adjustBalance = async (userId: string, amount: number, type: 'add' | 'deduct') => {
    try {
      const finalAmount = type === 'add' ? amount : -amount;
      await updateDoc(doc(db, 'users', userId), {
        balance: increment(finalAmount)
      });
      
      await addDoc(collection(db, 'transactions'), {
        receiverId: type === 'add' ? userId : 'system',
        senderId: type === 'add' ? 'system' : userId,
        amount,
        type: type === 'add' ? 'cash-in' : 'cash-out',
        status: 'success',
        timestamp: serverTimestamp(),
        description: `Admin Adjustment (${type})`
      });

      // Create notification for the user
      await addDoc(collection(db, 'notifications'), {
        userId,
        title: type === 'add' ? "Funds Added by Admin" : "Funds Deducted by Admin",
        message: `An administrator has ${type === 'add' ? 'added' : 'deducted'} ₱${amount.toLocaleString()} ${type === 'add' ? 'to' : 'from'} your wallet.`,
        type: 'system',
        read: false,
        timestamp: serverTimestamp(),
      });

      toast.success(`Balance ${type === 'add' ? 'added' : 'deducted'} successfully`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <Users className="text-blue-600 mb-2" size={20} />
          <p className="text-[10px] text-gray-400 font-bold uppercase">Users</p>
          <p className="text-lg font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <CreditCard className="text-green-600 mb-2" size={20} />
          <p className="text-[10px] text-gray-400 font-bold uppercase">Volume</p>
          <p className="text-lg font-bold text-gray-900">₱{stats.totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <TrendingUp className="text-orange-600 mb-2" size={20} />
          <p className="text-[10px] text-gray-400 font-bold uppercase">TXs</p>
          <p className="text-lg font-bold text-gray-900">{stats.totalTransactions}</p>
        </div>
      </div>

      {/* User Management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900">User Management</h3>
          <div className="relative w-48">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{user.displayName || 'No Name'}</h4>
                  <p className="text-[10px] text-gray-400">{user.email}</p>
                  <p className="text-[10px] text-gray-400">{user.phoneNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-600">₱{user.balance?.toLocaleString()}</p>
                  <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                    {user.role}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button 
                  onClick={() => adjustBalance(user.id, 100, 'add')}
                  className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Plus size={12} /> Add 100
                </button>
                <button 
                  onClick={() => adjustBalance(user.id, 100, 'deduct')}
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Minus size={12} /> Sub 100
                </button>
                <button className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                  <Ban size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
