import React, { useState } from 'react';
import { Database, Server, Github, Check, Copy, Code, Terminal, Globe, Shield } from 'lucide-react';

export const MongoDbSchemaPage: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const mongooseSnippet = `// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  itemCode: { type: String, required: true, unique: true, index: true },
  barcode: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Loose Gemstones', 'Pendants', 'Bespoke'], required: true },
  metalType: { type: String, required: true },
  metalPurity: { type: String, required: true },
  grossWeight: { type: Number, required: true },
  netMetalWeight: { type: Number, required: true },
  totalCaratWeight: { type: Number, default: 0 },
  gemstoneDetails: [{
    gemType: String,
    origin: String,
    cutShape: String,
    color: String,
    clarity: String,
    caratWeight: Number,
    dimensions: String,
    certificationNumber: String,
    treatment: String
  }],
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stockQuantity: { type: Number, default: 1 },
  minStockAlert: { type: Number, default: 1 },
  workshopStatus: { type: String, enum: ['In Showroom Stock', 'Sent to Workshop', 'Custom Order in Production', 'Reserved'], default: 'In Showroom Stock' },
  imageUrl: { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);`;

  const vercelApiSnippet = `// api/invoices.js (Vercel Serverless Function)
import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import Product from '../models/Product';

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    return res.status(200).json(invoices);
  }

  if (req.method === 'POST') {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const invoiceData = req.body;
      const createdInvoice = await Invoice.create([invoiceData], { session });

      // Automatically decrement stock
      for (const item of invoiceData.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: -item.quantity } },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();
      return res.status(201).json(createdInvoice[0]);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ error: err.message });
    }
  }
}`;

  const envSnippet = `# .env.local for Vercel & GitHub Deployment
MONGODB_URI="mongodb+srv://admin:<password>@cluster0.wcs-gems.mongodb.net/wcs_inventory?retryWrites=true&w=majority"
JWT_SECRET="super_secure_jwt_token_for_wcs_system_2026"
NEXT_PUBLIC_COMPANY_NAME="WCS Gems & Fine Jewelry"`;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Full-Stack Architecture Guide</span>
        </div>
        <h2 className="text-xl font-serif font-bold text-white">
          MongoDB Atlas, GitHub & Vercel Production Deployment
        </h2>
        <p className="text-xs text-slate-400">
          Complete production blueprint with Mongoose schemas, transactional atomic stock updates, and Vercel serverless integration.
        </p>
      </div>

      {/* Deployment 3-Step Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            1
          </div>
          <h4 className="font-bold text-white text-sm">MongoDB Atlas Setup</h4>
          <p className="text-slate-400">
            Create a free M0 cluster on MongoDB Atlas, create database user <code className="text-amber-400">wcs_admin</code>, and whitelist IP <code className="text-slate-200">0.0.0.0/0</code>.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            2
          </div>
          <h4 className="font-bold text-white text-sm">GitHub Repository</h4>
          <p className="text-slate-400">
            Push this codebase to your private GitHub repository <code className="text-amber-400">wcs-inventory-invoice</code> with automated CI/CD branch triggers.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            3
          </div>
          <h4 className="font-bold text-white text-sm">Vercel One-Click Deploy</h4>
          <p className="text-slate-400">
            Import GitHub repository into Vercel, attach <code className="text-amber-400">MONGODB_URI</code> environment variable, and deploy live globally.
          </p>
        </div>
      </div>

      {/* Code Snippet 1: Product Mongoose Schema */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Mongoose Schema: Jewelry & Gemstone Collection
          </span>
          <button
            onClick={() => copyToClipboard(mongooseSnippet, 'mongoose')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
          >
            {copiedSection === 'mongoose' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSection === 'mongoose' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="bg-slate-950 p-4 rounded-xl text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
          {mongooseSnippet}
        </pre>
      </div>

      {/* Code Snippet 2: Vercel Serverless Function */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-2">
            <Server className="w-4 h-4" />
            Vercel Serverless API: /api/invoices.js (Atomic Transactions)
          </span>
          <button
            onClick={() => copyToClipboard(vercelApiSnippet, 'vercel')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
          >
            {copiedSection === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSection === 'vercel' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="bg-slate-950 p-4 rounded-xl text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
          {vercelApiSnippet}
        </pre>
      </div>

      {/* Code Snippet 3: Environment Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-blue-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Environment Variables (.env.local)
          </span>
          <button
            onClick={() => copyToClipboard(envSnippet, 'env')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
          >
            {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSection === 'env' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="bg-slate-950 p-4 rounded-xl text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
          {envSnippet}
        </pre>
      </div>
    </div>
  );
};
