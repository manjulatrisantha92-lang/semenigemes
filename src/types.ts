import * as CoreTypes from './types/index';

export * from './types/index';

// Type Aliases for compatibility
export type CustomOrder = CoreTypes.JewelryOrder;
export type UserAccount = CoreTypes.User;
export type WorkshopAdvance = CoreTypes.WorkshopAdvancePayment;
export type Settings = CoreTypes.SystemSettings;

export interface BusinessReportData {
  title: string;
  dateRange: string;
  generatedDate: string;
  totalSalesRevenue: number;
  totalCostOfGoodsSold: number;
  totalGrossProfit: number;
  grossProfitMargin: number;
  totalInventoryValuation: number;
  totalInventoryCostBasis: number;
  invoicesCount: number;
  ordersCount: number;
  lowStockCount: number;
  topSellingItems: {
    name: string;
    code: string;
    quantitySold: number;
    revenue: number;
  }[];
  workshopSummary: {
    workshopName: string;
    city: string;
    activeOrders: number;
    completedOrders: number;
    totalAdvancesPaid: number;
  }[];
  lowStockItems: {
    name: string;
    code: string;
    category: string;
    currentStock: number;
    minAlert: number;
    unitCost: number;
  }[];
}
