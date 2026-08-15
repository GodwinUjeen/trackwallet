const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function monthLabel(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

export function shiftMonth(month: number, year: number, delta: number): { month: number; year: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export function monthBounds(month: number, year: number): { from: string; to: string } {
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { from: from.toISOString(), to: to.toISOString() };
}

export function formatDayHeader(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${d.getDate()} ${days[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export const ICON_COLORS = [
  '#E53935', '#EC407A', '#AB47BC', '#7E57C2', '#5C6BC0', '#1E88E5', '#039BE5', '#00ACC1',
  '#00897B', '#43A047', '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00', '#F4511E',
  '#6D4C41', '#78909C', '#546E7A', '#EF5350', '#66BB6A', '#29B6F6', '#FF7043', '#9E9E9E',
];

export const ICON_GROUPS: { label: string; icons: string[] }[] = [
  {
    label: 'General',
    icons: [
      'currency_rupee', 'payments', 'account_balance', 'account_balance_wallet', 'savings',
      'credit_card', 'receipt_long', 'calculate', 'percent', 'trending_up', 'bar_chart',
      'pie_chart', 'show_chart', 'sync', 'more_horiz',
    ],
  },
  {
    label: 'Shopping',
    icons: [
      'shopping_cart', 'shopping_bag', 'local_mall', 'sell', 'checkroom', 'watch',
      'devices', 'laptop', 'phone_iphone', 'card_giftcard',
    ],
  },
  {
    label: 'Home & Utilities',
    icons: [
      'home', 'weekend', 'bed', 'kitchen', 'lightbulb', 'wifi', 'bolt', 'water_drop',
      'ac_unit', 'cleaning_services', 'key', 'build',
    ],
  },
  {
    label: 'Food & Drinks',
    icons: [
      'restaurant', 'local_pizza', 'lunch_dining', 'coffee', 'local_cafe', 'wine_bar',
      'local_bar', 'icecream', 'outdoor_grill', 'bakery_dining', 'nutrition', 'dinner_dining',
      'storefront', 'local_shipping',
    ],
  },
  {
    label: 'Transport',
    icons: [
      'directions_car', 'directions_bus', 'two_wheeler', 'flight', 'train', 'directions_boat',
      'local_gas_station', 'local_parking', 'luggage', 'hotel',
    ],
  },
  {
    label: 'Health & Lifestyle',
    icons: [
      'fitness_center', 'sports_martial_arts', 'self_improvement', 'favorite',
      'volunteer_activism', 'medical_services', 'medication', 'spa', 'movie', 'school',
      'face', 'pets', 'alarm', 'star',
    ],
  },
];
