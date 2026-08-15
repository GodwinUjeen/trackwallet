const DEFAULT_ACCOUNTS = [
  { name: 'Pluxe', icon: 'restaurant', color: '#4CAF50', accountType: 'food_wallet', sortOrder: 0 },
  { name: 'HDFC', icon: 'account_balance', color: '#E53935', accountType: 'bank', sortOrder: 1 },
  { name: 'IOB', icon: 'account_balance', color: '#1E88E5', accountType: 'bank', sortOrder: 2 },
];

const EXPENSE_CATEGORIES = [
  {
    name: 'Food & Drinks',
    icon: 'restaurant',
    color: '#FF9800',
    subcategories: [
      { name: 'Groceries', icon: 'shopping_cart', color: '#E91E63' },
      { name: 'Restaurant', icon: 'storefront', color: '#9C27B0' },
      { name: 'Delivery', icon: 'local_shipping', color: '#2196F3' },
      { name: 'Swiggy', icon: 'local_pizza', color: '#FF5722' },
      { name: 'Snacks', icon: 'lunch_dining', color: '#03A9F4' },
      { name: 'Juice', icon: 'local_cafe', color: '#607D8B' },
      { name: 'Refreshments', icon: 'coffee', color: '#EC407A' },
      { name: 'Fruits', icon: 'nutrition', color: '#FBC02D' },
      { name: 'Lunch/break fast/dinner', icon: 'dinner_dining', color: '#66BB6A' },
      { name: 'Midnight cravings', icon: 'alarm', color: '#EF5350' },
    ],
  },
  { name: 'Shopping', icon: 'shopping_bag', color: '#E91E63' },
  { name: 'Housing', icon: 'home', color: '#5C6BC0' },
  {
    name: 'Bills',
    icon: 'calculate',
    color: '#00897B',
    subcategories: [
      { name: 'Internet', icon: 'wifi', color: '#26A69A' },
      { name: 'Subscriptions', icon: 'subscriptions', color: '#00897B' },
      { name: 'Healthcare', icon: 'medical_services', color: '#43A047' },
      { name: 'Split', icon: 'call_split', color: '#7E57C2' },
    ],
  },
  {
    name: 'Transport',
    icon: 'directions_bus',
    color: '#78909C',
    subcategories: [
      { name: 'Public', icon: 'directions_bus', color: '#78909C' },
      { name: 'Long Distance', icon: 'train', color: '#546E7A' },
    ],
  },
  {
    name: 'Vehicle',
    icon: 'directions_car',
    color: '#7E57C2',
    subcategories: [
      { name: 'Fuel', icon: 'local_gas_station', color: '#7E57C2' },
      { name: 'Parking', icon: 'local_parking', color: '#9575CD' },
      { name: 'Maintenance', icon: 'build', color: '#5E35B1' },
      { name: 'EMI', icon: 'payments', color: '#673AB7' },
    ],
  },
  {
    name: 'Leisure',
    icon: 'star',
    color: '#D500F9',
    subcategories: [
      { name: 'Self care', icon: 'spa', color: '#D500F9' },
      { name: 'Entertainment', icon: 'movie', color: '#AA00FF' },
    ],
  },
  { name: 'Other', icon: 'more_horiz', color: '#78909C' },
  { name: 'To Mom', icon: 'face', color: '#76FF03' },
  {
    name: 'Savings',
    icon: 'savings',
    color: '#29B6F6',
    subcategories: [
      { name: 'SIP', icon: 'trending_up', color: '#29B6F6' },
      { name: 'RD', icon: 'account_balance_wallet', color: '#0288D1' },
      { name: 'FD', icon: 'lock', color: '#0277BD' },
    ],
  },
  { name: 'Rotation', icon: 'sync', color: '#FF9800' },
  {
    name: 'Education',
    icon: 'school',
    color: '#43A047',
    subcategories: [
      { name: 'Stationary', icon: 'edit', color: '#66BB6A' },
      { name: 'Fee', icon: 'payments', color: '#2E7D32' },
    ],
  },
  { name: 'Debt', icon: 'payments', color: '#E53935' },
  { name: 'Vacations', icon: 'flight', color: '#FBC02D' },
  { name: 'Credit card', icon: 'credit_card', color: '#E53935' },
  {
    name: 'Gifts',
    icon: 'card_giftcard',
    color: '#AB47BC',
  },
];

const INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'currency_rupee', color: '#43A047' },
  { name: 'Gifts', icon: 'volunteer_activism', color: '#AB47BC' },
  { name: 'Other', icon: 'more_horiz', color: '#78909C' },
  { name: 'Rotation', icon: 'sync', color: '#FF9800' },
  { name: 'Food coupon', icon: 'restaurant', color: '#FFA726' },
  { name: 'Debt', icon: 'payments', color: '#E53935' },
  { name: 'Refund', icon: 'payments', color: '#42A5F5' },
  { name: 'Split', icon: 'percent', color: '#EC407A' },
  { name: 'From Mom', icon: 'face', color: '#76FF03' },
  { name: 'Interest', icon: 'percent', color: '#1E88E5' },
  { name: 'Groww', icon: 'bar_chart', color: '#1565C0' },
];

module.exports = { DEFAULT_ACCOUNTS, EXPENSE_CATEGORIES, INCOME_CATEGORIES };
