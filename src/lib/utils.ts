/**
 * Formats a number as USD currency (e.g., $1,234.00)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a date string or Date object to a readable format (e.g., Mar 15, 2026)
 */
export const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Generates an order ID (e.g., ORD-001)
 */
export const formatOrderId = (id: string | number): string => {
  const num = typeof id === 'number' ? id : parseInt(id.toString().slice(-3)) || id;
  return `ORD-${num.toString().padStart(3, '0')}`;
};

/**
 * Generates an invoice ID (e.g., INV-1001)
 */
export const formatInvoiceId = (id: string | number): string => {
  const num = typeof id === 'number' ? id : parseInt(id.toString().slice(-4)) || id;
  return `INV-${(1000 + Number(num)).toString()}`;
};
