/**
 * Copyright (c) 2026 Ujjwal Kumar Bhowmick
 * Developer: Ujjwal Kumar Bhowmick <ujjwalkumarbhowmick30@gmail.com>
 * All rights reserved.
 *
 * Snowflake Cortex AI Service
 * Simulates Snowflake Cortex LLM and ML functions, and provides native Cortex SQL templates.
 */

export interface CortexAnalysisResult {
  sentimentScore: number;
  sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'HIGHLY_NEGATIVE';
  keyPhrases: string[];
  intents: string[];
  churnRiskContribution: number;
  underwritingFlags: string[];
}

export class CortexService {
  /**
   * Analyzes an utterance or transcript simulating SNOWFLAKE.CORTEX.SENTIMENT
   */
  public static analyzeSentiment(text: string): CortexAnalysisResult {
    const lower = text.toLowerCase();
    
    // Lexical scoring & rule triggers
    const negativeKeywords = [
      'furious', 'rage', 'cancelling', 'cancel', 'lawyer', 'sue', 'horrible', 
      'killing', 'stalled', 'scam', 'unfair', 'delayed', 'frustrated', 'ridiculous',
      'terrible', 'upset', 'hike', 'bumped', 'bounced', 'shock'
    ];
    const positiveKeywords = [
      'congratulations', 'wonderful', 'great', 'smoothly', 'marvelous', 'happy',
      'love', 'excellent', 'spotless', 'thank', 'perfect', 'appreciate', 'helpful'
    ];
    const churnKeywords = [
      'state farm', 'geico', 'competitor', 'shop elsewhere', 'cancel my renewal', 
      'cancelling everything', 'switch', 'another company'
    ];
    const underwritingKeywords = [
      'collision', 'jackknife', 'claims', 'loss ratio', 'new drivers', 'accident',
      'damaged', 'fatigue'
    ];

    let score = 0;
    const foundNegatives = negativeKeywords.filter(k => lower.includes(k));
    const foundPositives = positiveKeywords.filter(k => lower.includes(k));
    const foundChurn = churnKeywords.filter(k => lower.includes(k));
    const foundUW = underwritingKeywords.filter(k => lower.includes(k));

    score -= foundNegatives.length * 0.3;
    score += foundPositives.length * 0.25;

    // Clamp between -1.0 and 1.0
    score = Math.max(-1.0, Math.min(1.0, score));

    let sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'HIGHLY_NEGATIVE' = 'NEUTRAL';
    if (score <= -0.6) sentimentLabel = 'HIGHLY_NEGATIVE';
    else if (score < 0) sentimentLabel = 'NEGATIVE';
    else if (score >= 0.3) sentimentLabel = 'POSITIVE';

    const intents: string[] = [];
    if (foundChurn.length > 0) intents.push('POLICY_CHURN_INTENT');
    if (lower.includes('claim') || lower.includes('estimate') || lower.includes('adjuster')) intents.push('CLAIM_SERVICING_EXPEDITE');
    if (lower.includes('quote') || lower.includes('bundle') || lower.includes('expires')) intents.push('CROSS_SELL_OPPORTUNITY');
    if (lower.includes('baby') || lower.includes('born') || lower.includes('beneficiary')) intents.push('LIFE_EVENT_UPDATE');
    if (lower.includes('payment') || lower.includes('fee') || lower.includes('ach')) intents.push('PAYMENT_RESOLUTION');

    return {
      sentimentScore: parseFloat(score.toFixed(2)),
      sentimentLabel,
      keyPhrases: [...foundNegatives, ...foundPositives, ...foundChurn],
      intents: intents.length > 0 ? intents : ['GENERAL_INQUIRY'],
      churnRiskContribution: foundChurn.length > 0 ? 45 : (foundNegatives.length * 10),
      underwritingFlags: foundUW,
    };
  }

