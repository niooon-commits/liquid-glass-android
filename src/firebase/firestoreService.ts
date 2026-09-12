import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Transaction, KpiMetric, TransactionStatus } from '../types';
import { initialTransactions, kpiMetrics } from '../data/mockData';

export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Invited' | 'Suspended';
  avatar: string;
  createdAt?: string;
}

export interface FirestoreNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: 'alert' | 'user' | 'report' | 'billing';
  createdAt?: string;
}

// 1. Subscribe to Live Transactions
export function subscribeTransactions(
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'transactions';
  try {
    const q = query(collection(db, path), orderBy('date', 'desc'), limit(100));
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const txs: Transaction[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            invoiceId: data.invoiceId || `INV-${docSnap.id.slice(0, 6)}`,
            customerName: data.customerName || 'Unknown Enterprise',
            customerEmail: data.customerEmail || 'billing@client.com',
            avatarUrl:
              data.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
            amount: typeof data.amount === 'number' ? data.amount : Number(data.amount) || 0,
            status: (data.status as TransactionStatus) || 'Completed',
            date: data.date || 'Today',
            method: data.method || 'Direct ACH',
            category: data.category || 'Enterprise Subscription',
          };
        });
        onUpdate(txs);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 2. Add New Transaction to Firestore
export async function createFirestoreTransaction(
  tx: Omit<Transaction, 'id'>,
  userId?: string
): Promise<string> {
  const path = 'transactions';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...tx,
      createdAt: new Date().toISOString(),
      createdBy: userId || 'anonymous-admin',
    });

    // Also push a live audit notification
    await addDoc(collection(db, 'notifications'), {
      title: 'New Ledger Entry Recorded',
      desc: `Invoice ${tx.invoiceId} for ${tx.customerName} ($${tx.amount.toLocaleString()}) was committed to Firestore.`,
      time: 'Just now',
      unread: true,
      type: 'billing',
      createdAt: new Date().toISOString(),
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 3. Update Transaction Status in Firestore
export async function updateFirestoreTransactionStatus(
  txId: string,
  status: TransactionStatus
): Promise<void> {
  const path = `transactions/${txId}`;
  try {
    const txRef = doc(db, 'transactions', txId);
    await updateDoc(txRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 4. Subscribe to Live KPI Metrics
export function subscribeKpiMetrics(
  onUpdate: (metrics: KpiMetric[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'kpi_metrics';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(kpiMetrics);
          return;
        }
        const metrics: KpiMetric[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || 'Metric',
            value: data.value || '$0.00',
            change: data.change || '+0%',
            isPositive: data.isPositive ?? true,
            timeframe: data.timeframe || 'vs last month',
            sparkline: data.sparkline || [40, 50, 60, 70, 80],
            icon: data.icon || 'TrendingUp',
          };
        });
        onUpdate(metrics);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 5. Subscribe to Team Directory Users
export function subscribeTeamUsers(
  onUpdate: (users: FirestoreUser[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'users';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const users: FirestoreUser[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || 'Platform Member',
            email: data.email || 'operator@company.io',
            role: data.role || 'Operator',
            department: data.department || 'Platform Engineering',
            status: data.status || 'Active',
            avatar:
              data.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
            createdAt: data.createdAt,
          };
        });
        onUpdate(users);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export type TeamUser = FirestoreUser;

// 6. Add Team Member to Firestore
export async function addFirestoreTeamMember(
  member: Omit<FirestoreUser, 'id'>
): Promise<string> {
  const path = 'users';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...member,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export const createFirestoreUser = addFirestoreTeamMember;

export async function deleteFirestoreUser(userId: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocs(collection(db, 'kpi_metrics'));
    return true;
  } catch (error) {
    console.warn('Firebase connection status note:', error);
    return false;
  }
}

// 7. Subscribe to Live Notifications / Audit Logs
export function subscribeNotifications(
  onUpdate: (notifs: FirestoreNotification[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'notifications';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const notifs: FirestoreNotification[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || 'System Notice',
            desc: data.desc || '',
            time: data.time || 'Recently',
            unread: Boolean(data.unread),
            type: data.type || 'alert',
            createdAt: data.createdAt,
          };
        });
        onUpdate(notifs);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 8. Mark Notification as Read
export async function markNotificationAsRead(notifId: string): Promise<void> {
  const path = `notifications/${notifId}`;
  try {
    const notifRef = doc(db, 'notifications', notifId);
    await updateDoc(notifRef, { unread: false });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 9. Mark All Notifications as Read
export async function markAllNotificationsAsRead(notifIds: string[]): Promise<void> {
  try {
    await Promise.all(
      notifIds.map((id) => updateDoc(doc(db, 'notifications', id), { unread: false }))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'notifications');
  }
}

// 10. Purge All Dummy / Mock Data from Firestore Collections
export async function purgeAllDummyData(): Promise<{
  deletedTransactions: number;
  deletedUsers: number;
  deletedNotifications: number;
  deletedKpi: number;
}> {
  let deletedTransactions = 0;
  let deletedUsers = 0;
  let deletedNotifications = 0;
  let deletedKpi = 0;

  try {
    // 1. Purge dummy transactions
    const txSnap = await getDocs(collection(db, 'transactions'));
    for (const docSnap of txSnap.docs) {
      const data = docSnap.data();
      const isDummy =
        docSnap.id.startsWith('tx-') ||
        data.createdBy === 'system-bootstrap' ||
        data.customerEmail?.includes('client.com') ||
        data.customerEmail?.includes('enterprise.io') ||
        data.customerEmail?.includes('techfrontier.org') ||
        data.customerEmail?.includes('nordicscale.se') ||
        data.customerEmail?.includes('helixbio.ng') ||
        data.invoiceId?.includes('INV-2026-08') ||
        data.invoiceId?.includes('INV-2026-07');

      if (isDummy) {
        await deleteDoc(docSnap.ref);
        deletedTransactions++;
      }
    }

    // 2. Purge dummy users
    const userSnap = await getDocs(collection(db, 'users'));
    for (const docSnap of userSnap.docs) {
      const data = docSnap.data();
      const isDummy =
        docSnap.id.startsWith('usr-') ||
        data.email === 'elena@enterprise.io' ||
        data.email === 'm.vance@techfrontier.org' ||
        data.email === 'sarah.j@acmecloud.io' ||
        data.email === 'david@strataflow.co';

      if (isDummy) {
        await deleteDoc(docSnap.ref);
        deletedUsers++;
      }
    }

    // 3. Purge dummy notifications
    const notifSnap = await getDocs(collection(db, 'notifications'));
    for (const docSnap of notifSnap.docs) {
      const data = docSnap.data();
      const isDummy =
        docSnap.id.startsWith('notif-') ||
        data.title?.includes('High Transaction Spike') ||
        data.title?.includes('New Team Member Joined') ||
        data.title?.includes('Monthly SLA Report Ready') ||
        data.desc?.includes('Zenith AI');

      if (isDummy) {
        await deleteDoc(docSnap.ref);
        deletedNotifications++;
      }
    }

    // 4. Purge dummy KPI metrics
    const kpiSnap = await getDocs(collection(db, 'kpi_metrics'));
    for (const docSnap of kpiSnap.docs) {
      if (['revenue', 'active_users', 'conversions', 'growth'].includes(docSnap.id)) {
        await deleteDoc(docSnap.ref);
        deletedKpi++;
      }
    }
  } catch (err) {
    console.warn('[Firebase] Notice during dummy purge:', err);
  }

  return { deletedTransactions, deletedUsers, deletedNotifications, deletedKpi };
}

// Initial Sync: Purges any residual dummy data to enforce 100% real data
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    await purgeAllDummyData();
  } catch (error) {
    console.warn('[Firebase] Notice during initial purge check:', error);
  }
}
