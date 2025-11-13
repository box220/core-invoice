import { Invoice } from '../types/invoice.types';

export const DEFAULT_INVOICE_TEMPLATE: Partial<Invoice> = {
  company: {
    name: 'MB Core vienas',
    tagline: 'Enterprise Transformation & Consulting',
    address: 'Gedimino pr. 27 - 2/1',
    city: 'Vilnius',
    postalCode: 'LT-01104',
    country: 'Lithuania',
    companyCode: '307316648',
    vatNumber: 'LT100018884619',
    email: 'hello@coreone.io',
    phone: '+370 673 70655'
  },
  client: {
    name: 'SOPHARMA TRADING AD',
    address: '5 Lachezar Stanchev Str., Sopharma Business Towers',
    building: 'Building A',
    floor: 'Floor 12',
    city: 'Izgrev district, Sofia',
    country: 'Bulgaria',
    uic: '103267194',
    vatNumber: 'BG131473733'
  },
  services: [
    {
      id: '1',
      description: 'Consulting Services – Monthly Fixed Fee',
      additionalInfo: 'Under Agreement dated October 3, 2025',
      quantity: 1,
      unitPrice: 5231.25,
      amount: 5231.25
    }
  ],
  payment: {
    bankName: 'Swedbank, AB',
    iban: 'LT72 7300 0101 9632 6954',
    swift: 'HABALT22',
    currency: 'EUR',
    paymentTermsDays: 10
  },
  reverseCharge: {
    applicable: true,
    article44Text: 'Article 44 of Council Directive 2006/112/EC',
    article13Text: 'Article 13 of the Lithuanian VAT Law',
    customerVAT: 'BG131473733'
  },
  vatRate: 0,
  footerNote: 'Thank you for your business'
};
