/**
 * Copyright (c) 2026 Ujjwal Kumar Bhowmick
 * Developer: Ujjwal Kumar Bhowmick <ujjwalkumarbhowmick30@gmail.com>
 * All rights reserved.
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { CustomerService } from '../services/customerService';
import { CortexService } from '../services/cortexService';
import { CopilotService } from '../services/copilotService';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', engine: 'Customer 360 & NBA Engine', time: new Date().toISOString() });
});

// Portfolio KPIs
app.get('/api/analytics/kpis', (req: Request, res: Response) => {
  try {
    const kpis = CustomerService.getPortfolioKPIs();
    res.json(kpis);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all customers (with search & filters)
app.get('/api/customers', (req: Request, res: Response) => {
  try {
    const { search, tier, riskCategory, segment } = req.query;
    const customers = CustomerService.getAllCustomers({
      search: search as string,
      tier: tier as string,
      riskCategory: riskCategory as string,
      segment: segment as string,
    });
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single customer 360 view
app.get('/api/customers/:id', (req: Request, res: Response) => {
  try {
    const customer = CustomerService.getCustomerById(req.params.id as string);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Execute Next Best Action
app.post('/api/customers/:id/actions/:actionId/execute', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const actionId = req.params.actionId as string;
    const { executedBy } = req.body;
    const result = CustomerService.executeAction(id, actionId, executedBy || 'Senior Account Director');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Natural Language Copilot Ask Endpoint
app.post('/api/copilot/ask', async (req: Request, res: Response) => {
  try {
    const { customerId, question } = req.body;
    if (!customerId || !question) {
      return res.status(400).json({ error: 'customerId and question are required' });
    }

    const customer = CustomerService.getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const response = await CopilotService.answerQuestion(question, customer);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Snowflake Cortex Blueprint & SQL Generator
app.get('/api/snowflake/blueprint', (req: Request, res: Response) => {
  try {
    const blueprint = CortexService.getSnowflakeCortexBlueprint();
    res.json(blueprint);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset dataset
app.post('/api/admin/reset', (req: Request, res: Response) => {
  try {
    CustomerService.resetData();
    res.json({ message: 'Dataset reset to initial seed state successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const isDirectRun = !process.env.VITE && process.argv[1] && (process.argv[1].includes('server') || process.argv[1].endsWith('index.ts'));
if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`🚀 Customer 360 & NBA Engine server running on http://localhost:${PORT}`);
  });
}

export default app;
