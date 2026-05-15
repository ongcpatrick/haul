'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DraftProduct {
  _key: string;
  name: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  sourceUrl: string;
  siteName: string;
}

function emptyProduct(): DraftProduct {
  return { _key: Math.random().toString(36).slice(2), name: '', price: '', originalPrice: '', imageUrl: '', sourceUrl: '', siteName: '' };
}

type Step = 'products' | 'details';

export default function CreateHaulClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('products');
  const [products, setProducts] = useState<DraftProduct[]>([emptyProduct()]);
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProduct = (key: string, field: keyof DraftProduct, value: string) => {
    setProducts((prev) => prev.map((p) => p._key === key ? { ...p, [field]: value } : p));
  };

  const removeProduct = (key: string) => {
    setProducts((prev) => prev.filter((p) => p._key !== key));
  };

  const addProduct = () => {
    setProducts((prev) => [...prev, emptyProduct()]);
  };

  const canAdvance = products.some((p) => p.name.trim().length > 0);

  const post = async () => {
    if (posting) return;
    setError(null);
    setPosting(true);

    const validProducts = products
      .filter((p) => p.name.trim())
      .map((p) => ({
        id: Math.random().toString(36).slice(2),
        name: p.name.trim(),
        price: p.price ? parseFloat(p.price) : null,
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
        imageUrl: p.imageUrl.trim() || null,
        sourceUrl: p.sourceUrl.trim() || null,
        siteName: p.siteName.trim() || 'Web',
        category: null,
      }));

    const res = await fetch('/api/hauls', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ products: validProducts, title: title.trim() || null, isPublic }),
    });

    setPosting(false);

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? 'Failed to post. Please try again.');
      return;
    }

    router.push('/feed');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        <StepDot active={step === 'products'} done={step === 'details'} label="Products" />
        <div className="flex-1 h-px bg-[var(--border)]" />
        <StepDot active={step === 'details'} done={false} label="Details" />
      </div>

      {step === 'products' && (
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] mb-1">Add products</h1>
          <p className="text-sm text-[var(--muted)] mb-6">Add the items you&apos;re comparing. Name is required, everything else is optional.</p>

          <div className="flex flex-col gap-4">
            {products.map((p, i) => (
              <div key={p._key} className="bg-white border border-[var(--border)] rounded-2xl p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Item {i + 1}</span>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(p._key)}
                      className="text-[var(--muted)] hover:text-red-500 transition-colors p-0.5"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  <Field label="Name *" value={p.name} onChange={(v) => updateProduct(p._key, 'name', v)} placeholder="e.g. White Lace Dress" />
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Price ($)" value={p.price} onChange={(v) => updateProduct(p._key, 'price', v)} placeholder="49.99" type="number" />
                    <Field label="Original price ($)" value={p.originalPrice} onChange={(v) => updateProduct(p._key, 'originalPrice', v)} placeholder="79.99" type="number" />
                  </div>
                  <Field label="Image URL" value={p.imageUrl} onChange={(v) => updateProduct(p._key, 'imageUrl', v)} placeholder="https://..." />
                  <Field label="Product URL" value={p.sourceUrl} onChange={(v) => updateProduct(p._key, 'sourceUrl', v)} placeholder="https://..." />
                  <Field label="Store / site name" value={p.siteName} onChange={(v) => updateProduct(p._key, 'siteName', v)} placeholder="e.g. ASOS, Anthropologie" />
                </div>

                {/* Image preview */}
                {p.imageUrl.startsWith('http') && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="mt-3 h-24 w-auto object-contain rounded-lg border border-[var(--border)] bg-[var(--bg)]" />
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addProduct}
            className="mt-4 w-full py-3 border-2 border-dashed border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          >
            + Add another item
          </button>

          <button
            type="button"
            onClick={() => setStep('details')}
            disabled={!canAdvance}
            className="mt-6 w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white font-bold rounded-full transition-colors disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {step === 'details' && (
        <div>
          <button
            type="button"
            onClick={() => setStep('products')}
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] mb-6 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>

          <h1 className="text-2xl font-extrabold text-[var(--text)] mb-1">Haul details</h1>
          <p className="text-sm text-[var(--muted)] mb-6">Give your comparison a title and choose who can see it.</p>

          {/* Product count summary */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mb-6">
            <p className="text-sm font-semibold text-[var(--text)]">
              {products.filter((p) => p.name.trim()).length} product{products.filter((p) => p.name.trim()).length !== 1 ? 's' : ''} ready
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">
              {products.filter((p) => p.name.trim()).map((p) => p.name).join(' · ')}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wedding dress options — help me choose!"
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>

            {/* Visibility toggle */}
            <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors ${isPublic ? 'bg-[var(--primary)] bg-opacity-5' : 'hover:bg-[var(--bg)]'}`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isPublic ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                  {isPublic && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Public</p>
                  <p className="text-xs text-[var(--muted)]">Anyone on Haul can see and react</p>
                </div>
              </button>
              <div className="h-px bg-[var(--border)]" />
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors ${!isPublic ? 'bg-[var(--primary)] bg-opacity-5' : 'hover:bg-[var(--bg)]'}`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${!isPublic ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                  {!isPublic && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Only me</p>
                  <p className="text-xs text-[var(--muted)]">Only visible to you and people you share it with</p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="button"
            onClick={post}
            disabled={posting}
            className="mt-6 w-full py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white font-bold rounded-full transition-colors disabled:opacity-60 text-base"
          >
            {posting ? 'Posting...' : 'Share haul'}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
      />
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
        done ? 'bg-green-500 text-white' : active ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]'
      }`}>
        {done ? '✓' : active ? '●' : '○'}
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`}>{label}</span>
    </div>
  );
}
