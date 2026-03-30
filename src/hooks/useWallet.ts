import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth.tsx';

export interface Transaction {
  id: string;
  senderId?: string;
  receiverId?: string;
  amount: number;
  type: 'send' | 'receive' | 'cash-in' | 'cash-out' | 'payment';
  status: 'success' | 'pending' | 'failed';
  timestamp: any;
  description?: string;
  senderName?: string;
  receiverName?: string;
}

export function useWallet() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const createNotification = async (userId: string, title: string, message: string, type: 'transaction' | 'security' | 'system' = 'transaction') => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('senderId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const q2 = query(
      collection(db, 'transactions'),
      where('receiverId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsub1 = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(prev => {
        const other = prev.filter(t => t.receiverId === user.uid);
        return [...txs, ...other].sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      });
      setLoading(false);
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(prev => {
        const other = prev.filter(t => t.senderId === user.uid);
        return [...txs, ...other].sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      });
      setLoading(false);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const sendMoney = async (recipientId: string, amount: number, description: string = "") => {
    if (!user || !profile || profile.balance < amount) throw new Error("Insufficient balance");

    const recipientDoc = await getDoc(doc(db, 'users', recipientId));
    if (!recipientDoc.exists()) throw new Error("Recipient not found");

    const txData = {
      senderId: user.uid,
      receiverId: recipientId,
      amount,
      type: 'send',
      status: 'success',
      timestamp: serverTimestamp(),
      description,
      senderName: profile.displayName || profile.email,
      receiverName: recipientDoc.data().displayName || recipientDoc.data().email
    };

    await addDoc(collection(db, 'transactions'), txData);
    await updateDoc(doc(db, 'users', user.uid), { balance: increment(-amount) });
    await updateDoc(doc(db, 'users', recipientId), { balance: increment(amount) });

    // Create notifications for both sender and receiver
    await createNotification(user.uid, "Money Sent", `You have successfully sent ₱${amount.toLocaleString()} to ${txData.receiverName}.`, 'transaction');
    await createNotification(recipientId, "Money Received", `You have received ₱${amount.toLocaleString()} from ${txData.senderName}.`, 'transaction');
  };

  const cashIn = async (amount: number) => {
    if (!user) return;
    await addDoc(collection(db, 'transactions'), {
      receiverId: user.uid,
      amount,
      type: 'cash-in',
      status: 'success',
      timestamp: serverTimestamp(),
      description: 'Cash In'
    });
    await updateDoc(doc(db, 'users', user.uid), { balance: increment(amount) });

    await createNotification(user.uid, "Cash In Successful", `You have successfully added ₱${amount.toLocaleString()} to your wallet.`, 'transaction');
  };

  return { transactions, loading, sendMoney, cashIn };
}
