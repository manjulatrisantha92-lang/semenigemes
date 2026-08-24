// ==========================================
// WCS Inventory Invoice - Core Type Definitions
// Jewelry, Gemstone, Workshop & Invoicing
// ==========================================

export type UserRole = 'admin' | 'owner' | 'user';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  createdAt: string;
}

export type ProductCategory = string;

export type GemstoneType =
  | 'Blue Sapphire'
  | 'Yellow Sapphire'
  | 'Pink Sapphire'
  | 'Padparadscha'
  | 'Ruby'
  | 'Emerald'
  | 'Diamond'
  | 'Ceylon Alexandrite'
  | 'Cat\'s Eye (Chrysoberyl)'
  | 'Spinel'
  | 'Tsavorite Garnet'
  | 'Aquamarine'
  | 'Tourmaline'
  | 'Zircon'
  | 'Topaz'
  | 'Amethyst'
  | 'Moonstone'
  | 'Other / Synthetic';

export type MetalPurity =
  | '24K Yellow Gold (999)'
  | '22K Sri Lankan Gold (916)'
  | '18K Yellow Gold (750)'
  | '18K White Gold (750)'
  | '18K Rose Gold (750)'
  | '14K Gold (585)'
  | 'Platinum 950'
  | '925 Sterling Silver'
  | 'Not Applicable (Loose Gem)';

export type WorkshopStatus = 'in_stock' | 'in_workshop' | 'repair' | 'polishing' | 'custom_craft';

export interface GemstoneDetail {
  gemType: GemstoneType;
  caratWeight: number; // in carats (cts)
  cutShape: string; // e.g., 'Cushion Mixed Cut', 'Oval Brilliant', 'Round Brilliant', 'Emerald Cut'
  color: string; // e.g., 'Cornflower Blue', 'Royal Blue', 'Pigeon Blood Red', 'Vivid Yellow'
  clarity: string; // e.g., 'VVS (Eye Clean)', 'VS', 'SI', 'Included'
  origin: string; // e.g., 'Ratnapura, Sri Lanka', 'Elahera, Sri Lanka', 'Madagascar', 'Burma'
  dimensions?: string; // e.g., '8.4 x 6.2 x 4.1 mm'
  treatment?: string; // e.g., 'Unheated (Natural)', 'Heat Treated', 'Beryllium Treated'
  certificateRef?: string;
}

export interface Product {
  id: string;
  itemCode: string; // e.g., 'WCS-GEM-0104'
  barcode: string; // e.g., '89420010401'
  name: string;
  category: ProductCategory;
  description: string;
  imageUrl: string;
  additionalImages?: string[]; // Multiple photos / angles
  metalPurity: MetalPurity;
  grossWeight: number; // in grams
  netGoldWeight?: number; // in grams
  makingCharges?: number; // LKR
  gemstoneDetails: GemstoneDetail[];
  totalCaratWeight?: number;
  costPrice: number; // in LKR (Rs.)
  sellingPrice: number; // in LKR (Rs.)
  stockQuantity: number;
  minStockAlert: number;
  workshopStatus: WorkshopStatus;
  assignedWorkshopId?: string;
  notes?: string;
  isFeaturedPromotion?: boolean;
  promotionPrice?: number;
  facebookPostUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  contactNumber: string;
  whatsappNumber: string;
  email?: string;
  nicPassport?: string;
  address: string;
  city: string;
  customerType: 'Retail' | 'Wholesale' | 'VIP' | 'Tourist';
  notes?: string;
  totalPurchases: number;
  totalSpent: number; // LKR
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  itemCode: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  gemSummary?: string;
  grossWeight?: number;
  caratWeight?: number;
  quantity: number;
  unitPrice: number; // LKR
  discountPercentage: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export type PaymentMethod =
  | 'Cash'
  | 'Card'
  | 'Customer Credit'
  | 'LankaQR / Online'
  | 'Bank Transfer / Cheque'
  | 'Bank Transfer'
  | 'Online / Card'
  | 'Cheque'
  | 'Other'
  | 'Visa / Master Card'
  | 'Koko / Mintpay'
  | 'Credit / Advance Balance';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., 'WCS-INV-2026-0042'
  date: string;
  time?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNIC?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  cashReceived?: number;
  changeGiven?: number;
  cardType?: string;
  cardLast4?: string;
  lankaQrRef?: string;
  isKotOrDraft?: boolean;
  notes?: string;
  issuedByUserId: string;
  issuedByUserName: string;
  status: 'paid' | 'partial' | 'refunded' | 'cancelled';
  hasCertificateGenerated?: boolean;
  returnedItems?: {
    productId: string;
    quantity: number;
    refundAmount: number;
    returnDate: string;
    reason: string;
  }[];
  createdAt: string;
}

