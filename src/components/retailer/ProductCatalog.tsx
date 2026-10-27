import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { formatINR } from '../../services/financialEngine';
import {
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  ShoppingBag,
  Info,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const { state, setActiveView, joinCampaign } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pledgeQuantity, setPledgeQuantity] = useState<number>(10);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'ELECTRICAL_LIGHTING', label: 'Electrical & Lighting' },
    { id: 'FMCG_GROCERY', label: 'FMCG & Groceries' },
    { id: 'AGRICULTURAL', label: 'Agricultural Supplies' },
    { id: 'PACKAGING_MATERIALS', label: 'Packaging Materials' },
    { id: 'TEXTILES_GARMENTS', label: 'Textiles & Garments' },
    { id: 'HARDWARE_CONSTRUCTION', label: 'Hardware & Construction' },
    { id: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
    { id: 'ELECTRONICS_ACCESSORIES', label: 'Electronics & Cables' },
  ];

  // Suppliers list
  const suppliers = useMemo(() => {
    return Array.from(new Set(state.products.map((p) => p.supplierName)));
  }, [state.products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return state.products
      .filter((p) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.supplierName.toLowerCase().includes(q);
          if (!matches) return false;
        }

        if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
          return false;
        }

        if (selectedSupplier !== 'ALL' && p.supplierName !== selectedSupplier) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePricePaise - b.basePricePaise;
        if (sortBy === 'price-desc') return b.basePricePaise - a.basePricePaise;
        return a.name.localeCompare(b.name);
      });
  }, [state.products, search, selectedCategory, selectedSupplier, sortBy]);

  const handleOpenPledge = (product: Product) => {
    setSelectedProduct(product);
    setPledgeQuantity(product.moq);
    if (product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId('');
    }
  };

  const handlePledgeSubmit = () => {
    if (!selectedProduct) return;

    // Check if there's an existing campaign for this product
    const campaign = state.campaigns.find(
      (c) => c.productId === selectedProduct.id && ['OPEN', 'THRESHOLD_REACHED'].includes(c.status)
    );

    if (campaign) {
      joinCampaign(campaign.id, pledgeQuantity, selectedVariantId);
      setActiveView('campaign-detail', campaign.id);
    } else {
      // If no active campaign, navigate to campaigns or prompt
      setActiveView('retailer-campaigns');
    }
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wholesale Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Factory-direct products with verified quantity-break discount schedules and guaranteed specifications.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          Showing {filteredProducts.length} verified products
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, SKU, or supplier..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Supplier Selector */}
          <div>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Certified Manufacturers</option>
              {suppliers.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
            >
              <option value="name">Sort by: Name (A-Z)</option>
              <option value="price-asc">Sort by: Price (Low to High)</option>
              <option value="price-desc">Sort by: Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          // Check if there is an active bulk campaign
          const activeCampaign = state.campaigns.find(
            (c) => c.productId === product.id && ['OPEN', 'THRESHOLD_REACHED'].includes(c.status)
          );

          const maxDiscount = product.discountTiers.reduce(
            (max, t) => Math.max(max, t.discountPercent),
            0
          );

          return (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-3">
                {/* Header Pills */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400 font-semibold">{product.sku}</span>
                  {maxDiscount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Up to {maxDiscount}% Off
                    </span>
                  )}
                </div>

                {/* Title & Supplier */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Supplier: {product.supplierName}</p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Price & MOQ */}
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Base Price: </span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      {formatINR(product.basePricePaise)}
                    </span>
                    <span className="text-[10px] text-slate-500"> / {product.unitOfMeasure}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    MOQ: <strong className="text-slate-800">{product.moq}</strong>
                  </div>
                </div>

                {/* Quantity Breaks Preview */}
                {product.discountTiers.length > 0 && (
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-500">
                      Cooperative Discount Schedule
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-700">
                      {product.discountTiers.slice(0, 3).map((tier, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                          {tier.minQuantity}+: <strong className="text-emerald-700">{tier.discountPercent}%</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                {activeCampaign ? (
                  <button
                    onClick={() => setActiveView('campaign-detail', activeCampaign.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Join Active Deal ({activeCampaign.currentDiscountPercent}%)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenPledge(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pledge Order ({product.moq}+ MOQ)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pledge Drawer / Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-emerald-600 font-bold uppercase">
                  Pledge Order Allocation
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-500">Supplier: {selectedProduct.supplierName}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Variants Selector */}
            {selectedProduct.variants.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Variant
                </label>
                <div className="space-y-2">
                  {selectedProduct.variants.map((v) => (
                    <label
                      key={v.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-colors ${
                        selectedVariantId === v.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="variant"
                          checked={selectedVariantId === v.id}
                          onChange={() => setSelectedVariantId(v.id)}
                          className="accent-emerald-600"
                        />
                        <span>{v.name}</span>
                      </div>
                      <span className="font-mono text-slate-500">
                        {v.priceDeltaPaise === 0 ? 'Standard' : `+${formatINR(v.priceDeltaPaise)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Requested Quantity ({selectedProduct.unitOfMeasure})
                </label>
                <span className="text-xs text-slate-500">MOQ: {selectedProduct.moq}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={selectedProduct.moq}
                  value={pledgeQuantity}
                  onChange={(e) => setPledgeQuantity(Math.max(selectedProduct.moq, Number(e.target.value)))}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 font-mono text-center"
                />
              </div>
            </div>

            {/* Financial Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Unit Base Price:</span>
                <span className="font-mono">{formatINR(selectedProduct.basePricePaise)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Estimated Gross Total:</span>
                <span className="font-mono text-emerald-700 text-sm">
                  {formatINR(pledgeQuantity * selectedProduct.basePricePaise)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Final price will unlock volume discounts upon collective campaign aggregation.
              </p>
            </div>

            {/* Action */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePledgeSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Confirm Commitment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
