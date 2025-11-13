import { Invoice, ServiceItem } from '../types/invoice.types';

export const calculateServiceAmount = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

export const calculateSubtotal = (services: ServiceItem[]): number => {
  return services.reduce((sum, service) => sum + service.amount, 0);
};

export const calculateVAT = (subtotal: number, vatRate: number): number => {
  return (subtotal * vatRate) / 100;
};

export const calculateTotal = (subtotal: number, vatAmount: number): number => {
  return subtotal + vatAmount;
};

export const recalculateInvoice = (invoice: Invoice): Invoice => {
  // Recalculate service amounts
  const services = invoice.services.map(service => ({
    ...service,
    amount: calculateServiceAmount(service.quantity, service.unitPrice)
  }));

  // Calculate totals
  const subtotal = calculateSubtotal(services);
  const vatAmount = invoice.reverseCharge.applicable ? 0 : calculateVAT(subtotal, invoice.vatRate);
  const total = calculateTotal(subtotal, vatAmount);

  return {
    ...invoice,
    services,
    subtotal,
    vatAmount,
    total
  };
};
