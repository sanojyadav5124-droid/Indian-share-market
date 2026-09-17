/**
 * Formats a number to Indian Rupee currency format (e.g. ₹1,23,456.78)
 */
export function formatINR(value: number, includeDecimals = true): string {
  if (isNaN(value)) return '₹0.00';
  
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  const parts = absValue.toFixed(includeDecimals ? 2 : 0).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] !== undefined ? `.${parts[1]}` : '';

  // Indian number grouping: last 3 digits, then pairs of 2 digits
  let result = '';
  if (integerPart.length <= 3) {
    result = integerPart;
  } else {
    const last3 = integerPart.substring(integerPart.length - 3);
    const otherDigits = integerPart.substring(0, integerPart.length - 3);
    const formattedOther = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${formattedOther},${last3}`;
  }

  return `${isNegative ? '-' : ''}₹${result}${decimalPart}`;
}

/**
 * Formats large amounts into Lakhs or Crores (e.g. ₹14.50 L, ₹1.25 Cr)
 */
export function formatCompactINR(value: number): string {
  if (isNaN(value)) return '₹0';
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  if (absValue >= 10000000) {
    // 1 Crore = 10,000,000
    const crores = (absValue / 10000000).toFixed(2);
    return `${isNegative ? '-' : ''}₹${crores} Cr`;
  }
  if (absValue >= 100000) {
    // 1 Lakh = 100,000
    const lakhs = (absValue / 100000).toFixed(2);
    return `${isNegative ? '-' : ''}₹${lakhs} L`;
  }
  return formatINR(value, false);
}

/**
 * Formats percentage with sign and 2 decimal places
 */
export function formatPercent(value: number): string {
  if (isNaN(value)) return '0.00%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Formats date to 'DD MMM YYYY'
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
