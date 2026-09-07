import React from 'react';
import { Customer } from '../../types';
import { Search, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFilter: string;
  onFilterChange: (f: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
}) => {
  const filters = [
    { id: 'ALL', label: 'All Clients' },
    { id: 'CRITICAL', label: 'Critical Churn' },
    { id: 'HIGH_RISK', label: 'High UW Risk' },
    { id: 'WEALTH', label: 'Wealth' },
    { id: 'COMMERCIAL', label: 'Commercial' },
  ];

  const filteredCustomers = customers.filter(c => {
    if (selectedFilter === 'CRITICAL') return c.churnRiskCategory === 'CRITICAL';
    if (selectedFilter === 'HIGH_RISK') return c.underwritingRiskScore >= 70;
    if (selectedFilter === 'WEALTH') return c.tier === 'Wealth';
    if (selectedFilter === 'COMMERCIAL') return c.tier === 'Commercial';
    return true;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRight: '1px solid var(--border-subtle)',
      background: 'rgba(10, 16, 28, 0.65)',
    }}>
      {/* Search Bar */}
      <div style={{ padding: '16px 16px 12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search customer, policy, loan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.85rem',
              width: '100%',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginTop: 10,
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          {filters.map((f) => {
            const active = selectedFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onFilterChange(f.id)}
                style={{
                  background: active ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: active ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Items List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {filteredCustomers.length === 0 ? (
          <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
            No accounts match the current search or filter.
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const isSelected = cust.id === selectedCustomerId;
            const pendingNBA = cust.nextBestActions.filter(a => a.status === 'PENDING').length;

            return (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(30, 41, 59, 0.75) 100%)' 
                    : 'rgba(15, 23, 42, 0.5)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 0 16px rgba(14, 165, 233, 0.2)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img 
                      src={cust.avatar} 
                      alt={cust.name} 
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                        {cust.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {cust.city}, {cust.state} • {cust.tier}
                      </div>
                    </div>
                  </div>

                  {/* Churn Risk Badge */}
                  <span className={`badge ${
                    cust.churnRiskCategory === 'CRITICAL' ? 'badge-critical' :
                    cust.churnRiskCategory === 'HIGH' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {cust.churnRiskCategory === 'CRITICAL' ? <AlertTriangle size={10} /> : <ShieldCheck size={10} />}
                    {cust.churnRiskScore}% Churn
                  </span>
                </div>

                {/* Second Row: LTV & Pending Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  paddingTop: 6,
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                }}>
                  <div>
                    LTV: <strong style={{ color: '#fff' }}>${cust.lifetimeValue.toLocaleString()}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {pendingNBA > 0 && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--primary)',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                      }}>
                        <Zap size={10} />
                        {pendingNBA} NBA
                      </span>
                    )}

                    <span>
                      {cust.policies.length} Policies
                      {cust.loans.length > 0 ? ` • ${cust.loans.length} Loans` : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
