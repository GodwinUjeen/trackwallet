import { AccountType } from '../../core/models';

export const ACCOUNT_TYPE_OPTIONS: {
  value: AccountType;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: 'bank', label: 'Bank account', icon: 'account_balance', color: '#E53935' },
  { value: 'food_wallet', label: 'Food wallet', icon: 'restaurant', color: '#4CAF50' },
  { value: 'credit_card', label: 'Credit card', icon: 'credit_card', color: '#7E57C2' },
];

export function accountTypeMeta(type?: AccountType | string | null) {
  return ACCOUNT_TYPE_OPTIONS.find((o) => o.value === type) || ACCOUNT_TYPE_OPTIONS[0];
}

export function accountTypeLabel(type?: AccountType | string | null): string {
  return accountTypeMeta(type).label;
}

/** Available credit = limit + balance (expenses reduce balance). */
export function creditAvailable(account: {
  balance: number;
  creditLimit?: number | null;
}): number | null {
  if (account.creditLimit == null || !Number.isFinite(account.creditLimit)) return null;
  return account.creditLimit + account.balance;
}

