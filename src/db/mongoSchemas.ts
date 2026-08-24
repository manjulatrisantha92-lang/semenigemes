// =========================================================================
// MongoDB Atlas & Mongoose Schemas for WCS Inventory Invoice System
// Ready for direct deployment to MongoDB Atlas / Vercel Serverless / Node.js
// =========================================================================

export const mongoSchemaDefinitions = `
// 1. User Schema (Collection: users)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'owner', 'user'], default: 'user' },
  avatarUrl: { type: String },
  phoneNumber: { type: String },
}, { timestamps: true });

// 2. Product Schema (Collection: products)
const ProductSchema = new mongoose.Schema({
  itemCode: { type: String, required: true, unique: true, index: true },
  barcode: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  category: { 
    type: String, 
    enum: ['Rings', 'Necklaces & Pendants', 'Earrings', 'Bangles & Bracelets', 'Chains', 'Loose Gemstones', 'Rough Gemstones', 'Custom Jewelry', 'Bridal Sets', 'Men\'s Jewelry'],
    required: true,
    index: true
  },
  description: { type: String },
  imageUrl: { type: String },
  metalPurity: { type: String, required: true },
  grossWeight: { type: Number, default: 0 },
  netGoldWeight: { type: Number, default: 0 },
  gemstoneDetails: [{
    gemType: { type: String, required: true },
    caratWeight: { type: Number, required: true },
    cutShape: { type: String },
    color: { type: String },
    clarity: { type: String },
    origin: { type: String, default: 'Ratnapura, Sri Lanka' },
    dimensions: { type: String },
    treatment: { type: String, default: 'Unheated (Natural)' },
    certificateRef: { type: String }
  }],
  totalCaratWeight: { type: Number, default: 0 },
  costPrice: { type: Number, required: true }, // LKR
  sellingPrice: { type: Number, required: true }, // LKR
  stockQuantity: { type: Number, default: 1, min: 0 },
  minStockAlert: { type: Number, default: 1 },
  workshopStatus: { type: String, enum: ['in_stock', 'in_workshop', 'repair', 'polishing', 'custom_craft'], default: 'in_stock' },
  notes: { type: String },
  isFeaturedPromotion: { type: Boolean, default: false },
  promotionPrice: { type: Number },
  facebookPostUrl: { type: String }
}, { timestamps: true });

// 3. Customer Schema (Collection: customers)
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  contactNumber: { type: String, required: true, index: true },
  whatsappNumber: { type: String, required: true },
  email: { type: String },
  nicPassport: { type: String },
  address: { type: String, required: true },
  city: { type: String, default: 'Colombo' },
  customerType: { type: String, enum: ['Retail', 'Wholesale', 'VIP', 'Tourist'], default: 'Retail' },
  notes: { type: String },
  totalPurchases: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 }
}, { timestamps: true });

// 4. Workshop Schema (Collection: workshops)
const WorkshopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String },
  address: { type: String, required: true },
  specialty: { type: String, required: true },
  activeOrdersCount: { type: Number, default: 0 },
  completedOrdersCount: { type: Number, default: 0 },
  totalAdvancesPaid: { type: Number, default: 0 },
  totalSettledPaid: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  notes: { type: String }
}, { timestamps: true });

// 5. Workshop Employee Schema (Collection: workshop_employees)
const WorkshopEmployeeSchema = new mongoose.Schema({
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  workshopName: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  nicNumber: { type: String, required: true },
  dailyRate: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  joinedDate: { type: String },
  status: { type: String, enum: ['active', 'on_leave', 'inactive'], default: 'active' }
}, { timestamps: true });

// 6. Jewelry Order Schema (Collection: orders)
const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  jewelryType: { type: String, required: true },
  itemName: { type: String, required: true },
  designDescription: { type: String, required: true },
  designImageUrl: { type: String }, // Uploaded JPG design graph
  metalPurity: { type: String, required: true },
  estimatedGoldWeight: { type: Number, default: 0 },
  gemstoneSpecs: { type: String },
  allocatedGemstonesSummary: { type: String },
  quantity: { type: Number, default: 1 },
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  workshopName: { type: String, required: true },
  assignedEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkshopEmployee' },
  assignedEmployeeName: { type: String },
  estimatedMakingCost: { type: Number, default: 0 },
  advancePaidByCustomer: { type: Number, default: 0 },
  advancePaidToWorkshop: { type: Number, default: 0 },
  agreedPriceToCustomer: { type: Number, required: true },
  orderDate: { type: String, required: true },
  requiredDeliveryDate: { type: String, required: true },
  actualCompletionDate: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Sent to Workshop', 'In Progress', 'Completed', 'Returned from Workshop', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  workshopNotes: { type: String },
  cancellationReason: { type: String }
}, { timestamps: true });

// 7. Invoice Schema (Collection: invoices)
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  date: { type: String, required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String },
  customerNIC: { type: String },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    itemCode: { type: String, required: true },
    barcode: { type: String },
    name: { type: String, required: true },
    category: { type: String },
    gemSummary: { type: String },
    grossWeight: { type: Number },
    caratWeight: { type: Number },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  taxPercentage: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
  balanceDue: { type: Number, default: 0 },
  paymentMethod: { type: String, required: true },
  paymentRef: { type: String },
  notes: { type: String },
  issuedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issuedByUserName: { type: String, required: true },
  status: { type: String, enum: ['paid', 'partial', 'refunded', 'cancelled'], default: 'paid' },
  hasCertificateGenerated: { type: Boolean, default: false },
  returnedItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number },
    refundAmount: { type: Number },
    returnDate: { type: String },
    reason: { type: String }
  }]
}, { timestamps: true });

// 8. Jewelry Certificate Schema (Collection: certificates)
const CertificateSchema = new mongoose.Schema({
  certificateNumber: { type: String, required: true, unique: true, index: true },
  date: { type: String, required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  invoiceNumber: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  itemCode: { type: String, required: true },
  barcode: { type: String },
  jewelryName: { type: String, required: true },
  metalPurity: { type: String, required: true },
  grossWeight: { type: Number, required: true },
  netGoldWeight: { type: Number },
  gemstoneType: { type: String, required: true },
  caratWeight: { type: Number, required: true },
  cutShape: { type: String, required: true },
  color: { type: String, required: true },
  clarity: { type: String, required: true },
  origin: { type: String, default: 'Ratnapura, Sri Lanka (Ceylon)' },
  dimensions: { type: String },
  treatment: { type: String, default: 'Unheated (Natural)' },
  remarks: { type: String },
  itemImageUrl: { type: String, required: true },
  gemologistName: { type: String, required: true },
  gemologistTitle: { type: String, required: true },
  qrVerificationCode: { type: String, required: true },
  useTemplateBackground: { type: Boolean, default: false }
}, { timestamps: true });

// 9. Workshop Advance Payment Schema (Collection: workshop_advances)
const WorkshopAdvanceSchema = new mongoose.Schema({
  paymentNumber: { type: String, required: true, unique: true },
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  workshopName: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderNumber: { type: String },
  amount: { type: Number, required: true },
  paymentDate: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  paymentPurpose: { type: String, required: true },
  receiptRef: { type: String },
  notes: { type: String },
  recordedBy: { type: String, required: true }
}, { timestamps: true });

// 10. Employee Payment Schema (Collection: employee_payments)
const EmployeePaymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, required: true, unique: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkshopEmployee', required: true },
  employeeName: { type: String, required: true },
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  workshopName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: String, required: true },
  paymentType: { type: String, required: true },
  workDescription: { type: String },
  paymentMethod: { type: String, required: true },
  notes: { type: String },
  recordedBy: { type: String, required: true }
}, { timestamps: true });

// 11. Purchase Order Schema (Collection: purchase_orders)
const PurchaseOrderSchema = new mongoose.Schema({
  purchaseNumber: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  supplierPhone: { type: String, required: true },
  supplierAddress: { type: String },
  date: { type: String, required: true },
  items: [{
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    gemType: { type: String },
    caratWeight: { type: Number },
    goldWeightGrams: { type: Number },
    metalPurity: { type: String },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    totalCost: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Partial', 'Due'], default: 'Paid' },
  status: { type: String, enum: ['Received & Stocked', 'Pending Delivery', 'Returned'], default: 'Received & Stocked' },
  notes: { type: String }
}, { timestamps: true });

// 12. Purchase Return Schema (Collection: purchase_returns)
const PurchaseReturnSchema = new mongoose.Schema({
  returnNumber: { type: String, required: true, unique: true },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  purchaseNumber: { type: String, required: true },
  supplierName: { type: String, required: true },
  returnDate: { type: String, required: true },
  returnedItems: [{
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    refundAmount: { type: Number, required: true },
    reason: { type: String }
  }],
  totalRefundAmount: { type: Number, required: true },
  refundStatus: { type: String, enum: ['Received', 'Pending Credit'], default: 'Received' },
  notes: { type: String }
}, { timestamps: true });

// 13. System Settings Schema (Collection: settings)
const SettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'WCS Gems & Jewelry (Pvt) Ltd' },
  tagline: { type: String },
  businessRegistrationNumber: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String, default: 'Sri Lanka' },
  telephone: { type: String },
  whatsappNumber: { type: String },
  email: { type: String },
  website: { type: String },
  currencySymbol: { type: String, default: 'Rs.' },
  currencyCode: { type: String, default: 'LKR' },
  logoJpgUrl: { type: String },
  invoiceBackgroundJpgUrl: { type: String },
  enableInvoiceBackground: { type: Boolean, default: false },
  certificateBackgroundJpgUrl: { type: String },
  enableCertificateBackground: { type: Boolean, default: false },
  invoicePrintMarginTop: { type: Number, default: 10 },
  invoicePrintMarginBottom: { type: Number, default: 10 },
  invoicePrintMarginLeft: { type: Number, default: 10 },
  invoicePrintMarginRight: { type: Number, default: 10 },
  invoicePrefix: { type: String, default: 'WCS-INV-2026-' },
  orderPrefix: { type: String, default: 'WCS-ORD-2026-' },
  certificatePrefix: { type: String, default: 'WCS-CERT-2026-' },
  purchasePrefix: { type: String, default: 'WCS-PO-2026-' },
  defaultGemologistName: { type: String },
  defaultGemologistTitle: { type: String },
  invoiceTerms: { type: String },
  certificateDisclaimer: { type: String }
}, { timestamps: true });
`;
