# ИНСТРУКЦИЯ ДЛЯ CLAUDE CODE: Приложение для генерации Invoice

## КОНТЕКСТ
Необходимо создать веб-приложение для генерации профессиональных invoice с возможностью:
- Использования шаблонов (для ежемесячных повторяющихся счетов)
- Редактирования всех данных через удобный UI
- Генерации и скачивания PDF, идеально помещающегося на одну страницу A4
- Сохранения и управления шаблонами

## ТЕХНИЧЕСКИЙ СТЕК
- **Frontend**: React + TypeScript
- **UI библиотека**: Tailwind CSS (для быстрой разработки)
- **PDF генерация**: jsPDF + html2canvas ИЛИ react-pdf
- **State management**: React Context API или Zustand (для простоты)
- **Хранение данных**: LocalStorage (для MVP) с возможностью экспорта/импорта JSON

## АРХИТЕКТУРА ПРИЛОЖЕНИЯ

### 1. Структура файлов
```
invoice-generator/
├── src/
│   ├── components/
│   │   ├── InvoicePreview.tsx        # Превью invoice (точная копия HTML шаблона)
│   │   ├── InvoiceEditor.tsx         # Форма редактирования данных
│   │   ├── TemplateManager.tsx       # Управление шаблонами
│   │   └── PDFGenerator.tsx          # Компонент генерации PDF
│   ├── types/
│   │   └── invoice.types.ts          # TypeScript типы
│   ├── utils/
│   │   ├── pdfGenerator.ts           # Логика генерации PDF
│   │   ├── storage.ts                # Работа с LocalStorage
│   │   └── invoiceCalculations.ts    # Расчеты (VAT, totals)
│   ├── templates/
│   │   └── defaultTemplate.ts        # Дефолтный шаблон данных
│   └── App.tsx                       # Главный компонент
```

### 2. TypeScript типы (invoice.types.ts)

```typescript
export interface CompanyInfo {
  name: string;
  tagline: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  companyCode: string;
  vatNumber: string;
  email: string;
  phone: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  building?: string;
  floor?: string;
  city: string;
  country: string;
  uic: string;
  vatNumber: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  servicePeriodStart: string;
  servicePeriodEnd: string;
}

export interface ServiceItem {
  id: string;
  description: string;
  additionalInfo?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentInfo {
  bankName: string;
  iban: string;
  swift: string;
  currency: string;
  paymentTermsDays: number;
}

export interface ReverseChargeInfo {
  applicable: boolean;
  article44Text: string;
  article13Text: string;
  customerVAT: string;
}

export interface Invoice {
  id: string;
  templateName?: string;
  company: CompanyInfo;
  client: ClientInfo;
  details: InvoiceDetails;
  services: ServiceItem[];
  payment: PaymentInfo;
  reverseCharge: ReverseChargeInfo;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  footerNote?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  invoice: Partial<Invoice>;
  createdAt: string;
  updatedAt: string;
}
```

### 3. Дефолтный шаблон (templates/defaultTemplate.ts)

```typescript
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
```

### 4. Компонент InvoicePreview.tsx

**КРИТИЧЕСКИ ВАЖНО**: Этот компонент должен на 100% повторять HTML и CSS из приложенного файла `CORE-2025-10-03-01_Invoice.html`.

```typescript
import React from 'react';
import { Invoice } from '../types/invoice.types';

interface InvoicePreviewProps {
  invoice: Invoice;
  forPDF?: boolean; // Флаг для PDF генерации
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  forPDF = false 
}) => {
  return (
    <div className="invoice-container" style={forPDF ? pdfStyles : {}}>
      {/* Точная копия HTML структуры из CORE-2025-10-03-01_Invoice.html */}
      {/* HEADER */}
      <div className="header">
        <div className="header-content">
          <div className="company-logo">{invoice.company.name}</div>
          <div className="company-tagline">{invoice.company.tagline}</div>
          <div className="invoice-title">INVOICE</div>
        </div>
      </div>
      
      {/* CONTENT */}
      <div className="content">
        {/* Info Grid - From / Bill To */}
        {/* Invoice Details */}
        {/* Services Table */}
        {/* Total Section */}
        {/* Reverse Charge */}
        {/* Payment Info */}
      </div>
      
      {/* FOOTER */}
      <div className="footer">
        {/* Footer content */}
      </div>
    </div>
  );
};

// Inline стили должны быть ТОЧНОЙ копией CSS из HTML файла
const styles = `
  /* Скопировать все CSS из <style> блока HTML файла */
`;
```

### 5. Компонент InvoiceEditor.tsx

