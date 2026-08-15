export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type AccountType = 'bank' | 'food_wallet' | 'credit_card';

export interface Account {
  _id: string;
  name: string;
  accountType: AccountType;
  icon: string;
  color: string;
  balance: number;
  creditLimit?: number | null;
  sortOrder: number;
}

export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  parentId: string | null;
  sortOrder: number;
  subcategories?: Category[];
}

export interface Transaction {
  _id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  date: string;
  accountId: Account | string;
  toAccountId?: Account | string | null;
  categoryId?: Category | string | null;
  subcategoryId?: Category | string | null;
  note: string;
  transferGroupId?: string | null;
}

export interface Summary {
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  total: number;
  categories: {
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    amount: number;
    percent: number;
  }[];
}

export interface TimeseriesPoint {
  date: string;
  income: number;
  expense: number;
  total: number;
}

export interface Averages {
  day: { income: number; expense: number };
  week: { income: number; expense: number };
  month: { income: number; expense: number };
}

export interface CompareData {
  current: Summary;
  previous: Summary & { year: number; month: number };
  change: {
    income: { amount: number; percent: number };
    expense: { amount: number; percent: number };
  };
}

export interface BalanceSeries {
  currentTotal: number;
  series: { date: string; balance: number }[];
}

export interface FilterState {
  types: ('income' | 'expense' | 'transfer')[];
  accountIds: string[];
  categoryIds: string[];
}
