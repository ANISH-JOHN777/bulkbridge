import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR, formatQuantity } from '../../services/financialEngine';
import { DataTable, Column } from '../common/DataTable';
import {
  Package,
  Plus,
  Edit,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export const SupplierCatalog: React.FC = () => {
  const { state, currentOrg, addToast } = useApp();

  const myProducts = state.products.filter((p) => p.supplierId === currentOrg.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Carton (50 pcs)');
  const [basePriceRupees, setBasePriceRupees] = useState(1000);
  const [moq, setMoq] = useState(10);
  const [stock, setStock] = useState(1000);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Product Added', `${productName} added to factory catalog with quantity-based discount schedules.`, 'success');
    setModalOpen(false);
  };

  const columns: Column<Product>[] = [
    {
      header: 'SKU',
      accessor: 'sku',
      className: 'font-mono font-semibold text-slate-900',
    },
    {
      header: 'Product Name',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.name}</div>
          <div className="text-[10px] text-slate-400">HSN: {row.hsnCode} • GST: {row.taxRatePercent}%</div>
        </div>
      ),
      sortKey: 'name',
    },
    {
      header: 'Base Price',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {formatINR(row.basePricePaise)} / {row.unitOfMeasure}
        </span>
      ),
      sortKey: 'basePricePaise',
    },
    {
      header: 'MOQ',
      accessor: (row) => `${row.moq} units`,
      sortKey: 'moq',
    },
    {
      header: 'Available Stock',
      accessor: (row) => (
        <span className="font-mono font-semibold text-slate-800">
          {formatQuantity(row.availableStock)}
        </span>
      ),
      sortKey: 'availableStock',
    },
    {
      header: 'Discount Tiers',
      accessor: (row) => (
        <span className="text-xs text-emerald-700 font-semibold">
          {row.discountTiers.length} configured tiers
        </span>
      ),
    },
    {
      header: 'Lead Time',
      accessor: (row) => `${row.leadTimeDays} days`,
      sortKey: 'leadTimeDays',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Factory Product Catalog & Stock</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure factory SKUs, unit packaging, MOQs, tiered volume discount rules, and current stock balances.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product SKU</span>
        </button>
      </div>

      <DataTable
        data={myProducts}
        columns={columns}
        searchPlaceholder="Search factory SKUs and products..."
        filename={`supplier_catalog_${currentOrg.id}.csv`}
        actions={(row) => (
          <button
            onClick={() => addToast('SKU Configuration', `Editing parameters for ${row.sku}`, 'info')}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            title="Edit SKU"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      />

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Factory Product SKU</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12W LED Bulbs (Carton of 50)"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="ELEC-LED-012W"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={basePriceRupees}
                    onChange={(e) => setBasePriceRupees(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Factory MOQ</label>
                  <input
                    type="number"
                    required
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Product SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