```typescript
import React, { useState } from 'react';
import { Invoice } from '../types/invoice.types';

interface InvoiceEditorProps {
  invoice: Invoice;
  onUpdate: (invoice: Invoice) => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ 
  invoice, 
  onUpdate 
}) => {
  const [editMode, setEditMode] = useState<string>('company'); // company, client, details, services, payment
  
  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
      {/* Табы для переключения секций */}
      <div className="flex gap-2 mb-6 border-b">
        <TabButton 
          active={editMode === 'company'} 
          onClick={() => setEditMode('company')}
        >
          Company Info
        </TabButton>
        <TabButton 
          active={editMode === 'client'} 
          onClick={() => setEditMode('client')}
        >
          Client Info
        </TabButton>
        <TabButton 
          active={editMode === 'details'} 
          onClick={() => setEditMode('details')}
        >
          Invoice Details
        </TabButton>
        <TabButton 
          active={editMode === 'services'} 
          onClick={() => setEditMode('services')}
        >
          Services
        </TabButton>
        <TabButton 
          active={editMode === 'payment'} 
          onClick={() => setEditMode('payment')}
        >
          Payment Info
        </TabButton>
      </div>
      
      {/* Формы для каждой секции */}
      {editMode === 'company' && <CompanyInfoForm invoice={invoice} onUpdate={onUpdate} />}
      {editMode === 'client' && <ClientInfoForm invoice={invoice} onUpdate={onUpdate} />}
      {editMode === 'details' && <InvoiceDetailsForm invoice={invoice} onUpdate={onUpdate} />}
      {editMode === 'services' && <ServicesForm invoice={invoice} onUpdate={onUpdate} />}
      {editMode === 'payment' && <PaymentInfoForm invoice={invoice} onUpdate={onUpdate} />}
    </div>
  );
};

// Подформы с полями ввода
const CompanyInfoForm = ({ invoice, onUpdate }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <InputField 
        label="Company Name" 
        value={invoice.company.name}
        onChange={(value) => onUpdate({
          ...invoice,
          company: { ...invoice.company, name: value }
        })}
      />
      {/* Остальные поля */}
    </div>
  );
};
```

### 6. PDF Generator (utils/pdfGenerator.ts)

**КРИТИЧЕСКИ ВАЖНО**: PDF должен точно помещаться на одну страницу A4 (210mm x 297mm)

```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateInvoicePDF = async (
  elementId: string,
  fileName: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Invoice element not found');

  // Создаем canvas из HTML элемента
  const canvas = await html2canvas(element, {
    scale: 2, // Высокое качество
    useCORS: true,
    logging: false,
    windowWidth: 1200,
    windowHeight: 1697 // Пропорции A4
  });

  // A4 размеры в mm
  const imgWidth = 210; // A4 width in mm
  const imgHeight = 297; // A4 height in mm

  const imgData = canvas.toDataURL('image/png');
  
  // Создаем PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Добавляем изображение на страницу
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
  // Сохраняем
  pdf.save(fileName);
};

// Альтернативный метод с лучшим качеством
export const generateInvoicePDFHighQuality = async (
  invoice: Invoice
): Promise<void> => {
  // Используем библиотеку @react-pdf/renderer для более точного рендеринга
  // Требует создания отдельного компонента InvoicePDFDocument
};
```

### 7. Template Manager (components/TemplateManager.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { InvoiceTemplate } from '../types/invoice.types';
import { saveTemplate, loadTemplates, deleteTemplate } from '../utils/storage';

export const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const handleSaveTemplate = (template: InvoiceTemplate) => {
    saveTemplate(template);
    setTemplates(loadTemplates());
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setTemplates(loadTemplates());
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Invoice Templates</h2>
        <button 
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Create New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <TemplateCard 
            key={template.id}
            template={template}
            onDelete={() => handleDeleteTemplate(template.id)}
            onUse={() => {/* Load template */}}
          />
        ))}
      </div>
    </div>
  );
};
```

### 8. Storage Utils (utils/storage.ts)

```typescript
import { Invoice, InvoiceTemplate } from '../types/invoice.types';

const STORAGE_KEYS = {
  TEMPLATES: 'invoice_templates',
  CURRENT_INVOICE: 'current_invoice',
  SETTINGS: 'app_settings'
};

export const saveTemplate = (template: InvoiceTemplate): void => {
  const templates = loadTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

export const loadTemplates = (): InvoiceTemplate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  return data ? JSON.parse(data) : [];
};

export const deleteTemplate = (id: string): void => {
  const templates = loadTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

export const saveCurrentInvoice = (invoice: Invoice): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_INVOICE, JSON.stringify(invoice));
};

export const loadCurrentInvoice = (): Invoice | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_INVOICE);
  return data ? JSON.parse(data) : null;
};

