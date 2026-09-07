/**
 * Copyright (c) 2026 Ujjwal Kumar Bhowmick
 * Developer: Ujjwal Kumar Bhowmick <ujjwalkumarbhowmick30@gmail.com>
 * All rights reserved.
 */

import { CustomerService } from '../services/customerService';
import { CortexService } from '../services/cortexService';
import { NBAEngine } from '../services/nbaEngine';
import { CopilotService } from '../services/copilotService';

async function runVerification() {
  console.log('🧪 Starting Automated Verification for Customer 360 & NBA Engine...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  };

  // Test 1: Customer Data & KPI Service
  console.log('1. Testing Customer Service & KPI Aggregation:');
  const allCustomers = CustomerService.getAllCustomers();
  assert(allCustomers.length >= 5, 'Customer store loads all initial profiles', `Count: ${allCustomers.length}`);
  
  const kpis = CustomerService.getPortfolioKPIs();
  assert(kpis.totalLTV > 100000, 'Calculates total portfolio LTV correctly', `LTV: $${kpis.totalLTV}`);
  assert(kpis.pendingActionsCount > 0, 'Accurately aggregates pending NBA count', `Pending: ${kpis.pendingActionsCount}`);

  // Test 2: Snowflake Cortex Sentiment NLP Engine
  console.log('\n2. Testing Cortex Sentiment & Entity Extraction:');
  const angryText = "I am absolutely furious. Cancel my policy immediately, I got a quote from State Farm for $1,200 less!";
  const happyText = "Thank you so much Victoria, congratulations on the great service, this move went smoothly!";
  
  const angryAnalysis = CortexService.analyzeSentiment(angryText);
  assert(angryAnalysis.sentimentScore < -0.5, 'Detects negative sentiment from churn text', `Score: ${angryAnalysis.sentimentScore}`);
  assert(angryAnalysis.intents.includes('POLICY_CHURN_INTENT'), 'Identifies churn intent flag');
  
  const happyAnalysis = CortexService.analyzeSentiment(happyText);
  assert(happyAnalysis.sentimentScore > 0.4, 'Detects positive sentiment from satisfaction text', `Score: ${happyAnalysis.sentimentScore}`);

  // Test 3: Next Best Action Engine Multi-Factor Rules
  console.log('\n3. Testing Next-Best-Action Recommendation Engine:');
  const elena = CustomerService.getCustomerById('CUST-1001')!;
  const elenaActions = NBAEngine.evaluateCustomer(elena);
  const retentionAction = elenaActions.find(a => a.category === 'RETENTION');
  assert(retentionAction !== undefined, 'Generates VIP Retention action for high-churn customer');
  assert(retentionAction!.confidenceScore >= 90, 'High confidence score for retention action', `${retentionAction?.confidenceScore}%`);

  const sarah = CustomerService.getCustomerById('CUST-1003')!;
  const sarahActions = NBAEngine.evaluateCustomer(sarah);
  const crossSellAction = sarahActions.find(a => a.category === 'CROSS_SELL');
  assert(crossSellAction !== undefined, 'Generates Cross-Sell bundle action for mortgage holder');

  // Test 4: Action Execution & State Mutation
  console.log('\n4. Testing Action Execution & Master Timeline Updates:');
  const initialChurnScore = elena.churnRiskScore;
  const initialInteractionsCount = elena.interactions.length;
  
  const executionResult = CustomerService.executeAction('CUST-1001', elenaActions[0].id);
  assert(executionResult.action.status === 'EXECUTED', 'Action status updated to EXECUTED');
  assert(executionResult.customer.churnRiskScore < initialChurnScore, 'Execution reduces customer churn risk score', 
    `Before: ${initialChurnScore}%, After: ${executionResult.customer.churnRiskScore}%`);
  assert(executionResult.customer.interactions.length === initialInteractionsCount + 1, 'Appends audit event to customer interaction timeline');

  // Test 5: Grounded Natural Language Copilot
  console.log('\n5. Testing Customer 360 Copilot grounded reasoning:');
  const copilotAnswer = await CopilotService.answerQuestion(
    'Why is Elena at risk of churning and what should we do?',
    elena
  );
  assert(copilotAnswer.citations !== undefined && copilotAnswer.citations.length > 0, 'Copilot includes grounded citations to transcript/dossier');
  assert(copilotAnswer.text.includes('Elena'), 'Copilot personalizes answer to the customer');

  // Test 6: Snowflake Architecture Blueprint
  console.log('\n6. Testing Snowflake Cortex SQL Blueprint:');
  const blueprint = CortexService.getSnowflakeCortexBlueprint();
  assert(blueprint.cortexSentimentSQL.includes('SNOWFLAKE.CORTEX.SENTIMENT'), 'Generates Cortex Sentiment SQL');
  assert(blueprint.dynamicTableDDL.includes('CREATE OR REPLACE DYNAMIC TABLE'), 'Generates Dynamic Tables Master View DDL');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All Customer 360 & NBA Engine tests PASSED successfully!');
  }
}

runVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
