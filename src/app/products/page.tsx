'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface Variant {
  id: string;
  value: string;
  extraPriceCents: number;
}

interface Attribute {
  id: string;
  name: string;
  variants: Variant[];
}

interface Product {
  id: string;
  name: string;
  type: string;
  salesPriceCents: number;
  costPriceCents: number;
  notes?: string | null;
  active: boolean;
  attributes: Attribute[];
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('product');
  const [salesPrice, setSalesPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Add variant modal
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [attrName, setAttrName] = useState('');
  const [variantVal, setVariantVal] = useState('');
  const [variantExtra, setVariantExtra] = useState('0');

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const json = await res.json();
        setProducts(json.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          salesPriceCents: Math.round(parseFloat(salesPrice) * 100),
          costPriceCents: Math.round(parseFloat(costPrice || '0') * 100),
          notes,
        }),
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        setName('');
        setSalesPrice('');
        setCostPrice('');
        setNotes('');
        await loadProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create product');
      }
    } catch {
      alert('Error creating product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      const res = await fetch(`/api/admin/products/${selectedProductId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributeName: attrName,
          variantValue: variantVal,
          extraPriceCents: Math.round(parseFloat(variantExtra || '0') * 100),
        }),
      });

      if (res.ok) {
        setSelectedProductId(null);
        setAttrName('');
        setVariantVal('');
        setVariantExtra('0');
        await loadProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add variant');
      }
    } catch {
      alert('Error adding variant');
    }
  };

  return (
    <AppShell allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Products & Variants
            </h1>
            <p className="text-sm text-muted mt-1">
              Catalog of base products, add-ons, software tiers, and variant attributes with extra pricing.
            </p>
          </div>

          <button
            onClick={() => setIsProductModalOpen(true)}
            className="btn btn-primary text-sm font-medium flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Product</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-muted text-xs">
              Loading product catalog...
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted text-xs">
              No products found.
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="card p-6 border-border space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold text-ink">{p.name}</h3>
                    <span className="badge badge-neutral uppercase text-[10px]">{p.type}</span>
                  </div>

                  <div className="text-2xl font-extrabold text-primary mb-2">
                    {formatMoney(p.salesPriceCents)}
                    <span className="text-xs font-normal text-muted ml-1">base price</span>
                  </div>

                  {p.notes && <p className="text-xs text-muted leading-relaxed mb-4">{p.notes}</p>}

                  {/* Attributes & Variants */}
                  <div className="pt-3 border-t border-border/80 space-y-2">
                    <div className="text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center justify-between">
                      <span>Configured Variants</span>
                      <button
                        onClick={() => setSelectedProductId(p.id)}
                        className="text-primary hover:text-primary font-bold"
                      >
                        + Add Variant
                      </button>
                    </div>

                    {p.attributes.length === 0 ? (
                      <p className="text-xs text-muted italic">No variants (standard item)</p>
                    ) : (
                      p.attributes.map((attr) => (
                        <div key={attr.id} className="p-2.5 rounded-lg bg-bg/70 border border-border/80">
                          <div className="text-xs font-semibold text-ink mb-1">{attr.name}:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {attr.variants.map((v) => (
                              <span
                                key={v.id}
                                className="px-2 py-0.5 rounded text-[11px] bg-surface text-ink border border-border"
                              >
                                {v.value} {v.extraPriceCents > 0 && `(+${formatMoney(v.extraPriceCents)})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: New Product */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <h3 className="text-base font-bold text-ink">Create Product</h3>
                <button onClick={() => setIsProductModalOpen(false)} className="text-muted hover:text-ink">✕</button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Enterprise Cloud License"
                    className="input w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="input w-full text-xs">
                      <option value="product">Product (Software)</option>
                      <option value="service">Service (Add-on)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Sales Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={salesPrice}
                      onChange={(e) => setSalesPrice(e.target.value)}
                      placeholder="49.00"
                      className="input w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Cost Price ($) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="10.00"
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Notes / Description</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Description..."
                    className="input w-full text-xs h-20"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary text-xs font-medium">
                    {submitting ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Variant */}
        {selectedProductId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <h3 className="text-base font-bold text-ink">Add Variant</h3>
                <button onClick={() => setSelectedProductId(null)} className="text-muted hover:text-ink">✕</button>
              </div>

              <form onSubmit={handleAddVariant} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Attribute Name</label>
                  <input
                    type="text"
                    required
                    value={attrName}
                    onChange={(e) => setAttrName(e.target.value)}
                    placeholder="e.g. Hosting Tier, Region, Brand"
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Variant Value</label>
                  <input
                    type="text"
                    required
                    value={variantVal}
                    onChange={(e) => setVariantVal(e.target.value)}
                    placeholder="e.g. Dedicated VPC, US-East"
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Extra Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={variantExtra}
                    onChange={(e) => setVariantExtra(e.target.value)}
                    placeholder="25.00"
                    className="input w-full text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <button type="button" onClick={() => setSelectedProductId(null)} className="btn btn-secondary text-xs">Cancel</button>
                  <button type="submit" className="btn btn-primary text-xs font-medium">Add to Product</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
