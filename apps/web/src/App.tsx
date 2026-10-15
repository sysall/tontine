import React, { useState, useEffect } from 'react';
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
  TreasuryMetrics,
  Client,
  ClientNattSubscription, 
  CotisationTransaction, 
  PayoutRecord, 
  EventNattItem, 
  KycRecord, 
  OverdueContribution 
} from './types';

import { adminApi, AdminProfile, BackofficeDataResponse } from './api/adminApi';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';

export const App: React.FC = () => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const isAuthenticated = currentAdmin !== null;

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [treasury, setTreasury] = useState<TreasuryMetrics>({
    totalBalanceFcfa: 0,
    totalCollectedFcfa: 0,
    totalPaidOutFcfa: 0,
    pendingPayoutsCount: 0,
    pendingPayoutsTotalFcfa: 0,
    activeClientsCount: 0,
    activeSubscriptionsCount: 0,
    solvencyRatioPercent: 0,
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptions, setSubscriptions] = useState<ClientNattSubscription[]>([]);
  const [cotisations, setCotisations] = useState<CotisationTransaction[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([]);
  const [eventNattsList, setEventNattsList] = useState<EventNattItem[]>([]);
  const [kycRecords, setKycRecords] = useState<KycRecord[]>([]);
  const [overdueContributions, setOverdueContributions] = useState<OverdueContribution[]>([]);

  // Modal States
  const [selectedSubForPayout, setSelectedSubForPayout] = useState<ClientNattSubscription | null>(null);
  const [selectedKycRecord, setSelectedKycRecord] = useState<KycRecord | null>(null);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState<boolean>(false);

  // Helper to apply data response from API
  const applyDataResponse = (data: BackofficeDataResponse) => {
    if (data.treasury) setTreasury(data.treasury);
    if (data.clients) setClients(data.clients);
    if (data.subscriptions) setSubscriptions(data.subscriptions);
    if (data.cotisations) setCotisations(data.cotisations);
    if (data.payoutHistory) setPayoutHistory(data.payoutHistory);
    if (data.eventNattsList) setEventNattsList(data.eventNattsList);
    if (data.kycRecords) setKycRecords(data.kycRecords);
    if (data.overdueContributions) setOverdueContributions(data.overdueContributions);
  };

  // Fetch initial data from API
  const loadBackofficeData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await adminApi.fetchBackofficeData();
      applyDataResponse(data);
    } catch (error) {
      console.error('Error connecting to NestJS API:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadBackofficeData();
    }
  }, [isAuthenticated]);

  // Restore Firebase session on reload and re-verify admin access
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentAdmin(null);
        setIsAuthChecking(false);
        return;
      }
      try {
        setCurrentAdmin(await adminApi.getMe());
      } catch (err) {
        console.warn('Admin access check failed:', err);
        await signOut(auth);
        setCurrentAdmin(null);
      } finally {
        setIsAuthChecking(false);
      }
    });
    return unsubscribe;
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (admin: AdminProfile) => {
    setCurrentAdmin(admin);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentAdmin(null);
  };

  if (isAuthChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#173F73', fontWeight: 'bold' }}>
        Vérification de la session administrateur...
      </div>
    );
  }

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Calculate pending payouts & KYC manual checks
  const pendingPayouts = subscriptions.filter(s => s.status === 'ELIGIBLE_PAYOUT');
  const pendingKycCount = kycRecords.filter(k => k.status === 'PENDING_MANUAL_CHECK').length;

  // Action: Confirming payout at 70% threshold
  const handleConfirmPayout = async (subscriptionId: string, provider: 'Wave' | 'Orange Money' | 'Virement') => {
    try {
      const updatedData = await adminApi.processPayout(subscriptionId, provider);
      applyDataResponse(updatedData);
    } catch (err) {
      console.error('Failed to confirm payout via API:', err);
    } finally {
      setSelectedSubForPayout(null);
    }
  };

  // Action: Add custom Event Natt
  const handleAddEventNatt = async (newEvent: Omit<EventNattItem, 'id' | 'subscribersCount'>) => {
    try {
      const updatedData = await adminApi.addEventNatt(newEvent);
      applyDataResponse(updatedData);
    } catch (err) {
      console.error('Failed to add event natt via API:', err);
    }
  };

  // Action: Delete Event Natt
  const handleDeleteEventNatt = async (eventId: string) => {
    try {
      const updatedData = await adminApi.deleteEventNatt(eventId);
      applyDataResponse(updatedData);
    } catch (err) {
      console.error('Failed to delete event natt via API:', err);
    }
  };

  // Action: Toggle / Deactivate Event Natt Status
  const handleToggleEventNattStatus = async (eventId: string, status?: 'ACTIVE' | 'INACTIVE') => {
    try {
      const updatedData = await adminApi.toggleEventNattStatus(eventId, status);
      applyDataResponse(updatedData);
    } catch (err) {
      console.error('Failed to toggle event natt status via API:', err);
    }
  };

  // Action: Approve KYC
  const handleApproveKyc = async (kycId: string, notes?: string) => {
    try {
      const updatedData = await adminApi.approveKyc(kycId, notes);
      applyDataResponse(updatedData);
    } catch (err) {
      console.error('Failed to approve KYC via API:', err);
    } finally {
      setSelectedKycRecord(null);
    }
  };

  // Action: Reject KYC
  const handleRejectKyc = async (kycId: string, notes: string) => {
    try {
      const updatedData = await adminApi.rejectKyc(kycId, notes);
      applyDataResponse(updatedData);
    } catch (err) {
      console.error('Failed to reject KYC via API:', err);
    } finally {
      setSelectedKycRecord(null);
    }
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
          onRefresh={() => loadBackofficeData(true)}
          onLogout={handleLogout}
        />

        <div className="page-body">
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#173F73', fontWeight: 'bold' }}>
              Chargement des données Trésorerie & Clients depuis l'API NestJS...
            </div>
          ) : (
            <>
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
                  onToggleEventNattStatus={handleToggleEventNattStatus}
                />
              )}

              {activeTab === 'cotisations' && (
                <Cotisations 
                  cotisations={cotisations}
                  overdueContributions={overdueContributions}
                />
              )}
            </>
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
