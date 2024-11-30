/**
 * Format number with commas
 * @param {number} number - The number to format
 * @returns {string} - The formatted number
 */
export const formatNumber = (number) => {
    return number % 1 === 0 ? number.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : number.toLocaleString('th-TH');
};

/**
 * Format currency with commas and currency symbol
 * @param {number} number - The number to format
 * @returns {string} - The formatted currency
 */
export const formatCurrency = (number) => {
    return number % 1 === 0 ? number.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : number.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
};
