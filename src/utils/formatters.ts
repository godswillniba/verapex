
export const formatAmount = (amount: number | string, showSymbol = true) => {
  if (!amount) return '0.00';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return showSymbol ? formatted : formatted;
};
