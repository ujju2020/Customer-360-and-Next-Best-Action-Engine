/**
 * Copyright (c) 2026 Ujjwal Kumar Bhowmick
 * Developer: Ujjwal Kumar Bhowmick <ujjwalkumarbhowmick30@gmail.com>
 * All rights reserved.
 */

export type CustomerTier = 'Retail' | 'Wealth' | 'Commercial' | 'SME';

export type ChurnRiskCategory = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UnderwritingTier = 'A_PREFERRED' | 'STANDARD' | 'SUBSTANDARD' | 'HIGH_RISK';

export interface AssignedAgent {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  type: 'AUTO' | 'HOMEOWNERS' | 'LIFE' | 'COMMERCIAL_LIABILITY' | 'UMBRELLA' | 'CYBER';
  title: string;
  status: 'ACTIVE' | 'PENDING_RENEWAL' | 'LAPSED' | 'UNDER_REVIEW';
  annualPremium: number;
  deductible: number;
  coverageLimit: number;
  renewalDate: string;
  effectiveDate: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Loan {
  id: string;
  loanNumber: string;
  type: 'MORTGAGE' | 'COMMERCIAL_RE' | 'AUTO_LOAN' | 'SME_LINE_OF_CREDIT';
  title: string;
  status: 'ACTIVE' | 'DELINQUENT' | 'PAID_OFF' | 'IN_UNDERWRITING';
  principal: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment: number;
  maturityDate: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyType: string;
  dateFiled: string;
  incidentType: string;
  claimedAmount: number;
  paidAmount: number;
  status: 'OPEN' | 'INVESTIGATING' | 'APPROVED' | 'SETTLED' | 'DENIED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  fraudFlag: boolean;
  notes: string;
}

export interface TranscriptUtterance {
  id: string;
  speaker: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  timestampOffset: number; // in seconds
  text: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentScore: number; // -1.0 to 1.0
  highlight?: boolean;
  signalTag?: string; // e.g. "Churn Intent", "Competitor Quote", "Frustration", "Claim Issue"
}

export interface CallTranscript {
  id: string;
  customerId: string;
  interactionId: string;
  callDate: string;
  durationSeconds: number;
  callType: 'INBOUND_SUPPORT' | 'OUTBOUND_RENEWAL' | 'CLAIMS_DISPUTE' | 'UNDERWRITING_INTAKE';
  overallSentiment: number; // -1.0 to 1.0
  sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'HIGHLY_NEGATIVE';
  topics: string[];
  keyEntities: Array<{ name: string; category: string; value: string }>;
  churnSignals: string[];
  urgencyLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  utterances: TranscriptUtterance[];
}

export interface Interaction {
  id: string;
  customerId: string;
  channel: 'PHONE_CALL' | 'BRANCH' | 'MOBILE_APP' | 'EMAIL' | 'PORTAL';
  timestamp: string;
  agentName: string;
  topic: string;
  summary: string;
  sentimentScore: number;
  sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'HIGHLY_NEGATIVE';
  transcriptId?: string;
}

export type ActionCategory = 
  | 'RETENTION' 
  | 'CROSS_SELL' 
  | 'UNDERWRITING_REVIEW' 
  | 'PROACTIVE_SERVICE' 
  | 'RISK_MITIGATION';

export type ActionType = 
  | 'APPLY_DISCOUNT' 
  | 'OFFER_BUNDLE' 
  | 'EXPEDITE_CLAIM' 
  | 'ORDER_TELEMATICS' 
  | 'SCHEDULE_CALL' 
  | 'RATE_LOCK'
  | 'DISPATCH_SENIOR_ADJUSTER';

export interface NextBestAction {
  id: string;
  customerId: string;
  title: string;
  category: ActionCategory;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number; // 0 - 100
  expectedValue: string; // e.g. "$2,400 ARR Retained", "+$650 Cross-Sell", "-38% Claim Dispute Risk"
  financialImpact: number;
  rationale: string;
  triggerSource: string;
  snowflakeCortexSource: string;
  actionType: ActionType;
  actionPayload: Record<string, any>;
  status: 'PENDING' | 'EXECUTED' | 'DISMISSED';
  executedAt?: string;
  executedBy?: string;
}

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  tier: CustomerTier;
  segment: string;
  joinDate: string;
  assignedAgent: AssignedAgent;

  // Unified Analytics
  lifetimeValue: number;
  churnRiskScore: number; // 0 to 100
  churnRiskCategory: ChurnRiskCategory;
  underwritingRiskScore: number; // 0 to 100
  underwritingRiskTier: UnderwritingTier;
  overallSentimentScore: number; // -1.0 to 1.0
  csatRating: number; // 1 to 5
  creditScore: number; // 300 to 850
  
  // Relational entities
  policies: Policy[];
  loans: Loan[];
  claims: Claim[];
  interactions: Interaction[];
  transcripts: CallTranscript[];
  nextBestActions: NextBestAction[];
}

export interface PortfolioKPIs {
  totalCustomers: number;
  totalLTV: number;
  avgChurnRisk: number;
  highRiskCount: number;
  pendingActionsCount: number;
  unresolvedTranscriptsCount: number;
  avgSentimentScore: number;
  crossSellPotential: number;
}

export interface CopilotMessage {
  id: string;
  sender: 'USER' | 'COPILOT';
  timestamp: string;
  text: string;
  citations?: Array<{
    title: string;
    snippet: string;
    type: 'TRANSCRIPT' | 'POLICY' | 'CLAIM' | 'METRIC';
  }>;
  proposedActions?: NextBestAction[];
}
