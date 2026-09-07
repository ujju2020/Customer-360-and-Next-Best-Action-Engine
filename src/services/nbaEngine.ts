/**
 * Copyright (c) 2026 Ujjwal Kumar Bhowmick
 * Developer: Ujjwal Kumar Bhowmick <ujjwalkumarbhowmick30@gmail.com>
 * All rights reserved.
 */

import { Customer, NextBestAction } from '../types';

export class NBAEngine {
  /**
   * Evaluates all customer touchpoints (structured policies, claims, credit,
   * plus unstructured transcripts and sentiment) to generate prioritized Next Best Actions.
   */
  public static evaluateCustomer(customer: Customer): NextBestAction[] {
    const actions: NextBestAction[] = [];

    // Calculate aggregated context
    const hasActivePolicies = customer.policies.some(p => p.status === 'ACTIVE' || p.status === 'PENDING_RENEWAL');
    const hasActiveLoans = customer.loans.some(l => l.status === 'ACTIVE');
    const totalPremium = customer.policies.reduce((acc, p) => acc + p.annualPremium, 0);
    const pendingClaims = customer.claims.filter(c => c.status === 'OPEN' || c.status === 'INVESTIGATING');
    const recentTranscripts = customer.transcripts || [];
    const latestTranscript = recentTranscripts[0];

    // Rule 1: Urgent Retention for High-Value / High-Churn Insurer
    if (customer.churnRiskScore >= 70 && totalPremium > 2000) {
      const discountPercent = customer.tier === 'Wealth' ? 15 : 10;
      const expectedProtection = Math.round(totalPremium * 0.95);
      
      actions.push({
        id: `NBA-GEN-${customer.id}-RET`,
        customerId: customer.id,
        title: `Deploy Executive Retention Offer & ${discountPercent}% Loyalty Rate Adjustment`,
        category: 'RETENTION',
        priority: 'URGENT',
        confidenceScore: Math.min(99, Math.round(customer.churnRiskScore * 1.05)),
        expectedValue: `$${expectedProtection.toLocaleString()} ARR Protected`,
        financialImpact: expectedProtection,
        rationale: `Customer churn risk is ${customer.churnRiskScore}% with $${customer.lifetimeValue.toLocaleString()} LTV. Sentiment score is ${customer.overallSentimentScore}. Immediate rate mitigation and executive outreach prevents competitor attrition.`,
        triggerSource: latestTranscript ? `Call Transcript (${latestTranscript.id}): Churn intent flags detected` : 'Churn ML Model Threshold (>70%)',
        snowflakeCortexSource: 'SNOWFLAKE.CORTEX.SENTIMENT < -0.65 AND CHURN_RISK > 70',
        actionType: 'APPLY_DISCOUNT',
        actionPayload: { discountPercent, targetPolicies: customer.policies.map(p => p.id) },
        status: 'PENDING',
      });
    }

    // Rule 2: Claims Bottleneck Mitigation
    if (pendingClaims.length > 0 && customer.overallSentimentScore < -0.3) {
      const claim = pendingClaims[0];
      actions.push({
        id: `NBA-GEN-${customer.id}-CLM`,
        customerId: customer.id,
        title: `Dispatch Senior Adjuster to Expedite Claim ${claim.claimNumber}`,
        category: 'PROACTIVE_SERVICE',
        priority: 'URGENT',
        confidenceScore: 93,
        expectedValue: 'Clear Claims Blocker & Prevent Litigation/Churn',
        financialImpact: claim.claimedAmount,
        rationale: `Claim ${claim.claimNumber} (${claim.incidentType}) is currently ${claim.status}. Prolonged turnaround is generating severe customer dissatisfaction in recent interactions.`,
        triggerSource: `Claim Record ${claim.claimNumber} + Telephony sentiment drop`,
        snowflakeCortexSource: 'Snowflake Alert: OPEN_DAYS > 14 AND INTERACTION_SENTIMENT < -0.3',
        actionType: 'EXPEDITE_CLAIM',
        actionPayload: { claimId: claim.id, claimNumber: claim.claimNumber },
        status: 'PENDING',
      });
    }

    // Rule 3: Underwriting Risk Mitigation via IoT Telematics
    if (customer.underwritingRiskScore >= 70 || customer.claims.length >= 2) {
      actions.push({
        id: `NBA-GEN-${customer.id}-UW`,
        customerId: customer.id,
        title: 'Mandate IoT Telematics Safety Program with Risk Mitigation Credit',
        category: 'RISK_MITIGATION',
        priority: 'HIGH',
        confidenceScore: 91,
        expectedValue: '-35% Loss Frequency Projection',
        financialImpact: 12000,
        rationale: `Elevated underwriting risk score of ${customer.underwritingRiskScore}/100 and recent claim frequency require active risk monitoring. Real-time telematics reduces accident frequency while offering driver incentives.`,
        triggerSource: 'Underwriting Score Escalation & Multi-Claim History',
        snowflakeCortexSource: 'Snowflake Actuarial Model: LOSS_FREQUENCY_PROBABILITY > 0.65',
        actionType: 'ORDER_TELEMATICS',
        actionPayload: { program: 'TELEMATICS_FLEET_CONNECT', discountCredit: 2500 },
        status: 'PENDING',
      });
    }

    // Rule 4: Prime Lending to Insurance Cross-Sell (e.g. Mortgage -> Homeowners)
    if (hasActiveLoans && (!hasActivePolicies || customer.policies.every(p => p.type !== 'HOMEOWNERS'))) {
      actions.push({
        id: `NBA-GEN-${customer.id}-XSELL`,
        customerId: customer.id,
        title: 'Offer Pre-Approved Homeowners & Auto Bundle with Escrow Credit',
        category: 'CROSS_SELL',
        priority: 'HIGH',
        confidenceScore: 96,
        expectedValue: '+$2,800 Gross Written Premium',
        financialImpact: 2800,
        rationale: `Customer maintains an active high-balance loan ($${customer.loans[0].currentBalance.toLocaleString()}) with excellent credit (${customer.creditScore}), but no bundled homeowner coverage. Direct mortgage escrow billing reduces buyer friction.`,
        triggerSource: 'Loan Origination Ledger: Unbundled Collateral Property',
        snowflakeCortexSource: 'SNOWFLAKE.CORTEX.CLASSIFY_TEXT: "High Intent Cross-Sell Inbound"',
        actionType: 'OFFER_BUNDLE',
        actionPayload: { loanId: customer.loans[0].id, bundleDiscount: 650 },
        status: 'PENDING',
      });
    }

    // Deduplicate against existing actions
    const existingTitles = new Set(customer.nextBestActions.map(a => a.title));
    const newActions = actions.filter(a => !existingTitles.has(a.title));

    // Combine and sort by priority & confidence
    const priorityWeight = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...customer.nextBestActions, ...newActions].sort((a, b) => {
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return b.confidenceScore - a.confidenceScore;
    });
  }

  /**
   * Executes a Next-Best-Action and returns the updated customer profile
   */
  public static executeAction(
    customer: Customer, 
    actionId: string, 
    executedBy = 'System Operator'
  ): { customer: Customer; executedAction: NextBestAction } {
    const actionIndex = customer.nextBestActions.findIndex(a => a.id === actionId);
    if (actionIndex === -1) {
      throw new Error(`Action with ID ${actionId} not found for customer ${customer.id}`);
    }

    const targetAction = { ...customer.nextBestActions[actionIndex] };
    targetAction.status = 'EXECUTED';
    targetAction.executedAt = new Date().toISOString();
    targetAction.executedBy = executedBy;

    // Mutate customer state realistically based on action execution
    let newChurnScore = customer.churnRiskScore;
    let newSentiment = customer.overallSentimentScore;
    let interactionSummary = `Next Best Action "${targetAction.title}" was executed successfully.`;

    if (targetAction.category === 'RETENTION') {
      newChurnScore = Math.max(15, customer.churnRiskScore - 45);
      newSentiment = Math.min(1.0, customer.overallSentimentScore + 0.55);
      interactionSummary += ` Applied loyalty rate discount. Churn risk reduced from ${customer.churnRiskScore}% to ${newChurnScore}%.`;
    } else if (targetAction.category === 'PROACTIVE_SERVICE') {
      newSentiment = Math.min(1.0, customer.overallSentimentScore + 0.4);
      newChurnScore = Math.max(10, customer.churnRiskScore - 25);
      interactionSummary += ` Priority escalation ticket logged with senior adjuster.`;
    } else if (targetAction.category === 'CROSS_SELL') {
      interactionSummary += ` Automated digital quote sent for signature via mortgage escrow.`;
    } else if (targetAction.category === 'RISK_MITIGATION') {
      interactionSummary += ` Telematics hardware fulfillment order placed. Actuarial risk tier updated.`;
    }

    const updatedActions = [...customer.nextBestActions];
    updatedActions[actionIndex] = targetAction;

    // Add new interaction to timeline
    const newInteraction = {
      id: `INT-EXEC-${Date.now()}`,
      customerId: customer.id,
      channel: 'PORTAL' as const,
      timestamp: new Date().toISOString(),
      agentName: executedBy,
      topic: `NBA Executed: ${targetAction.title}`,
      summary: interactionSummary,
      sentimentScore: newSentiment,
      sentimentLabel: (newSentiment > 0.2 ? 'POSITIVE' : (newSentiment < -0.3 ? 'NEGATIVE' : 'NEUTRAL')) as any,
    };

    const updatedCustomer: Customer = {
      ...customer,
      churnRiskScore: newChurnScore,
      churnRiskCategory: newChurnScore >= 75 ? 'CRITICAL' : (newChurnScore >= 50 ? 'HIGH' : (newChurnScore >= 25 ? 'MEDIUM' : 'LOW')),
      overallSentimentScore: parseFloat(newSentiment.toFixed(2)),
      nextBestActions: updatedActions,
      interactions: [newInteraction, ...customer.interactions],
    };

    return { customer: updatedCustomer, executedAction: targetAction };
  }
}
