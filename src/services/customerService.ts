/**
 * Copyright (c) 2026 Ujjwal Kumar Bhowmick
 * Developer: Ujjwal Kumar Bhowmick <ujjwalkumarbhowmick30@gmail.com>
 * All rights reserved.
 */

import { Customer, PortfolioKPIs, NextBestAction } from '../types';
import { initialCustomers } from '../data/mockCustomers';
import { NBAEngine } from './nbaEngine';

export class CustomerService {
  private static customers: Customer[] = JSON.parse(JSON.stringify(initialCustomers));

  public static resetData(): void {
    this.customers = JSON.parse(JSON.stringify(initialCustomers));
  }

  public static getAllCustomers(query?: {
    search?: string;
    tier?: string;
    riskCategory?: string;
    segment?: string;
  }): Customer[] {
    let result = [...this.customers];

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.policies.some(p => p.policyNumber.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)) ||
        c.loans.some(l => l.loanNumber.toLowerCase().includes(q) || l.title.toLowerCase().includes(q))
      );
    }

    if (query?.tier && query.tier !== 'ALL') {
      result = result.filter(c => c.tier.toLowerCase() === query.tier!.toLowerCase());
    }

    if (query?.riskCategory && query.riskCategory !== 'ALL') {
      result = result.filter(c => c.churnRiskCategory.toUpperCase() === query.riskCategory!.toUpperCase());
    }

    return result;
  }

  public static getCustomerById(id: string): Customer | null {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) return null;

    // Dynamically evaluate NBAs before returning
    const evaluatedActions = NBAEngine.evaluateCustomer(customer);
    return {
      ...customer,
      nextBestActions: evaluatedActions,
    };
  }

  public static executeAction(
    customerId: string, 
    actionId: string, 
    executedBy = 'Senior Account Director'
  ): { customer: Customer; action: NextBestAction } {
    const customer = this.getCustomerById(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const { customer: updatedCustomer, executedAction } = NBAEngine.executeAction(customer, actionId, executedBy);
    
    // Update store
    const index = this.customers.findIndex(c => c.id === customerId);
    if (index !== -1) {
      this.customers[index] = updatedCustomer;
    }

    return { customer: updatedCustomer, action: executedAction };
  }

  public static getPortfolioKPIs(): PortfolioKPIs {
    const totalCustomers = this.customers.length;
    const totalLTV = this.customers.reduce((acc, c) => acc + c.lifetimeValue, 0);
    const avgChurnRisk = Math.round(
      this.customers.reduce((acc, c) => acc + c.churnRiskScore, 0) / (totalCustomers || 1)
    );
    const highRiskCount = this.customers.filter(c => c.churnRiskCategory === 'CRITICAL' || c.churnRiskCategory === 'HIGH').length;
    
    const pendingActionsCount = this.customers.reduce((acc, c) => {
      return acc + c.nextBestActions.filter(a => a.status === 'PENDING').length;
    }, 0);

    const unresolvedTranscriptsCount = this.customers.reduce((acc, c) => {
      return acc + c.transcripts.filter(t => t.urgencyLevel === 'CRITICAL' || t.overallSentiment < -0.4).length;
    }, 0);

    const avgSentimentScore = parseFloat(
      (this.customers.reduce((acc, c) => acc + c.overallSentimentScore, 0) / (totalCustomers || 1)).toFixed(2)
    );

    const crossSellPotential = this.customers.filter(
      c => (c.loans.length > 0 && c.policies.length === 0) || (c.policies.length > 0 && c.loans.length === 0)
    ).length;

    return {
      totalCustomers,
      totalLTV,
      avgChurnRisk,
      highRiskCount,
      pendingActionsCount,
      unresolvedTranscriptsCount,
      avgSentimentScore,
      crossSellPotential,
    };
  }
}
