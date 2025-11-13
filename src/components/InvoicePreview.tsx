import React from 'react';
import { Invoice } from '../types/invoice.types';
import { format } from 'date-fns';

interface InvoicePreviewProps {
  invoice: Invoice;
  forPDF?: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, forPDF = false }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const buildingFloorText = [
    invoice.client.building,
    invoice.client.floor
  ].filter(Boolean).join(', ');

  return (
    <div className="invoice-container" style={forPDF ? { width: '794px', minHeight: '1123px' } : {}}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @page {
          size: A4;
          margin: 0;
        }

        .invoice-container {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          color: #1a1a1a;
          line-height: 1.4;
          background: white;
          padding: 0;
          margin: 0;
          min-height: 297mm;
          display: flex;
          flex-direction: column;
        }

        .header {
          background: linear-gradient(135deg, #0066cc 0%, #004c99 100%);
          color: white;
          padding: 20px 35px 18px;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          z-index: 0;
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .company-logo {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .company-tagline {
          font-size: 11px;
          opacity: 0.9;
          font-weight: 300;
        }

        .invoice-title {
          font-size: 28px;
          font-weight: 200;
          margin-top: 12px;
          letter-spacing: -1px;
        }

        .content {
          padding: 20px 35px;
          flex: 1;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 18px;
        }

        .info-section h3 {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #6c757d;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .info-section p {
          font-size: 11px;
          color: #1a1a1a;
          line-height: 1.45;
        }

        .info-section strong {
          font-weight: 600;
          display: block;
          font-size: 13px;
          margin-bottom: 5px;
          color: #0066cc;
        }

        .invoice-details {
          background: #f5f5f7;
          padding: 12px 20px;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 5px 0;
          border-bottom: 0.5px solid #e5e5e7;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: 11px;
          color: #6c757d;
          font-weight: 500;
        }

        .detail-value {
          font-size: 11px;
          color: #1a1a1a;
          font-weight: 600;
        }

        .services-table {
          width: 100%;
          margin: 16px 0;
          border-collapse: collapse;
        }

        .services-table thead {
          background: #f5f5f7;
        }

        .services-table th {
          text-align: left;
          padding: 10px 14px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6c757d;
          font-weight: 700;
          vertical-align: bottom;
        }

        .services-table td {
          padding: 14px 14px;
          font-size: 12px;
          border-bottom: 0.5px solid #e5e5e7;
          vertical-align: bottom;
        }

        .services-table tbody tr:last-child td {
          border-bottom: none;
        }

        .text-right {
          text-align: right;
        }

        .total-section {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 2px solid #e5e5e7;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 7px 14px;
          font-size: 12px;
        }

        .total-row.grand-total {
          background: #0066cc;
          color: white;
          border-radius: 6px;
          margin-top: 8px;
          font-weight: 600;
          font-size: 15px;
        }

        .total-row.grand-total span:last-child {
          font-size: 17px;
          font-weight: 700;
        }

        .payment-info {
          background: #f5f5f7;
          padding: 14px 20px;
          border-radius: 6px;
          margin-top: 16px;
        }

        .payment-info h3 {
          font-size: 13px;
          margin-bottom: 12px;
          color: #1a1a1a;
          font-weight: 600;
        }

        .payment-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .payment-item {
          display: flex;
          flex-direction: column;
        }

        .payment-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6c757d;
          margin-bottom: 3px;
          font-weight: 600;
        }

        .payment-value {
          font-size: 11px;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
          font-weight: 500;
        }

        .reverse-charge-text {
          margin-top: 14px;
          padding: 8px 12px;
          background: #fff3e0;
          border-left: 3px solid #ff9800;
          border-radius: 4px;
          font-size: 10px;
          line-height: 1.5;
          color: #333;
        }

        .footer {
          background: #f5f5f7;
          padding: 14px 35px;
          text-align: center;
          color: #6c757d;
          font-size: 10px;
          border-top: 0.5px solid #e5e5e7;
          margin-top: auto;
        }

        .footer-note {
          margin-top: 8px;
          padding: 8px;
          background: white;
          border-radius: 4px;
          font-style: italic;
          font-size: 9px;
        }

        @media print {
          body {
            background: white;
            padding: 0;
          }

          .invoice-container {
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>

      <div className="header">
        <div className="header-content">
          <div className="company-logo">{invoice.company.name}</div>
          <div className="company-tagline">{invoice.company.tagline}</div>
          <div className="invoice-title">INVOICE</div>
        </div>
      </div>

      <div className="content">
        <div className="info-grid">
          <div className="info-section">
            <h3>From</h3>
            <strong>{invoice.company.name}</strong>
            <p>
              {invoice.company.address}, {invoice.company.postalCode} {invoice.company.city}, {invoice.company.country}<br />
              Company Code: {invoice.company.companyCode} | VAT: {invoice.company.vatNumber}<br />
              Email: {invoice.company.email} | Tel: {invoice.company.phone}
            </p>
          </div>

          <div className="info-section">
            <h3>Bill To</h3>
            <strong>{invoice.client.name}</strong>
            <p>
              {invoice.client.address},<br />
              {buildingFloorText && <>{buildingFloorText}, </>}
              {invoice.client.city}, {invoice.client.country}<br />
              UIC: {invoice.client.uic} | VAT: {invoice.client.vatNumber}
            </p>
          </div>
        </div>

        <div className="invoice-details">
          <div className="detail-row">
            <span className="detail-label">Invoice Number</span>
            <span className="detail-value">{invoice.details.invoiceNumber}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Invoice Date</span>
            <span className="detail-value">{formatDate(invoice.details.invoiceDate)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Service Period</span>
            <span className="detail-value">
              {formatDate(invoice.details.servicePeriodStart)} – {formatDate(invoice.details.servicePeriodEnd)}
            </span>
          </div>
        </div>

        <table className="services-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Amount ({invoice.payment.currency})</th>
            </tr>
          </thead>
          <tbody>
            {invoice.services.map(service => (
              <tr key={service.id}>
                <td>
                  <strong>{service.description}</strong><br />
                  {service.additionalInfo && (
                    <span style={{ fontSize: '11px', color: '#6c757d' }}>{service.additionalInfo}</span>
                  )}
                </td>
                <td className="text-right">{service.quantity}</td>
                <td className="text-right">{formatCurrency(service.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-section">
          <div className="total-row">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="total-row">
            <span>VAT Rate</span>
            <span>{invoice.vatRate}% {invoice.reverseCharge.applicable && '(Reverse charge)'}</span>
          </div>
          <div className="total-row">
            <span>VAT Amount</span>
            <span>{formatCurrency(invoice.vatAmount)}</span>
          </div>
          <div className="total-row grand-total">
            <span>Total Amount Due</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {invoice.reverseCharge.applicable && (
          <div className="reverse-charge-text">
            <strong>Reverse charge.</strong> VAT to be accounted for by the recipient under {invoice.reverseCharge.article44Text} and {invoice.reverseCharge.article13Text}. Customer VAT: {invoice.reverseCharge.customerVAT}
          </div>
        )}

        <div className="payment-info">
          <h3>Payment Information</h3>
          <div className="payment-grid">
            <div className="payment-item">
              <span className="payment-label">Bank Name</span>
              <span className="payment-value">{invoice.payment.bankName}</span>
            </div>
            <div className="payment-item">
              <span className="payment-label">Currency</span>
              <span className="payment-value">{invoice.payment.currency}</span>
            </div>
            <div className="payment-item">
              <span className="payment-label">IBAN</span>
              <span className="payment-value">{invoice.payment.iban}</span>
            </div>
            <div className="payment-item">
              <span className="payment-label">SWIFT/BIC</span>
              <span className="payment-value">{invoice.payment.swift}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>{invoice.footerNote || 'Thank you for your business'}</p>
        <div className="footer-note">
          Payment due within {invoice.payment.paymentTermsDays} business days from invoice receipt.
          Please include invoice number <strong>{invoice.details.invoiceNumber}</strong> in payment reference.
        </div>
      </div>
    </div>
  );
};
