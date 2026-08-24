import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  Product,
  Customer,
  Workshop,
  WorkshopEmployee,
  JewelryOrder,
  Invoice,
  JewelryCertificate,
  WorkshopAdvancePayment,
  EmployeePayment,
  PurchaseOrder,
  PurchaseReturn,
  PromotionCampaign,
  SystemSettings,
  BackupLog,
  OrderStatus,
  Expense,
  SupplierPayment,
} from '../types';
import {
  initialUsers,
  initialSettings,
  initialCategories,
  initialProducts,
  initialCustomers,
  initialWorkshops,
  initialWorkshopEmployees,
  initialOrders,
  initialInvoices,
  initialCertificates,
  initialAdvances,
  initialEmployeePayments,
  initialPurchases,
  initialPurchaseReturns,
  initialPromotions,
  initialBackupLogs,
  initialExpenses,
  initialSupplierPayments,
} from '../data/initialData';

export type NavigationPage =
  | 'dashboard'
  | 'invoice_pos'
  | 'invoices_history'
  | 'return_invoice'
  | 'certificates'
  | 'inventory'
  | 'barcode_generator'
  | 'workshops'
  | 'workshop_employees'
  | 'create_order'
  | 'pending_orders'
  | 'completed_orders'
  | 'cancelled_orders'
  | 'workshop_advances'
  | 'purchases'
  | 'supplier_payments'
  | 'purchase_returns'
  | 'expenses'
  | 'customers'
  | 'promotions'
  | 'reports'
  | 'users'
  | 'settings'
  | 'backup_restore'
  | 'mongodb_schema';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  // Auth & Session
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (username: string, role: UserRole) => boolean;
  logout: () => void;
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updatedFields: Partial<User>) => void;
  updateUserPassword: (userId: string, newPassword: string, currentPassword?: string) => { success: boolean; message: string };
  deleteUser: (id: string) => void;

  // Categories
  categories: string[];
  addCategory: (name: string) => boolean;
  updateCategory: (oldName: string, newName: string) => boolean;
  deleteCategory: (name: string, reassignToCategory?: string) => boolean;

  // Settings
  settings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;

  // Inventory / Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (productsList: Partial<Product>[]) => number;

  // Invoices & Sales
  invoices: Invoice[];
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  returnInvoiceItem: (invoiceId: string, productId: string, quantity: number, refundAmount: number, reason: string) => void;

  // Certificates
  certificates: JewelryCertificate[];
  createCertificate: (cert: Omit<JewelryCertificate, 'id' | 'createdAt'>) => JewelryCertificate;
  deleteCertificate: (id: string) => void;

  // Workshops & Employees
  workshops: Workshop[];
  addWorkshop: (workshop: Omit<Workshop, 'id' | 'createdAt' | 'activeOrdersCount' | 'completedOrdersCount' | 'totalAdvancesPaid' | 'totalSettledPaid'>) => void;
  updateWorkshop: (id: string, workshop: Partial<Workshop>) => void;
  deleteWorkshop: (id: string) => void;

  workshopEmployees: WorkshopEmployee[];
  addWorkshopEmployee: (emp: Omit<WorkshopEmployee, 'id' | 'totalEarned' | 'totalPaid'>) => void;
  updateWorkshopEmployee: (id: string, emp: Partial<WorkshopEmployee>) => void;
  deleteWorkshopEmployee: (id: string) => void;

  // Orders
  orders: JewelryOrder[];
  createOrder: (order: Omit<JewelryOrder, 'id' | 'createdAt' | 'updatedAt'>) => JewelryOrder;
  updateOrderStatus: (id: string, status: OrderStatus, notes?: string, cancellationReason?: string) => void;
  updateOrder: (id: string, order: Partial<JewelryOrder>) => void;
  deleteOrder: (id: string) => void;

  // Workshop Advances & Employee Payments
  advances: WorkshopAdvancePayment[];
  addAdvance: (advance: Omit<WorkshopAdvancePayment, 'id' | 'createdAt'>) => void;

  employeePayments: EmployeePayment[];
  addEmployeePayment: (payment: Omit<EmployeePayment, 'id' | 'createdAt'>) => void;

  // Purchases, Supplier Payments & Returns
  purchases: PurchaseOrder[];
  addPurchase: (purchase: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  supplierPayments: SupplierPayment[];
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id' | 'createdAt'>) => void;
  deleteSupplierPayment: (id: string) => void;
  purchaseReturns: PurchaseReturn[];
  addPurchaseReturn: (pret: Omit<PurchaseReturn, 'id' | 'createdAt'>) => void;

  // Operating Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalSpent'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;

  // Promotions
  promotions: PromotionCampaign[];
  updatePromotion: (id: string, promo: Partial<PromotionCampaign>) => void;

  // Backup & Restore
  backupLogs: BackupLog[];
  exportFullBackupJson: () => string;
  restoreFromBackupJson: (jsonString: string) => { success: boolean; message: string };
  resetToSampleData: () => void;

  // Toasts & Active Modal Print Target
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Active Print Targets
  activePrintInvoice: Invoice | null;
  setActivePrintInvoice: (inv: Invoice | null) => void;
  activePrintCertificate: JewelryCertificate | null;
  setActivePrintCertificate: (cert: JewelryCertificate | null) => void;
  activePrintReport: { type: string; title: string; data?: any } | null;
  setActivePrintReport: (rep: { type: string; title: string; data?: any } | null) => void;

  // Formatters & Currency
  formatCurrency: (amount: number) => string;

  // Fullscreen Mode
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'wcs_inventory_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Helper for localStorage loading
  const loadStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  // State Declarations with localStorage Persistence
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    return loadStored<User | null>('currentUser', initialUsers[0]);
  });

  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [users, setUsers] = useState<User[]>(() => loadStored('users', initialUsers));
  const [categories, setCategories] = useState<string[]>(() => loadStored('categories', initialCategories));
  const [settings, setSettings] = useState<SystemSettings>(() => loadStored('settings', initialSettings));
  const [products, setProducts] = useState<Product[]>(() => loadStored('products', initialProducts));
  const [customers, setCustomers] = useState<Customer[]>(() => loadStored('customers', initialCustomers));
  const [workshops, setWorkshops] = useState<Workshop[]>(() => loadStored('workshops', initialWorkshops));
  const [workshopEmployees, setWorkshopEmployees] = useState<WorkshopEmployee[]>(() => loadStored('employees', initialWorkshopEmployees));
  const [orders, setOrders] = useState<JewelryOrder[]>(() => loadStored('orders', initialOrders));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStored('invoices', initialInvoices));
  const [certificates, setCertificates] = useState<JewelryCertificate[]>(() => loadStored('certificates', initialCertificates));
  const [advances, setAdvances] = useState<WorkshopAdvancePayment[]>(() => loadStored('advances', initialAdvances));
  const [employeePayments, setEmployeePayments] = useState<EmployeePayment[]>(() => loadStored('employee_payments', initialEmployeePayments));
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => loadStored('purchases', initialPurchases));
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => loadStored('supplier_payments', initialSupplierPayments));
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() => loadStored('purchase_returns', initialPurchaseReturns));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadStored('expenses', initialExpenses));
  const [promotions, setPromotions] = useState<PromotionCampaign[]>(() => loadStored('promotions', initialPromotions));
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(() => loadStored('backup_logs', initialBackupLogs));

  // Print Targets
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);
  const [activePrintCertificate, setActivePrintCertificate] = useState<JewelryCertificate | null>(null);
  const [activePrintReport, setActivePrintReport] = useState<{ type: string; title: string; data?: any } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fullscreen Mode State & Handlers
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
    }
    return false;
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isFull) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if ((docEl as any).webkitRequestFullscreen) {
          await (docEl as any).webkitRequestFullscreen();
        } else if ((docEl as any).mozRequestFullScreen) {
          await (docEl as any).mozRequestFullScreen();
        } else if ((docEl as any).msRequestFullscreen) {
          await (docEl as any).msRequestFullscreen();
        }
        showToast('Entered fullscreen mode', 'info');
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        showToast('Exited fullscreen mode', 'info');
      }
    } catch (err: any) {
      console.warn('Fullscreen error:', err);
      // In some iframe environments, fullscreen API might throw permissions policy error
      showToast('Fullscreen toggled (or restricted by browser iframe)', 'info');
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'workshops', JSON.stringify(workshops));
  }, [workshops]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'employees', JSON.stringify(workshopEmployees));
  }, [workshopEmployees]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'advances', JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'employee_payments', JSON.stringify(employeePayments));
  }, [employeePayments]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'supplier_payments', JSON.stringify(supplierPayments));
  }, [supplierPayments]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'purchase_returns', JSON.stringify(purchaseReturns));
  }, [purchaseReturns]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'backup_logs', JSON.stringify(backupLogs));
  }, [backupLogs]);

  // Auth Operations
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
  };

  const login = (username: string, _role: UserRole): boolean => {
    const found = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (found) {
      setCurrentUserState(found);
      showToast(`Welcome back, ${found.name}!`, 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUserState(null);
    showToast('Logged out securely.', 'info');
  };

  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    showToast(`User ${newUser.name} created successfully.`, 'success');
  };

  const updateUser = (id: string, updatedFields: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedFields } : u))
    );
    if (currentUser?.id === id) {
      setCurrentUserState((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }
    showToast('User account updated successfully.', 'success');
  };

  const updateUserPassword = (
    userId: string,
    newPassword: string,
    currentPassword?: string
  ): { success: boolean; message: string } => {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found in system.' };
    }

    if (currentPassword !== undefined && user.password && user.password !== currentPassword) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }

    const updatedUser = { ...user, password: newPassword };
    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    if (currentUser?.id === userId) {
      setCurrentUserState(updatedUser);
    }

    showToast(`Password for ${user.name} changed successfully.`, 'success');
    return { success: true, message: 'Password updated successfully!' };
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      showToast('Cannot delete the last remaining user account.', 'error');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('User account deleted.', 'info');
  };

  // Categories
  const addCategory = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Category name cannot be empty.', 'error');
      return false;
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Category "${trimmed}" already exists.`, 'error');
      return false;
    }
    setCategories((prev) => [...prev, trimmed]);
    showToast(`Category "${trimmed}" added successfully.`, 'success');
    return true;
  };

  const updateCategory = (oldName: string, newName: string): boolean => {
    const trimmedNew = newName.trim();
    if (!trimmedNew) {
      showToast('Category name cannot be empty.', 'error');
      return false;
    }
    if (oldName !== trimmedNew && categories.some((c) => c.toLowerCase() === trimmedNew.toLowerCase())) {
      showToast(`Category "${trimmedNew}" already exists.`, 'error');
      return false;
    }

    setCategories((prev) => prev.map((c) => (c === oldName ? trimmedNew : c)));
    // Also update any existing products categorized under oldName
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: trimmedNew } : p))
    );

    showToast(`Category renamed from "${oldName}" to "${trimmedNew}".`, 'success');
    return true;
  };

  const deleteCategory = (name: string, reassignToCategory?: string): boolean => {
    if (categories.length <= 1) {
      showToast('Cannot delete the last remaining category in the catalog.', 'error');
      return false;
    }

    const fallback = reassignToCategory || categories.find((c) => c !== name) || 'General';
    setCategories((prev) => prev.filter((c) => c !== name));

    // Reassign products that used this category
    setProducts((prev) =>
      prev.map((p) => (p.category === name ? { ...p, category: fallback } : p))
    );

    showToast(`Category "${name}" deleted. Items reassigned to "${fallback}".`, 'info');
    return true;
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('System settings updated successfully.', 'success');
  };

  // Products
  const addProduct = (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProd: Product = {
      ...p,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Item ${newProd.name} added to inventory.`, 'success');
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updatedFields, updatedAt: new Date().toISOString() }
          : p
      )
    );
    showToast('Product details updated.', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed from inventory.', 'info');
  };

  const importProducts = (imported: Partial<Product>[]): number => {
    let count = 0;
    const now = new Date().toISOString();
    const newItems: Product[] = [];

    imported.forEach((item) => {
      if (item.name && item.itemCode) {
        newItems.push({
          id: 'prod-' + Date.now() + Math.random().toString(36).substring(2, 6),
          itemCode: item.itemCode || `WCS-${Math.floor(1000 + Math.random() * 9000)}`,
          barcode: item.barcode || `${Math.floor(89420000000 + Math.random() * 999999)}`,
          name: item.name,
          category: item.category || 'Rings',
          description: item.description || '',
          imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
          metalPurity: item.metalPurity || '18K Yellow Gold (750)',
          grossWeight: item.grossWeight || 0,
          netGoldWeight: item.netGoldWeight || 0,
          gemstoneDetails: item.gemstoneDetails || [],
          totalCaratWeight: item.totalCaratWeight || 0,
          costPrice: item.costPrice || 0,
          sellingPrice: item.sellingPrice || 0,
          stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : 1,
          minStockAlert: item.minStockAlert || 1,
          workshopStatus: 'in_stock',
          notes: item.notes || 'Imported via CSV/Excel template',
          createdAt: now,
          updatedAt: now,
        });
        count++;
      }
    });

    if (newItems.length > 0) {
      setProducts((prev) => [...newItems, ...prev]);
      showToast(`Successfully imported ${count} items into inventory.`, 'success');
    }
    return count;
  };

  // Invoices & Sales
  const createInvoice = (inv: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const newInvoice: Invoice = {
      ...inv,
      id: 'inv-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    // 1. Deduct stock for all items
    setProducts((prev) =>
      prev.map((prod) => {
        const line = newInvoice.items.find((i) => i.productId === prod.id);
        if (line) {
          const newQty = Math.max(0, prod.stockQuantity - line.quantity);
          return {
            ...prod,
            stockQuantity: newQty,
            workshopStatus: newQty === 0 ? 'custom_craft' : prod.workshopStatus,
          };
        }
        return prod;
      })
    );

    // 2. Update Customer total spent & purchases
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newInvoice.customerId) {
          return {
            ...c,
            totalPurchases: c.totalPurchases + 1,
            totalSpent: c.totalSpent + newInvoice.grandTotal,
          };
        }
        return c;
      })
    );

    // 3. Save invoice
    setInvoices((prev) => [newInvoice, ...prev]);
    showToast(`Invoice ${newInvoice.invoiceNumber} created & printed!`, 'success');
    return newInvoice;
  };

  const returnInvoiceItem = (
    invoiceId: string,
    productId: string,
    quantity: number,
    refundAmount: number,
    reason: string
  ) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    // 1. Restore product stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stockQuantity: p.stockQuantity + quantity,
          };
        }
        return p;
      })
    );

    // 2. Record returned item in invoice
    const returnRecord = {
      productId,
      quantity,
      refundAmount,
      returnDate: new Date().toISOString().split('T')[0],
      reason,
    };

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const prevReturns = inv.returnedItems || [];
          return {
            ...inv,
            returnedItems: [...prevReturns, returnRecord],
            status: 'refunded',
          };
        }
        return inv;
      })
    );

    showToast(`Processed sales return for Invoice #${invoice.invoiceNumber}. Stock restored.`, 'info');
  };

  // Certificates
  const createCertificate = (cert: Omit<JewelryCertificate, 'id' | 'createdAt'>): JewelryCertificate => {
    const newCert: JewelryCertificate = {
      ...cert,
      id: 'cert-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCertificates((prev) => [newCert, ...prev]);

    // Mark invoice if present
    if (cert.invoiceId) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === cert.invoiceId ? { ...inv, hasCertificateGenerated: true } : inv))
      );
    }

    showToast(`Gemological Certificate ${newCert.certificateNumber} generated!`, 'success');
    return newCert;
  };

  const deleteCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    showToast('Certificate record removed.', 'info');
  };

  // Workshops
  const addWorkshop = (ws: Omit<Workshop, 'id' | 'createdAt' | 'activeOrdersCount' | 'completedOrdersCount' | 'totalAdvancesPaid' | 'totalSettledPaid'>) => {
    const newWs: Workshop = {
      ...ws,
      id: 'ws-' + Date.now(),
      activeOrdersCount: 0,
      completedOrdersCount: 0,
      totalAdvancesPaid: 0,
      totalSettledPaid: 0,
      createdAt: new Date().toISOString(),
    };
    setWorkshops((prev) => [...prev, newWs]);
    showToast(`Workshop ${newWs.name} added.`, 'success');
  };

  const updateWorkshop = (id: string, updated: Partial<Workshop>) => {
    setWorkshops((prev) => prev.map((w) => (w.id === id ? { ...w, ...updated } : w)));
    showToast('Workshop updated.', 'success');
  };

  const deleteWorkshop = (id: string) => {
    setWorkshops((prev) => prev.filter((w) => w.id !== id));
    showToast('Workshop removed.', 'info');
  };

  // Workshop Employees
  const addWorkshopEmployee = (emp: Omit<WorkshopEmployee, 'id' | 'totalEarned' | 'totalPaid'>) => {
    const newEmp: WorkshopEmployee = {
      ...emp,
      id: 'wse-' + Date.now(),
      totalEarned: 0,
      totalPaid: 0,
    };
    setWorkshopEmployees((prev) => [...prev, newEmp]);
    showToast(`Artisan/Employee ${newEmp.name} added.`, 'success');
  };

  const updateWorkshopEmployee = (id: string, updated: Partial<WorkshopEmployee>) => {
    setWorkshopEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    showToast('Employee updated.', 'success');
  };

  const deleteWorkshopEmployee = (id: string) => {
    setWorkshopEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast('Employee removed.', 'info');
  };

  // Orders
  const createOrder = (ord: Omit<JewelryOrder, 'id' | 'createdAt' | 'updatedAt'>): JewelryOrder => {
    const newOrd: JewelryOrder = {
      ...ord,
      id: 'ord-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrd, ...prev]);

    // Update workshop order counts
    setWorkshops((prev) =>
      prev.map((w) =>
        w.id === newOrd.workshopId
          ? {
              ...w,
              activeOrdersCount: w.activeOrdersCount + 1,
              totalAdvancesPaid: w.totalAdvancesPaid + newOrd.advancePaidToWorkshop,
            }
          : w
      )
    );

    // If advance was paid to workshop, auto-record advance ledger
    if (newOrd.advancePaidToWorkshop > 0) {
      addAdvance({
        paymentNumber: `WCS-ADV-${Math.floor(1000 + Math.random() * 9000)}`,
        workshopId: newOrd.workshopId,
        workshopName: newOrd.workshopName,
        orderId: newOrd.id,
        orderNumber: newOrd.orderNumber,
        amount: newOrd.advancePaidToWorkshop,
        paymentDate: newOrd.orderDate,
        paymentMethod: 'Cash',
        paymentPurpose: 'Order Advance',
        notes: `Initial advance for Order #${newOrd.orderNumber}`,
        recordedBy: currentUser?.name || 'Admin',
      });
    }

    showToast(`Custom Jewelry Order ${newOrd.orderNumber} created!`, 'success');
    return newOrd;
  };

  const updateOrderStatus = (id: string, status: OrderStatus, notes?: string, cancellationReason?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const now = new Date().toISOString();
          const isCompleted = status === 'Completed';
          return {
            ...o,
            status,
            workshopNotes: notes || o.workshopNotes,
            cancellationReason: cancellationReason || o.cancellationReason,
            actualCompletionDate: isCompleted ? now.split('T')[0] : o.actualCompletionDate,
            updatedAt: now,
          };
        }
        return o;
      })
    );
    showToast(`Order status updated to "${status}".`, 'info');
  };

  const updateOrder = (id: string, updated: Partial<JewelryOrder>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updated, updatedAt: new Date().toISOString() } : o))
    );
    showToast('Order details updated.', 'success');
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    showToast('Order deleted.', 'info');
  };

  // Workshop Advances & Employee Payments
  const addAdvance = (adv: Omit<WorkshopAdvancePayment, 'id' | 'createdAt'>) => {
    const newAdv: WorkshopAdvancePayment = {
      ...adv,
      id: 'adv-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAdvances((prev) => [newAdv, ...prev]);

    // Update workshop total advances
    setWorkshops((prev) =>
      prev.map((w) =>
        w.id === adv.workshopId
          ? {
              ...w,
              totalAdvancesPaid: w.totalAdvancesPaid + adv.amount,
            }
          : w
      )
    );

    showToast(`Workshop advance payment #${newAdv.paymentNumber} recorded.`, 'success');
  };

  const addEmployeePayment = (p: Omit<EmployeePayment, 'id' | 'createdAt'>) => {
    const newP: EmployeePayment = {
      ...p,
      id: 'empp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setEmployeePayments((prev) => [newP, ...prev]);

    // Update employee paid total
    setWorkshopEmployees((prev) =>
      prev.map((e) =>
        e.id === p.employeeId
          ? {
              ...e,
              totalPaid: e.totalPaid + p.amount,
            }
          : e
      )
    );

    showToast(`Employee wage payment #${newP.paymentNumber} logged.`, 'success');
  };

  // Purchases, Supplier Payments & Returns
  const addPurchase = (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    const newPO: PurchaseOrder = {
      ...po,
      id: 'po-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setPurchases((prev) => [newPO, ...prev]);
    showToast(`Purchase order ${newPO.purchaseNumber} recorded. Stock updated.`, 'success');
  };

  const addSupplierPayment = (payment: Omit<SupplierPayment, 'id' | 'createdAt'>) => {
    const newPayment: SupplierPayment = {
      ...payment,
      id: 'spay-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setSupplierPayments((prev) => [newPayment, ...prev]);

    // If payment is linked to a purchase order, automatically update paidAmount & status on that PO
    if (payment.purchaseId || payment.purchaseNumber) {
      setPurchases((prev) =>
        prev.map((po) => {
          const isMatch =
            (payment.purchaseId && po.id === payment.purchaseId) ||
            (payment.purchaseNumber && po.purchaseNumber === payment.purchaseNumber);

          if (isMatch) {
            const newPaid = (po.paidAmount || 0) + payment.amount;
            const newStatus: 'Paid' | 'Partial' | 'Due' =
              newPaid >= po.totalAmount ? 'Paid' : newPaid > 0 ? 'Partial' : 'Due';
            return {
              ...po,
              paidAmount: newPaid,
              paymentStatus: newStatus,
            };
          }
          return po;
        })
      );
    }

    showToast(
      `Supplier Payment #${newPayment.paymentNumber} of ${formatCurrency(newPayment.amount)} to ${newPayment.supplierName} recorded.`,
      'success'
    );
  };

  const deleteSupplierPayment = (id: string) => {
    setSupplierPayments((prev) => prev.filter((p) => p.id !== id));
    showToast('Supplier payment record removed.', 'info');
  };

  const addPurchaseReturn = (pret: Omit<PurchaseReturn, 'id' | 'createdAt'>) => {
    const newPret: PurchaseReturn = {
      ...pret,
      id: 'pret-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setPurchaseReturns((prev) => [newPret, ...prev]);
    showToast(`Purchase return ${newPret.returnNumber} recorded.`, 'info');
  };

  // Operating Expenses
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: 'exp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Operating expense "${newExpense.title}" recorded.`, 'success');
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp)));
    showToast('Expense record updated.', 'success');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    showToast('Expense record removed.', 'info');
  };

  // Customers
  const addCustomer = (cust: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalSpent'>): Customer => {
    const newCust: Customer = {
      ...cust,
      id: 'cust-' + Date.now(),
      totalPurchases: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    showToast(`Customer ${newCust.name} added.`, 'success');
    return newCust;
  };

  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Customer record updated.', 'success');
  };

  // Promotions
  const updatePromotion = (id: string, updated: Partial<PromotionCampaign>) => {
    setPromotions((prev) => prev.map((pr) => (pr.id === id ? { ...pr, ...updated } : pr)));
    showToast('Promotion campaign updated.', 'success');
  };

  // Backup & Restore
  const exportFullBackupJson = (): string => {
    const fullState = {
      version: '1.0.0',
      systemName: 'WCS Inventory Invoice System',
      exportTimestamp: new Date().toISOString(),
      users,
      settings,
      products,
      customers,
      workshops,
      workshopEmployees,
      orders,
      invoices,
      certificates,
      advances,
      employeePayments,
      purchases,
      supplierPayments,
      purchaseReturns,
      expenses,
      promotions,
    };

    const json = JSON.stringify(fullState, null, 2);
    const totalRecords =
      products.length +
      customers.length +
      orders.length +
      invoices.length +
      certificates.length +
      workshops.length +
      purchases.length +
      supplierPayments.length +
      expenses.length;

    const log: BackupLog = {
      id: 'bak-' + Date.now(),
      date: new Date().toLocaleString(),
      filename: `WCS_Backup_${new Date().toISOString().slice(0, 10)}.json`,
      recordsCount: totalRecords,
      fileSizeBytes: new Blob([json]).size,
      exportedBy: currentUser?.name || 'Admin',
    };

    setBackupLogs((prev) => [log, ...prev]);
    return json;
  };

  const restoreFromBackupJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.products || !parsed.settings) {
        return { success: false, message: 'Invalid backup file structure.' };
      }

      if (parsed.users) setUsers(parsed.users);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.workshops) setWorkshops(parsed.workshops);
      if (parsed.workshopEmployees) setWorkshopEmployees(parsed.workshopEmployees);
      if (parsed.orders) setOrders(parsed.orders);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.certificates) setCertificates(parsed.certificates);
      if (parsed.advances) setAdvances(parsed.advances);
      if (parsed.employeePayments) setEmployeePayments(parsed.employeePayments);
      if (parsed.purchases) setPurchases(parsed.purchases);
      if (parsed.supplierPayments) setSupplierPayments(parsed.supplierPayments);
      if (parsed.purchaseReturns) setPurchaseReturns(parsed.purchaseReturns);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.promotions) setPromotions(parsed.promotions);

      showToast('System data successfully restored from backup!', 'success');
      return { success: true, message: 'Backup restored successfully!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error parsing backup JSON.' };
    }
  };

  const resetToSampleData = () => {
    setUsers(initialUsers);
    setSettings(initialSettings);
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setWorkshops(initialWorkshops);
    setWorkshopEmployees(initialWorkshopEmployees);
    setOrders(initialOrders);
    setInvoices(initialInvoices);
    setCertificates(initialCertificates);
    setAdvances(initialAdvances);
    setEmployeePayments(initialEmployeePayments);
    setPurchases(initialPurchases);
    setSupplierPayments(initialSupplierPayments);
    setPurchaseReturns(initialPurchaseReturns);
    setExpenses(initialExpenses);
    setPromotions(initialPromotions);
    setBackupLogs(initialBackupLogs);
    showToast('Restored authentic Sri Lankan Gem & Jewelry demo dataset.', 'info');
  };

  // Currency Formatter
  const formatCurrency = (amount: number): string => {
    const symbol = settings.currencySymbol || 'Rs.';
    const formatted = Math.round(amount).toLocaleString('en-LK');
    return `${symbol} ${formatted}`;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        currentPage,
        setCurrentPage,
        users,
        addUser,
        updateUser,
        updateUserPassword,
        deleteUser,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        settings,
        updateSettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        importProducts,
        invoices,
        createInvoice,
        returnInvoiceItem,
        certificates,
        createCertificate,
        deleteCertificate,
        workshops,
        addWorkshop,
        updateWorkshop,
        deleteWorkshop,
        workshopEmployees,
        addWorkshopEmployee,
        updateWorkshopEmployee,
        deleteWorkshopEmployee,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        advances,
        addAdvance,
        employeePayments,
        addEmployeePayment,
        purchases,
        addPurchase,
        supplierPayments,
        addSupplierPayment,
        deleteSupplierPayment,
        purchaseReturns,
        addPurchaseReturn,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        customers,
        addCustomer,
        updateCustomer,
        promotions,
        updatePromotion,
        backupLogs,
        exportFullBackupJson,
        restoreFromBackupJson,
        resetToSampleData,
        toasts,
        showToast,
        removeToast,
        activePrintInvoice,
        setActivePrintInvoice,
        activePrintCertificate,
        setActivePrintCertificate,
        activePrintReport,
        setActivePrintReport,
        formatCurrency,
        isFullscreen,
        toggleFullscreen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
