# Invoice Generator

Professional invoice generation web application with PDF export, template management, and local storage.

## Features ✨

### Phase 1 (MVP) - ✅ Completed

- **Invoice Preview**: Pixel-perfect copy of the reference design
- **Invoice Editor**: Tabbed interface for editing all invoice data
  - Company Information
  - Client Information
  - Invoice Details & Dates
  - Services & Items
  - Payment Information
- **PDF Generation**: Export to A4-sized PDF with perfect formatting
- **LocalStorage**: Auto-save current invoice with export/import functionality
- **Automatic Calculations**: Real-time calculation of subtotals, VAT, and totals
- **Reverse Charge Support**: Built-in VAT reverse charge mechanism
- **Auto-numbering**: Automatic invoice number generation (CORE-YYYY-MM-DD-NN format)

## Tech Stack 🛠️

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **jsPDF + html2canvas** for PDF generation
- **date-fns** for date formatting
- **lucide-react** for icons

## Getting Started 🚀

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage 📝

1. **Edit Invoice Data**: Use the tabbed editor on the left to modify all invoice fields
2. **Preview**: See real-time preview on the right side
3. **Generate PDF**: Click "Download PDF" to export as A4-sized PDF
4. **New Invoice Number**: Click "New Invoice #" to generate a new sequential invoice number
5. **Export Data**: Save all templates and invoices as JSON
6. **Import Data**: Load previously exported data

## Key Components

### InvoicePreview
Exact replica of the reference HTML design with all CSS inline for perfect PDF rendering.

### InvoiceEditor
Tabbed form interface with sections:
- Invoice Details (number, dates, reverse charge settings)
- Company Info (name, address, VAT, etc.)
- Client Info (name, address, UIC, VAT, etc.)
- Services (add/remove/edit service items)
- Payment Info (bank details, currency, terms)

### PDF Generation
- A4 format (210mm x 297mm)
- High-quality rendering (2x scale)
- Perfect single-page fit
- Preserves all styling and formatting

## Data Storage

All data is stored in browser's LocalStorage:
- `invoice_templates`: Saved invoice templates
- `current_invoice`: Current working invoice
- `last_invoice_number`: Invoice number counter

Export/import functionality allows backing up and transferring data between devices.

## Invoice Number Format

Automatic generation: `CORE-YYYY-MM-DD-NN`

Example: `CORE-2025-11-13-01`

- CORE: Company prefix
- YYYY-MM-DD: Current date
- NN: Sequential number (01, 02, 03...)

## Coming in Future Phases

### Phase 2: Templates
- Save invoice as template
- Template management UI
- Create invoice from template
- Template library

### Phase 3: Enhanced UX
- "Next Month" invoice generator
- Form validation
- Invoice history
- Keyboard shortcuts
- Search and filter

### Phase 4: Polish
- Dark theme
- Performance optimizations
- Unit tests
- Enhanced documentation

## Project Structure

```
invoice-generator/
├── src/
│   ├── components/
│   │   ├── InvoicePreview.tsx    # Preview component (exact HTML copy)
│   │   └── InvoiceEditor.tsx     # Editing forms
│   ├── types/
│   │   └── invoice.types.ts      # TypeScript interfaces
│   ├── utils/
│   │   ├── pdfGenerator.ts       # PDF generation logic
│   │   ├── storage.ts            # LocalStorage utilities
│   │   └── invoiceCalculations.ts # Math calculations
│   ├── templates/
│   │   └── defaultTemplate.ts    # Default invoice data
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Critical Requirements ✅

1. ✅ **Visual Design**: InvoicePreview is an exact copy of the reference HTML
2. ✅ **PDF A4 Format**: PDF fits perfectly on one A4 page (210mm x 297mm)
3. ✅ **Editable UI**: All data fields are editable through intuitive forms
4. ✅ **Template System**: Foundation ready for Phase 2 template management
5. ✅ **LocalStorage**: Auto-save with export/import functionality

## Development Notes

- The InvoicePreview component contains all CSS inline to ensure PDF rendering accuracy
- PDF generation temporarily applies specific dimensions to the preview element
- All calculations are automatically triggered on data changes
- The app auto-saves to LocalStorage on every change

## License

MIT

## Credits

Developed following the detailed specifications in `Invoice_Generator_Instructions_for_Claude_Code.md`