  /**
   * Generates Snowflake Cortex SQL statements representing how this Customer 360
   * and Next-Best-Action pipeline runs natively inside the Snowflake Data Cloud.
   */
  public static getSnowflakeCortexBlueprint(): {
    cortexSentimentSQL: string;
    cortexCompleteSQL: string;
    cortexVectorSearchSQL: string;
    dynamicTableDDL: string;
  } {
    return {
      cortexSentimentSQL: `-- 1. Snowflake Cortex Sentiment & Entity Extraction Pipeline
CREATE OR REPLACE DYNAMIC TABLE ANALYTICS.CUSTOMER_360.TRANSCRIPT_SENTIMENT_FEEDS
TARGET_LAG = '5 MINUTES'
WAREHOUSE = COMPUTE_WH
AS
SELECT 
    t.customer_id,
    t.transcript_id,
    t.call_timestamp,
    SNOWFLAKE.CORTEX.SENTIMENT(t.raw_transcript_text) AS sentiment_score,
    CASE 
        WHEN SNOWFLAKE.CORTEX.SENTIMENT(t.raw_transcript_text) < -0.65 THEN 'HIGHLY_NEGATIVE'
        WHEN SNOWFLAKE.CORTEX.SENTIMENT(t.raw_transcript_text) < 0 THEN 'NEGATIVE'
        ELSE 'POSITIVE'
    END AS sentiment_tier,
    SNOWFLAKE.CORTEX.EXTRACT_ANSWER(
        t.raw_transcript_text, 
        'Does the caller express an intent to cancel or mention a competitor?'
    ) AS competitor_churn_signal,
    SNOWFLAKE.CORTEX.EXTRACT_ANSWER(
        t.raw_transcript_text, 
        'What specific dollar figures, rate increases, or claims were discussed?'
    ) AS financial_entities
FROM RAW_INGEST.TELEPHONY.VOICE_TRANSCRIPTS t;`,

      cortexCompleteSQL: `-- 2. Snowflake Cortex Generative AI Next-Best-Action Rationale
SELECT 
    c.customer_id,
    c.customer_name,
    c.lifetime_value,
    c.churn_risk_score,
    SNOWFLAKE.CORTEX.COMPLETE(
        'claude-3-5-sonnet',
        PROMPT_TEMPLATE(
            'You are an executive insurance & lending decision engine. Customer {0} has a churn risk of {1}%.
             Their latest call transcript revealed: {2}. Active policies: {3}.
             Generate the single highest-impact Next Best Action, quantified ARR protection, and rationale.',
            c.customer_name,
            c.churn_risk_score,
            t.financial_entities,
            c.policy_summary
        )
    ) AS nba_action_recommendation
FROM ANALYTICS.CUSTOMER_360.UNIFIED_PROFILES c
JOIN ANALYTICS.CUSTOMER_360.TRANSCRIPT_SENTIMENT_FEEDS t 
    ON c.customer_id = t.customer_id
WHERE c.churn_risk_score > 60;`,

      cortexVectorSearchSQL: `-- 3. Cortex Semantic Search on Unstructured Agent Notes & Transcripts
SELECT 
    t.customer_id,
    t.call_timestamp,
    SNOWFLAKE.CORTEX.SIMILARITY(
        SNOWFLAKE.CORTEX.EMBED_TEXT_768('e5-base-v2', t.raw_transcript_text),
        SNOWFLAKE.CORTEX.EMBED_TEXT_768('e5-base-v2', 'Customer threatened to switch to competitor due to premium increase')
    ) AS similarity_score
FROM RAW_INGEST.TELEPHONY.VOICE_TRANSCRIPTS t
ORDER BY similarity_score DESC
LIMIT 10;`,

      dynamicTableDDL: `-- 4. Snowflake Hybrid / Dynamic Table: Customer 360 Master View
CREATE OR REPLACE DYNAMIC TABLE ANALYTICS.CUSTOMER_360.MASTER_VIEW
TARGET_LAG = '1 MINUTE'
WAREHOUSE = COMPUTE_WH
AS
SELECT 
    c.customer_id,
    c.full_name,
    c.tier,
    c.credit_score,
    SUM(p.annual_premium) AS total_annual_premium,
    COUNT(DISTINCT p.policy_id) AS active_policy_count,
    COALESCE(SUM(l.current_balance), 0) AS total_loan_balance,
    COUNT(DISTINCT clm.claim_id) AS total_claims_filed,
    AVG(s.sentiment_score) AS avg_interaction_sentiment,
    -- Next Best Action Matrix Scoring
    CASE 
        WHEN AVG(s.sentiment_score) < -0.5 AND SUM(p.annual_premium) > 3000 THEN 'VIP_RETENTION_RATE_ADJUSTMENT'
        WHEN COUNT(DISTINCT l.loan_id) > 0 AND COUNT(DISTINCT p.policy_id) = 0 THEN 'CROSS_SELL_HOME_AUTO_BUNDLE'
        WHEN COUNT(DISTINCT clm.claim_id) > 1 THEN 'UNDERWRITING_TELEMATICS_REVIEW'
        ELSE 'STANDARD_ANNUAL_REVIEW'
    END AS next_best_action_rule_trigger
FROM RAW.CORE.CUSTOMERS c
LEFT JOIN RAW.POLICY.POLICIES p ON c.customer_id = p.customer_id AND p.status = 'ACTIVE'
LEFT JOIN RAW.LENDING.LOANS l ON c.customer_id = l.customer_id AND l.status = 'ACTIVE'
LEFT JOIN RAW.CLAIMS.CLAIMS clm ON p.policy_id = clm.policy_id
LEFT JOIN ANALYTICS.CUSTOMER_360.TRANSCRIPT_SENTIMENT_FEEDS s ON c.customer_id = s.customer_id
GROUP BY c.customer_id, c.full_name, c.tier, c.credit_score;`,
    };
  }
}
