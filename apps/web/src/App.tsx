import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PayoutModal } from './components/PayoutModal';
import { CreateEventNattModal } from './components/CreateEventNattModal';
import { KycDetailModal } from './components/KycDetailModal';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Versements } from './pages/Versements';
import { Kyc } from './pages/Kyc';
import { Clients } from './pages/Clients';
import { Natts } from './pages/Natts';
import { Cotisations } from './pages/Cotisations';

import { 
  INITIAL_TREASURY, 
  MOCK_CLIENTS, 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_COTISATIONS, 
  INITIAL_PAYOUT_HISTORY,
  INITIAL_EVENT_NATTS,
  INITIAL_KYC_RECORDS,
  INITIAL_OVERDUE_CONTRIBUTIONS
} from './data/mockData';

import { ClientNattSubscription, PayoutRecord, EventNattItem, KycRecord, OverdueContribution } from './types';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('te_admin_auth') === 'true';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [treasury, setTreasury] = useState(INITIAL_TREASURY);
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [cotisations, setCotisations] = useState(INITIAL_COTISATIONS);
  const [payoutHistory, setPayoutHistory] = useState(INITIAL_PAYOUT_HISTORY);
  const [eventNattsList, setEventNattsList] = useState<EventNattItem[]>(INITIAL_EVENT_NATTS);
  const [kycRecords, setKycRecords] = useState<KycRecord[]>(INITIAL_KYC_RECORDS);
  const [overdueContributions, setOverdueContributions] = useState<OverdueContribution[]>(INITIAL_OVERDUE_CONTRIBUTIONS);

  // Modal States
  const [selectedSubForPayout, setSelectedSubForPayout] = useState<ClientNattSubscription | null>(null);
  const [selectedKycRecord, setSelectedKycRecord] = useState<KycRecord | null>(null);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState<boolean>(false);

  // Auth Handlers
  const handleLoginSuccess = () => {
    localStorage.setItem('te_admin_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('te_admin_auth');
    setIsAuthenticated(false);
  };

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Calculate pending payouts & KYC manual checks
  const pendingPayouts = subscriptions.filter(s => s.status === 'ELIGIBLE_PAYOUT');
  const pendingKycCount = kycRecords.filter(k => k.status === 'PENDING_MANUAL_CHECK').length;

  // Action: Confirming payout at 70% threshold
  const handleConfirmPayout = (subscriptionId: string, provider: 'Wave' | 'Orange Money' | 'Virement') => {
    const targetSub = subscriptions.find(s => s.id === subscriptionId);
    if (!targetSub) return;

    const payoutAmount = targetSub.targetAmountFcfa;
    const txRef = `${provider === 'Wave' ? 'WV' : provider === 'Orange Money' ? 'OM' : 'VIR'}-PAYOUT-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowStr = `${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

    // 1. Update Subscriptions status
    setSubscriptions(prev => prev.map(s => {
      if (s.id === subscriptionId) {
        return {
          ...s,
          status: 'PAID_OUT',
          isEligibleForPayout: false,
          payoutDate: nowStr,
          payoutTxRef: txRef,
        };
      }
      return s;
    }));

    // 2. Update Treasury Metrics (Deduct from balance, add to total paid out)
    setTreasury(prev => ({
      ...prev,
      totalBalanceFcfa: prev.totalBalanceFcfa - payoutAmount,
      totalPaidOutFcfa: prev.totalPaidOutFcfa + payoutAmount,
      pendingPayoutsCount: Math.max(0, prev.pendingPayoutsCount - 1),
    }));

    // 3. Add to Payout History
    const newRecord: PayoutRecord = {
      id: `pay-${Date.now()}`,
      subscriptionId,
      clientName: targetSub.clientName,
      clientPhone: targetSub.clientPhone,
      nattTitle: targetSub.categoryTitle,
      targetAmountFcfa: targetSub.targetAmountFcfa,
      contributedAtPayoutFcfa: targetSub.contributedAmountFcfa,
      progressAtPayoutPercent: targetSub.progressPercent,
      payoutAmountFcfa: payoutAmount,
      provider,
      reference: txRef,
      status: 'SUCCESS',
      triggeredAt: nowStr,
      processedAt: nowStr,
      approvedBy: 'Admin Trésorerie',
    };
    setPayoutHistory(prev => [newRecord, ...prev]);

    // Close Modal
    setSelectedSubForPayout(null);
  };

  // Action: Add custom Event Natt
  const handleAddEventNatt = (newEvent: Omit<EventNattItem, 'id' | 'subscribersCount'>) => {
    const newEventObj: EventNattItem = {
      ...newEvent,
      id: `evt-${Date.now()}`,
      subscribersCount: 0,
    };
    setEventNattsList(prev => [newEventObj, ...prev]);
  };

  // Action: Delete Event Natt
  const handleDeleteEventNatt = (eventId: string) => {
    setEventNattsList(prev => prev.filter(e => e.id !== eventId));
  };

  // Action: Approve KYC
  const handleApproveKyc = (kycId: string, notes?: string) => {
    const nowStr = `${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    
    // 1. Update KYC Record status
    setKycRecords(prev => prev.map(k => {
      if (k.id === kycId) {
        return {
          ...k,
          status: 'VERIFIED',
          adminNotes: notes || k.adminNotes,
          verifiedAt: nowStr,
          verifiedBy: 'Admin (Validation Manuelle OCR)',
        };
      }
      return k;
    }));

    // 2. Update Client KYC Status
    const targetKyc = kycRecords.find(k => k.id === kycId);
    if (targetKyc) {
      setClients(prev => prev.map(c => {
        if (c.id === targetKyc.clientId || c.phone === targetKyc.clientPhone) {
          return {
            ...c,
            kycStatus: 'VERIFIED',
          };
        }
        return c;
      }));
    }

    setSelectedKycRecord(null);
  };

  // Action: Reject KYC
  const handleRejectKyc = (kycId: string, notes: string) => {
    setKycRecords(prev => prev.map(k => {
      if (k.id === kycId) {
        return {
          ...k,
          status: 'REJECTED',
          adminNotes: notes,
        };
      }
      return k;
    }));

    const targetKyc = kycRecords.find(k => k.id === kycId);
    if (targetKyc) {
      setClients(prev => prev.map(c => {
        if (c.id === targetKyc.clientId || c.phone === targetKyc.clientPhone) {
          return {
            ...c,
            kycStatus: 'REJECTED',
          };
        }
        return c;
      }));
    }

    setSelectedKycRecord(null);
  };

  // Action: Send Overdue Reminder
  const handleSendReminder = (overdueId: string) => {
    const nowStr = `${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    setOverdueContributions(prev => prev.map(o => {
      if (o.id === overdueId) {
        return {
          ...o,
          status: 'REMINDED',
          lastRemindedAt: nowStr,
        };
      }
      return o;
    }));
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingPayoutsCount={pendingPayouts.length}
        pendingKycCount={pendingKycCount}
      />

      {/* Main Area */}
      <div className="main-content">
        <Header 
          activeTab={activeTab}
          totalBalanceFcfa={treasury.totalBalanceFcfa}
          onRefresh={() => {
            // Simulated refresh indicator
          }}
          onLogout={handleLogout}
        />

        <div className="page-body">
          {activeTab === 'dashboard' && (
            <Dashboard 
              treasury={treasury}
              subscriptions={subscriptions}
              cotisations={cotisations}
              payoutHistory={payoutHistory}
              onOpenPayoutModal={(sub) => setSelectedSubForPayout(sub)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'payouts' && (
            <Versements 
              subscriptions={subscriptions}
              payoutHistory={payoutHistory}
              onOpenPayoutModal={(sub) => setSelectedSubForPayout(sub)}
            />
          )}

          {activeTab === 'kyc' && (
            <Kyc 
              kycRecords={kycRecords}
              onOpenKycModal={(record) => setSelectedKycRecord(record)}
            />
          )}

          {activeTab === 'clients' && (
            <Clients 
              clients={clients}
              subscriptions={subscriptions}
              onOpenPayoutModal={(sub) => setSelectedSubForPayout(sub)}
            />
          )}

          {activeTab === 'natts' && (
            <Natts 
              subscriptions={subscriptions}
              eventNattsList={eventNattsList}
              onOpenCreateEventModal={() => setIsCreateEventModalOpen(true)}
              onDeleteEventNatt={handleDeleteEventNatt}
            />
          )}

          {activeTab === 'cotisations' && (
            <Cotisations 
              cotisations={cotisations}
              overdueContributions={overdueContributions}
              onSendReminder={handleSendReminder}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedSubForPayout && (
        <PayoutModal 
          subscription={selectedSubForPayout}
          onClose={() => setSelectedSubForPayout(null)}
          onConfirmPayout={handleConfirmPayout}
        />
      )}

      {selectedKycRecord && (
        <KycDetailModal 
          record={selectedKycRecord}
          onClose={() => setSelectedKycRecord(null)}
          onApprove={handleApproveKyc}
          onReject={handleRejectKyc}
        />
      )}

      {isCreateEventModalOpen && (
        <CreateEventNattModal 
          onClose={() => setIsCreateEventModalOpen(false)}
          onAddEventNatt={handleAddEventNatt}
        />
      )}
    </div>
  );
};
