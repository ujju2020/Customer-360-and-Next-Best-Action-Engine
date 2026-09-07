/**
 * Copyright (c) 2026 Ujjwal Kumar Bhowmick
 * Developer: Ujjwal Kumar Bhowmick <ujjwalkumarbhowmick30@gmail.com>
 * All rights reserved.
 */

import { Customer, CopilotMessage, NextBestAction } from '../types';

export class CopilotService {
  /**
   * Generates a context-aware response using customer structured records,
   * unstructured transcripts, and Next-Best-Action recommendations.
   */
  public static async answerQuestion(
    question: string,
    customer: Customer
  ): Promise<CopilotMessage> {
    const q = question.toLowerCase();
    const citations: CopilotMessage['citations'] = [];
    const proposedActions: NextBestAction[] = [];
    let responseText = '';

    // 1. Churn / Risk Questions
    if (q.includes('churn') || q.includes('risk') || q.includes('leave') || q.includes('cancel')) {
      const latestTrx = customer.transcripts[0];
      responseText = `**Analysis for ${customer.name}:**\n` +
        `• **Churn Risk Probability:** ${customer.churnRiskScore}% (${customer.churnRiskCategory})\n` +
        `• **Primary Cause:** ${
          latestTrx ? `Negative sentiment in recent call on ${new Date(latestTrx.callDate).toLocaleDateString()} (${latestTrx.topics.join(', ')})` : 'Underwriting risk indicators'
        }.\n` +
        `• **Customer Sentiment:** ${customer.overallSentimentScore > 0 ? 'Positive' : 'Negative'} (${customer.overallSentimentScore.toFixed(2)} on Snowflake Cortex scale).\n` +
        `• **Financial Exposure:** $${customer.lifetimeValue.toLocaleString()} Lifetime Value across ${customer.policies.length} policies and ${customer.loans.length} loans.\n\n` +
        `**Recommended Mitigation:** Immediate execution of retention package to neutralize competitor arbitrage.`;

      if (latestTrx) {
        citations.push({
          title: `Call Transcript: ${latestTrx.id}`,
          snippet: latestTrx.utterances.find(u => u.highlight)?.text || latestTrx.churnSignals.join('; '),
          type: 'TRANSCRIPT',
        });
      }

      citations.push({
        title: `Customer Risk Dossier (${customer.id})`,
        snippet: `Churn Risk: ${customer.churnRiskScore}%, LTV: $${customer.lifetimeValue.toLocaleString()}, Credit Score: ${customer.creditScore}`,
        type: 'METRIC',
      });

      const retentionAction = customer.nextBestActions.find(a => a.category === 'RETENTION' && a.status === 'PENDING');
      if (retentionAction) proposedActions.push(retentionAction);
    }
    
    // 2. Call / Transcript / Conversation Questions
    else if (q.includes('call') || q.includes('transcript') || q.includes('say') || q.includes('talk') || q.includes('agent')) {
      const latestTrx = customer.transcripts[0];
      if (!latestTrx) {
        responseText = `There are currently no audio call transcripts recorded for ${customer.name}. Touchpoints include mobile app and self-service interactions.`;
      } else {
        responseText = `**Call Transcript Summary (${new Date(latestTrx.callDate).toLocaleDateString()}):**\n` +
          `• **Duration:** ${Math.round(latestTrx.durationSeconds / 60)} minutes with Advisor ${customer.assignedAgent.name}.\n` +
          `• **Snowflake Cortex Sentiment:** ${latestTrx.sentimentLabel} (${latestTrx.overallSentiment})\n` +
          `• **Core Discussion Topics:** ${latestTrx.topics.join(', ')}\n` +
          `• **Extracted Entities:** ${latestTrx.keyEntities.map(e => `${e.name} (${e.value})`).join(', ')}\n` +
          `• **Churn Signals:** ${latestTrx.churnSignals.length > 0 ? latestTrx.churnSignals.join(', ') : 'No attrition flags detected'}.`;

        const keyUtterance = latestTrx.utterances.find(u => u.highlight) || latestTrx.utterances[0];
        if (keyUtterance) {
          citations.push({
            title: `Key Utterance (${keyUtterance.speaker} at ${keyUtterance.timestampOffset}s)`,
            snippet: `"${keyUtterance.text}"`,
            type: 'TRANSCRIPT',
          });
        }
      }
    }

    // 3. Next Best Action / Recommendation Questions
    else if (q.includes('next best action') || q.includes('nba') || q.includes('recommend') || q.includes('what should we do')) {
      const topAction = customer.nextBestActions.find(a => a.status === 'PENDING') || customer.nextBestActions[0];
      if (topAction) {
        responseText = `**Top Recommended Next-Best-Action for ${customer.name}:**\n\n` +
          `🎯 **${topAction.title}**\n` +
          `• **Category:** ${topAction.category} | **Priority:** ${topAction.priority}\n` +
          `• **Confidence:** ${topAction.confidenceScore}%\n` +
          `• **Expected Business Impact:** ${topAction.expectedValue}\n` +
          `• **Strategic Rationale:** ${topAction.rationale}\n` +
          `• **Snowflake Cortex Trigger:** \`${topAction.snowflakeCortexSource}\``;

        proposedActions.push(topAction);
        citations.push({
          title: `NBA Rule Match (${topAction.category})`,
          snippet: topAction.rationale,
          type: 'METRIC',
        });
      } else {
        responseText = `All pending Next Best Actions for ${customer.name} have been successfully executed. Customer account is in good standing.`;
      }
    }

    // 4. Claims Questions
    else if (q.includes('claim') || q.includes('incident') || q.includes('accident') || q.includes('loss')) {
      if (customer.claims.length === 0) {
        responseText = `${customer.name} has a spotless record with zero recorded claims across all active policies.`;
      } else {
        const claimList = customer.claims.map(c => 
          `• **${c.claimNumber}** (${c.incidentType}): Claimed $${c.claimedAmount.toLocaleString()} (Paid: $${c.paidAmount.toLocaleString()}) - Status: **${c.status}**`
        ).join('\n');

        responseText = `**Claims Ledger for ${customer.name}:**\n\n${claimList}\n\n` +
          `• **Underwriting Risk Impact:** Loss ratio score at ${customer.underwritingRiskScore}/100.\n` +
          `• **Notes:** ${customer.claims[0].notes}`;

        citations.push({
          title: `Claim Ledger: ${customer.claims[0].claimNumber}`,
          snippet: customer.claims[0].notes,
          type: 'CLAIM',
        });

        const claimAction = customer.nextBestActions.find(a => a.actionType === 'EXPEDITE_CLAIM' && a.status === 'PENDING');
        if (claimAction) proposedActions.push(claimAction);
      }
    }

    // 5. Cross-Sell & Bundling
    else if (q.includes('bundle') || q.includes('cross-sell') || q.includes('offer') || q.includes('discount')) {
      const crossAction = customer.nextBestActions.find(a => a.category === 'CROSS_SELL');
      responseText = `**Cross-Sell & Personalization Opportunities for ${customer.name}:**\n` +
        `• **Current Portfolio:** ${customer.policies.length} Insurance Policies, ${customer.loans.length} Loans.\n` +
        `• **Credit Score:** ${customer.creditScore} (High Underwriting Quality).\n` +
        (crossAction 
          ? `• **High-Impact Opportunity:** ${crossAction.title} with an estimated value of ${crossAction.expectedValue}.` 
          : `• Customer already possesses multiple policies. Recommended to conduct an annual umbrella liability review.`);

      if (crossAction) proposedActions.push(crossAction);
    }

    // Default Fallback: Unified 360 Synthesis
    else {
      responseText = `**Customer 360 Summary for ${customer.name}:**\n` +
        `• **Tier & Segment:** ${customer.tier} - ${customer.segment}\n` +
        `• **Lifetime Value (LTV):** $${customer.lifetimeValue.toLocaleString()}\n` +
        `• **Churn Risk:** ${customer.churnRiskScore}% (${customer.churnRiskCategory})\n` +
        `• **Policies:** ${customer.policies.length > 0 ? customer.policies.map(p => p.type).join(', ') : 'None'}\n` +
        `• **Loans:** ${customer.loans.length > 0 ? customer.loans.map(l => l.type).join(', ') : 'None'}\n` +
        `• **Top Next Best Action:** ${customer.nextBestActions[0]?.title || 'Standard Servicing'}`;

      if (customer.nextBestActions[0]?.status === 'PENDING') {
        proposedActions.push(customer.nextBestActions[0]);
      }
    }

    return {
      id: `COPILOT-MSG-${Date.now()}`,
      sender: 'COPILOT',
      timestamp: new Date().toISOString(),
      text: responseText,
      citations: citations.length > 0 ? citations : undefined,
      proposedActions: proposedActions.length > 0 ? proposedActions : undefined,
    };
  }
}