export interface JewelryCertificate {
  id: string;
  certificateNumber: string; // e.g., 'WCS-CERT-2026-0089'
  date: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName: string;
  productId?: string;
  itemCode: string;
  barcode: string;
  jewelryName: string;
  metalPurity: MetalPurity;
  grossWeight: number; // grams
  netGoldWeight?: number; // grams
  gemstoneType: GemstoneType;
  caratWeight: number; // cts
  cutShape: string;
  color: string;
  clarity: string;
  origin: string;
  dimensions?: string;
  treatment: string;
  remarks: string;
  itemImageUrl: string;
  gemologistName: string;
  gemologistTitle: string;
  qrVerificationCode: string;
  useTemplateBackground: boolean;
  createdAt: string;
}

export interface Workshop {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  specialty: 'Gem Setting' | 'Gold Casting' | 'Hand Filigree' | 'Lapidary & Cutting' | 'Polishing & Rhodium' | 'Full Jewelry Craft';
  activeOrdersCount: number;
  completedOrdersCount: number;
  totalAdvancesPaid: number;
  totalSettledPaid: number;
  rating?: number;
  notes?: string;
  createdAt: string;
}

export interface WorkshopEmployee {
  id: string;
  workshopId: string;
  workshopName: string;
  name: string;
  role: 'Master Craftsman' | 'Gem Setter' | 'Gold Smelter' | 'Polisher' | 'Cad Designer' | 'Apprentice';
  phone: string;
  nicNumber: string;
  dailyRate: number; // LKR
  pieceRateMultiplier?: number;
  totalEarned: number;
  totalPaid: number;
  joinedDate: string;
  status: 'active' | 'on_leave' | 'inactive';
}

export type OrderStatus =
  | 'Pending'
  | 'Sent to Workshop'
  | 'In Progress'
  | 'Completed'
  | 'Returned from Workshop'
  | 'Cancelled';