export const exportData = (): string => {
  return JSON.stringify({
    templates: loadTemplates(),
    currentInvoice: loadCurrentInvoice()
  }, null, 2);
};

export const importData = (jsonString: string): void => {
  const data = JSON.parse(jsonString);
  if (data.templates) {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
  }
  if (data.currentInvoice) {
    saveCurrentInvoice(data.currentInvoice);
  }
};
```

### 9. Главный компонент App.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { Invoice } from './types/invoice.types';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { TemplateManager } from './components/TemplateManager';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { DEFAULT_INVOICE_TEMPLATE } from './templates/defaultTemplate';

type View = 'editor' | 'templates' | 'settings';

function App() {
  const [view, setView] = useState<View>('editor');
  const [invoice, setInvoice] = useState<Invoice>(
    createInvoiceFromTemplate(DEFAULT_INVOICE_TEMPLATE)
  );

  const handleGeneratePDF = async () => {
    const fileName = `${invoice.details.invoiceNumber}_Invoice.pdf`;
    await generateInvoicePDF('invoice-preview', fileName);
  };

  const handleAutoGenerateInvoiceNumber = () => {
    // Логика автогенерации номера: CORE-YYYY-MM-DD-NN
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Получаем последний номер и инкрементируем
    const lastNumber = getLastInvoiceNumber(); // из LocalStorage
    const newNumber = String(lastNumber + 1).padStart(2, '0');
    
    return `CORE-${year}-${month}-${day}-${newNumber}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Навигация */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-4">
            <button onClick={() => setView('editor')}>Editor</button>
            <button onClick={() => setView('templates')}>Templates</button>
            <button onClick={() => setView('settings')}>Settings</button>
          </div>
          <button 
            onClick={handleGeneratePDF}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold"
          >
            Download PDF
          </button>
        </div>
      </nav>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Редактор слева */}
            <div>
              <InvoiceEditor 
                invoice={invoice} 
                onUpdate={setInvoice}
              />
            </div>
            
            {/* Превью справа */}
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div id="invoice-preview">
                  <InvoicePreview invoice={invoice} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {view === 'templates' && <TemplateManager />}
        {view === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}

export default App;
```

## ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ УДОБСТВА

### 1. Автоматическое заполнение следующего месяца
```typescript
const generateNextMonthInvoice = (currentInvoice: Invoice): Invoice => {
  const currentDate = new Date(currentInvoice.details.servicePeriodEnd);
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  return {
    ...currentInvoice,
    details: {
      ...currentInvoice.details,
      invoiceNumber: autoGenerateInvoiceNumber(),
      invoiceDate: formatDate(new Date()),
      servicePeriodStart: formatDate(addDays(currentDate, 1)),
      servicePeriodEnd: formatDate(nextMonth)
    }
  };
};
```

### 2. Валидация данных
```typescript
const validateInvoice = (invoice: Invoice): string[] => {
  const errors: string[] = [];
  
  if (!invoice.details.invoiceNumber) {
    errors.push('Invoice number is required');
  }
  
  if (invoice.services.length === 0) {
    errors.push('At least one service item is required');
  }
  
  if (invoice.total <= 0) {
    errors.push('Total amount must be greater than 0');
  }
  
  // Проверка формата email
  if (invoice.company.email && !isValidEmail(invoice.company.email)) {
    errors.push('Invalid company email format');
  }
  
  return errors;
};
```

### 3. История invoice
```typescript
interface InvoiceHistory {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  date: string;
  status: 'draft' | 'sent' | 'paid';
}

