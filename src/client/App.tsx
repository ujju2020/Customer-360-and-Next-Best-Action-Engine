/**
 * Copyright (c) 2026 Ujjwal Kumar Bhowmick
 * Developer: Ujjwal Kumar Bhowmick <ujjwalkumarbhowmick30@gmail.com>
 * All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { Customer, PortfolioKPIs } from '../types';
import { Header } from './components/Header';
import { CustomerList } from './components/CustomerList';
import { Customer360View } from './components/Customer360View';
import { CopilotModal } from './components/CopilotModal';
import { SnowflakeCortexModal } from './components/SnowflakeCortexModal';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-1001');
  const [kpis, setKpis] = useState<PortfolioKPIs | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  
  // Modals
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');
  const [isCortexOpen, setIsCortexOpen] = useState<boolean>(false);
  const [cortexBlueprint, setCortexBlueprint] = useState<any>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [custRes, kpiRes, cortexRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/analytics/kpis'),
        fetch('/api/snowflake/blueprint'),
      ]);

      if (custRes.ok) {
        const custList = await custRes.json();
        setCustomers(custList);
        if (custList.length > 0 && !custList.some((c: Customer) => c.id === selectedCustomerId)) {
          setSelectedCustomerId(custList[0].id);
        }
      }

      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(kpiData);
      }

      if (cortexRes.ok) {
        const bp = await cortexRes.json();
        setCortexBlueprint(bp);
      }
    } catch (err) {
      console.error('Failed to load API data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Execute NBA handler
  const handleExecuteAction = async (actionId: string) => {
    if (!selectedCustomer) return;
    setIsExecutingAction(actionId);

    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/actions/${actionId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executedBy: 'Victoria Stone (Senior Director)' }),
      });

      if (!res.ok) throw new Error('Execution failed');
      const data = await res.json();

      // Update customers in state
      setCustomers(prev => prev.map(c => c.id === data.customer.id ? data.customer : c));

      // Refresh KPIs
      const kpiRes = await fetch('/api/analytics/kpis');
      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(kpiData);
      }
    } catch (err) {
      console.error('Failed to execute action:', err);
    } finally {
      setIsExecutingAction(null);
    }
  };

  // Reset Dataset handler
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/admin/reset', { method: 'POST' });
      await fetchData();
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenCopilotWithPrompt = (prompt?: string) => {
    setCopilotInitialPrompt(prompt || '');
    setIsCopilotOpen(true);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        kpis={kpis}
        onOpenCortex={() => setIsCortexOpen(true)}
        onOpenCopilot={() => handleOpenCopilotWithPrompt()}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Two-Column Layout */}
      <div style={{
        display: 'flex',
        flex: 1,
        maxWidth: 1680,
        margin: '0 auto',
        width: '100%',
        minHeight: 'calc(100vh - 120px)',
      }}>
        {/* Left Customer Roster Sidebar */}
        <div style={{ width: 360, flexShrink: 0 }}>
          <CustomerList
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </div>

        {/* Right Customer 360 Dossier Content */}
        <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60vh',
              gap: 12,
              color: 'var(--primary)',
            }}>
              <span className="pulse-dot" style={{ background: 'var(--primary)', width: 12, height: 12 }} />
              <span style={{ fontWeight: 600 }}>Loading Customer 360 & Snowflake Cortex feeds...</span>
            </div>
          ) : selectedCustomer ? (
            <Customer360View
              customer={selectedCustomer}
              onExecuteAction={handleExecuteAction}
              isExecuting={isExecutingAction}
              onOpenCopilot={handleOpenCopilotWithPrompt}
            />
          ) : (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
              <h3>Select a customer to view their 360 profile and Next Best Actions</h3>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedCustomer && (
        <CopilotModal
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          customer={selectedCustomer}
          onExecuteAction={handleExecuteAction}
          initialPrompt={copilotInitialPrompt}
        />
      )}

      <SnowflakeCortexModal
        isOpen={isCortexOpen}
        onClose={() => setIsCortexOpen(false)}
        blueprint={cortexBlueprint}
      />
    </div>
  );
};