export interface JewelryOrder {
  id: string;
  orderNumber: string; // e.g., 'WCS-ORD-2026-015'
  customerId: string;
  customerName: string;
  customerPhone: string;
  jewelryType: ProductCategory;
  itemName: string;
  designDescription: string;
  designImageUrl: string; // JPG uploaded design graph
  metalPurity: MetalPurity;
  estimatedGoldWeight: number; // grams
  gemstoneSpecs: string; // e.g., '1.5ct Oval Royal Blue Sapphire + 12 Diamonds'
  allocatedGemstonesSummary?: string;
  quantity: number;
  workshopId: string;
  workshopName: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  estimatedMakingCost: number; // LKR
  advancePaidByCustomer: number; // LKR
  advancePaidToWorkshop: number; // LKR
  agreedPriceToCustomer: number; // LKR
  orderDate: string;
  requiredDeliveryDate: string;
  actualCompletionDate?: string;
  status: OrderStatus;
  workshopNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopAdvancePayment {
  id: string;
  paymentNumber: string; // e.g., 'WCS-ADV-0043'
  workshopId: string;
  workshopName: string;
  orderId?: string;
  orderNumber?: string;
  amount: number; // LKR
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentPurpose: 'Order Advance' | 'Gold Bullion Advance' | 'Settlement of Making Charges' | 'Worker Advance';
  receiptRef?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface EmployeePayment {
  id: string;
  paymentNumber: string; // e.g., 'WCS-EMP-0091'
  employeeId: string;
  employeeName: string;
  workshopId: string;
  workshopName: string;
  amount: number; // LKR
  paymentDate: string;
  paymentType: 'Daily Wage' | 'Piece Rate Work' | 'Overtime' | 'Bonus / Festival Advance';
  workDescription?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  purchaseNumber: string; // e.g., 'WCS-PO-2026-0031'
  supplierName: string;
  supplierPhone: string;
  supplierAddress?: string;
  date: string;
  items: {
    itemName: string;
    category: ProductCategory;
    gemType?: GemstoneType;
    caratWeight?: number;
    goldWeightGrams?: number;
    metalPurity?: MetalPurity;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Due';
  status: 'Received & Stocked' | 'Pending Delivery' | 'Returned';
  notes?: string;
  createdAt: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string; // e.g., 'WCS-PRET-2026-007'
  purchaseId: string;
  purchaseNumber: string;
  supplierName: string;
  returnDate: string;
  returnedItems: {
    itemName: string;
    quantity: number;
    refundAmount: number;
    reason: string;
  }[];
  totalRefundAmount: number;
  refundStatus: 'Received' | 'Pending Credit';
  notes?: string;
  createdAt: string;
}

export interface PromotionCampaign {
  id: string;
  title: string;
  description: string;
  productIds: string[];
  bannerImageUrl?: string;
  discountPercentage?: number;
  facebookPostUrl?: string;
  facebookPostContent?: string;
  whatsappMessageTemplate?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'ended';
}

export interface SystemSettings {
  companyName: string;
  tagline: string;
  businessRegistrationNumber: string;
  address: string;
  city: string;
  country: string;
  telephone: string;
  whatsappNumber: string;
  email: string;
  website: string;
  currencySymbol: string; // e.g., 'Rs.' or 'LKR'
  currencyCode: string; // 'LKR'
  
  // Custom JPG Uploads
  logoJpgUrl: string;
  invoiceBackgroundJpgUrl: string;
  enableInvoiceBackground: boolean;
  invoiceBackgroundOpacity: number; // 0.1 - 1.0
  certificateBackgroundJpgUrl: string;
  enableCertificateBackground: boolean;
  
  // Print & Margin Configuration
  invoicePrintMarginTop: number; // mm
  invoicePrintMarginBottom: number; // mm
  invoicePrintMarginLeft: number; // mm
  invoicePrintMarginRight: number; // mm
  invoiceHeaderHeight: number; // mm
  
  // Invoice numbering
  invoicePrefix: string;
  orderPrefix: string;
  certificatePrefix: string;
  purchasePrefix: string;
  
  // Gemologist
  defaultGemologistName: string;
  defaultGemologistTitle: string;
  
  // Terms & Footer
  invoiceTerms: string;
  certificateDisclaimer: string;
}

export interface BackupLog {
  id: string;
  date: string;
  filename: string;
  recordsCount: number;
  fileSizeBytes: number;
  exportedBy: string;
}

export type ExpenseCategory =
  | 'Electricity & Utilities'
  | 'Showroom Rent & Rates'
  | 'Workshop Consumables & Acids'
  | 'Gem Testing & Lab Fees'
  | 'Staff Wages & Meals'
  | 'Security & CCTV'
  | 'Marketing & Advertising'
  | 'Machinery & Tool Maintenance'
  | 'Office & Stationery'
  | 'Transportation & Fuel'
  | 'Insurance & Audit'
  | 'Miscellaneous Expenses';

export interface Expense {
  id: string;
  expenseNumber: string; // e.g., 'WCS-EXP-2026-0045'
  title: string;
  category: ExpenseCategory;
  amount: number; // LKR
  expenseDate: string;
  payeeName: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string; // Bill / Cheque / Ref #
  receiptImageUrl?: string; // JPG photo of bill/receipt
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  paymentNumber: string; // e.g., 'WCS-SPAY-2026-0018'
  supplierName: string;
  supplierPhone?: string;
  purchaseId?: string;
  purchaseNumber?: string;
  amount: number; // LKR
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string; // Cheque No / Bank Slip Ref
  receiptImageUrl?: string; // Photo of cheque / bank deposit slip
  notes?: string;
  recordedBy: string;
  createdAt: string;
}