const saveToHistory = (invoice: Invoice) => {
  const history = loadHistory();
  history.push({
    id: invoice.id,
    invoiceNumber: invoice.details.invoiceNumber,
    clientName: invoice.client.name,
    total: invoice.total,
    date: invoice.details.invoiceDate,
    status: 'draft'
  });
  localStorage.setItem('invoice_history', JSON.stringify(history));
};
```

### 4. Экспорт/импорт данных
```typescript
const exportAllData = () => {
  const data = {
    templates: loadTemplates(),
    history: loadHistory(),
    settings: loadSettings(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-data-${Date.now()}.json`;
  a.click();
};
```

### 5. Быстрые действия
- Дублировать invoice
- Создать на основе шаблона
- Отправить по email (через mailto: ссылку)
- Копировать данные клиента из предыдущих invoice

## ПОШАГОВЫЙ ПЛАН РАЗРАБОТКИ

### Phase 1: MVP (Минимальный функционал)
1. Создать структуру проекта React + TypeScript
2. Реализовать типы и интерфейсы
3. Создать InvoicePreview компонент (точная копия HTML)
4. Создать базовый InvoiceEditor с формами
5. Реализовать PDF генерацию (КРИТИЧНО: проверить на A4)
6. Добавить LocalStorage для сохранения текущего invoice

### Phase 2: Templates (Шаблоны)
7. Создать TemplateManager компонент
8. Реализовать CRUD операции для шаблонов
9. Добавить функцию "Create from template"
10. Реализовать импорт/экспорт данных

### Phase 3: Удобство использования
11. Добавить автогенерацию номеров invoice
12. Реализовать функцию "Next month invoice"
13. Добавить валидацию форм
14. Создать историю invoice
15. Добавить keyboard shortcuts

### Phase 4: Polishing
16. Улучшить UI/UX
17. Добавить темную тему (опционально)
18. Оптимизировать производительность
19. Добавить тесты
20. Написать документацию

## КРИТИЧНЫЕ МОМЕНТЫ ДЛЯ PDF

```typescript
// Убедитесь что элемент для PDF имеет правильные размеры
const PDF_CONFIG = {
  width: 210, // mm (A4)
  height: 297, // mm (A4)
  pixelRatio: 2, // Для высокого качества
  
  // Конвертация в пиксели при 96 DPI
  widthPx: 794, // 210mm * 96 / 25.4
  heightPx: 1123 // 297mm * 96 / 25.4
};

// При генерации PDF, временно применить стили:
const prepareDOMForPDF = (element: HTMLElement) => {
  element.style.width = `${PDF_CONFIG.widthPx}px`;
  element.style.minHeight = `${PDF_CONFIG.heightPx}px`;
  element.style.transform = 'scale(1)';
  // ... остальные стили для точного рендеринга
};
```

## ТЕСТИРОВАНИЕ PDF

После каждого изменения проверять:
1. PDF открывается корректно
2. Весь контент помещается на одной странице
3. Нет обрезанного текста
4. Правильные отступы со всех сторон
5. Читабельность текста (не размыто)
6. Цвета отображаются корректно

## КОМАНДЫ ДЛЯ ЗАПУСКА

```bash
# Создание проекта
npm create vite@latest invoice-generator -- --template react-ts

# Установка зависимостей
cd invoice-generator
npm install
npm install jspdf html2canvas
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react # Для иконок
npm install date-fns # Для работы с датами

# Инициализация Tailwind
npx tailwindcss init -p

# Запуск dev сервера
npm run dev

# Билд для продакшена
npm run build
```

## TAILWIND CONFIG

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        'primary-dark': '#004c99',
      }
    },
  },
  plugins: [],
}
```

## ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ (Nice to have)

1. **Multi-currency support**: Добавить выбор валюты (EUR, USD, GBP)
2. **Tax templates**: Разные налоговые режимы для разных стран
3. **Logo upload**: Возможность загрузить логотип компании
4. **Color themes**: Несколько цветовых схем на выбор
5. **Email integration**: Отправка invoice напрямую через SMTP
6. **Multi-language**: Интерфейс на русском/английском
7. **Print directly**: Функция печати без сохранения PDF
8. **QR code**: QR код для оплаты
9. **Digital signature**: Возможность добавить цифровую подпись
10. **Cloud sync**: Опциональная синхронизация через Firebase/Supabase

## ИНСТРУКЦИЯ ДЛЯ CLAUDE CODE

Скопируйте эту инструкцию в Claude Code и используйте следующий промпт:

---

**ПРОМПТ ДЛЯ CLAUDE CODE:**

```
Создай веб-приложение для генерации профессиональных invoice согласно приложенной инструкции.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
1. Визуальный дизайн InvoicePreview должен быть ТОЧНОЙ копией приложенного HTML файла (CORE-2025-10-03-01_Invoice.html) - скопируй весь CSS и структуру без изменений
2. PDF должен ИДЕАЛЬНО помещаться на одну страницу A4 (210mm x 297mm)
3. Все данные должны редактироваться через удобный UI
4. Должна быть система шаблонов для повторяющихся invoice
5. LocalStorage для хранения данных с возможностью экспорта/импорта

Начни с Phase 1 (MVP) из инструкции. После завершения каждой фазы спроси меня о переходе к следующей.

Используй React + TypeScript + Tailwind CSS как указано в техническом стеке.

Приложи файл CORE-2025-10-03-01_Invoice.html как reference для дизайна.
```

---

## ФАЙЛЫ ДЛЯ ПРИЛОЖЕНИЯ

Вместе с этой инструкцией передай Claude Code:
1. `CORE-2025-10-03-01_Invoice.html` - reference для визуального дизайна

Удачи с разработкой! 🚀
