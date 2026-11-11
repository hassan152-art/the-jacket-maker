import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, ArrowLeft, ShoppingBag, Send, CheckCircle2, Loader2, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { imgFallback } from '../components/ui';
import api from '../services/api';

const IMG = (id, w = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const SILHOUETTES = [
  { name: 'Cafe Racer Jacket', desc: 'Minimal racer collar and zip front.', image: IMG('photo-1551028719-00167b16eac5') },
  { name: 'Double Rider Biker', desc: 'Asymmetric zip, wide lapels, coin pocket.', image: IMG('photo-1520975954732-35dd22299614') },
  { name: 'Aviator Shearling Flight', desc: 'Merino wool collar and body, double buckles.', image: IMG('photo-1548883354-7622d03aca27') },
  { name: 'Long Trench Coat & Duster', desc: 'Double-breasted, knee length, with belt.', image: IMG('photo-1544441893-675973e31985') },
  { name: 'Collegiate Varsity Jacket', desc: 'Wool body with full-grain leather sleeves.', image: IMG('photo-1551028719-00167b16eac5') },
  { name: 'Tailored Leather Blazer', desc: 'Structured lapels, single or double breasted.', image: IMG('photo-1539571696357-5a69c17a67c6') },
];
const LEATHERS = [
  { name: 'Full-Grain Sheepskin', tag: 'Most popular', desc: 'Buttery soft, lightweight, with a natural drape.' },
  { name: 'Heavyweight Pull-Up Cowhide', tag: 'Rugged', desc: '1.2 mm hide that develops a rich patina.' },
  { name: 'Italian Goatskin Velvet Suede', tag: 'Luxury', desc: 'Velvety brushed texture with deep colour.' },
  { name: 'Double-Faced Merino Shearling', tag: 'Warmest', desc: 'Real wool fleece inside, nappa leather outside.' },
];
const COLORS = [
  { name: 'Obsidian Black', hex: '#111111' },
  { name: 'Vintage Cognac', hex: '#7E4822' },
  { name: 'Distressed Espresso', hex: '#4A2E1B' },
  { name: 'Midnight Navy', hex: '#1A2530' },
  { name: 'Oxblood Burgundy', hex: '#5C171E' },
  { name: 'Military Olive Green', hex: '#2B3828' },
];
const HARDWARE = [
  { name: 'Antiqued Brass', desc: 'Warm vintage gold with a matte burnish.' },
  { name: 'Polished Silver', desc: 'Crisp nickel with a modern edge.' },
  { name: 'Matte Stealth Gunmetal', desc: 'Dark graphite, industrial look.' },
];
const LININGS = [
  { name: 'Quilted Thermal Silk-Satin', desc: 'Light quilting in black or cognac satin.' },
  { name: 'Crimson Red Bemberg Silk', desc: 'Smooth, breathable luxury lining.' },
  { name: 'Heritage Scottish Tartan Cotton', desc: 'Classic plaid cotton twill.' },
  { name: 'Plush Merino Sherpa Fleece', desc: 'Maximum cold-weather insulation.' },
];
const STEPS = ['Style', 'Leather & colour', 'Hardware & lining', 'Fit & size'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

const Option = ({ selected, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`relative w-full rounded-lg border p-4 text-left transition-colors ${selected ? 'border-ink bg-stone/70 ring-1 ring-ink' : 'border-line-strong hover:border-ink'} ${className}`}
  >
    {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-ink" />}
    {children}
  </button>
);

const CustomStudioPage = () => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('Men');
  const [silhouette, setSilhouette] = useState(SILHOUETTES[0].name);
  const [leatherType, setLeatherType] = useState(LEATHERS[0].name);
  const [color, setColor] = useState(COLORS[0]);
  const [hardware, setHardware] = useState(HARDWARE[0].name);
  const [lining, setLining] = useState(LININGS[0].name);
  const [monogram, setMonogram] = useState('');
  const [fitType, setFitType] = useState('Regular Fit');
  const [custom, setCustom] = useState(true);
  const [standardSize, setStandardSize] = useState('L');
  const [mm, setMm] = useState({ chest: '40', shoulders: '18.5', sleeves: '25.5', waist: '33', backLength: '26', height: '5 ft 10 in' });
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [addedMsg, setAddedMsg] = useState(false);

  const [contact, setContact] = useState({ customerName: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const price = (() => {
    let base = 52000;
    if (silhouette.includes('Shearling')) base += 25000;
    if (silhouette.includes('Trench')) base += 18000;
    if (silhouette.includes('Biker')) base += 6000;
    if (leatherType.includes('Merino') || leatherType.includes('Shearling')) base += 20000;
    if (leatherType.includes('Cowhide')) base += 5000;
    if (leatherType.includes('Suede')) base += 7000;
    if (lining.includes('Merino') || lining.includes('Sherpa')) base += 9000;
    if (lining.includes('Silk')) base += 3500;
    if (monogram.trim()) base += 2500;
    return base;
  })();

  const current = SILHOUETTES.find((s) => s.name === silhouette);
  const sm = (k) => (e) => setMm((s) => ({ ...s, [k]: e.target.value }));

  const measurementsOk = () => ['chest', 'shoulders', 'sleeves', 'waist', 'backLength'].every((k) => Number(mm[k]) > 0);

  const addBespoke = () => {
    if (custom && !measurementsOk()) {
      setFormError('Please enter all five measurements (in inches).');
      return;
    }
    setFormError('');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    addToCart(
      {
        _id: `custom_${Date.now()}`,
        name: `Custom ${silhouette} (${gender})`,
        slug: `custom-${silhouette.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        category: gender,
        subCategory: silhouette,
        pricePKR: price,
        priceUSD: Math.round(price / 280),
        images: [current?.image || IMG('photo-1551028719-00167b16eac5', 800)],
        leatherType,
      },
      {
        size: custom ? 'Custom (Made-to-Measure)' : standardSize,
        color: color.name,
        quantity: 1,
        isCustom: true,
        customDetails: {
          silhouette,
          leatherType,
          color: color.name,
          hardware,
          lining,
          monogram: monogram || null,
          fitType,
          measurements: custom
            ? { chest: Number(mm.chest), shoulders: Number(mm.shoulders), sleeves: Number(mm.sleeves), waist: Number(mm.waist), length: Number(mm.backLength), height: mm.height }
            : { standardSize },
          notes,
        },
      }
    );
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  };

  const submitConsult = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/custom-studio/inquiry', {
        ...contact,
        silhouette,
        gender,
        leatherType,
        color: color.name,
        hardware,
        lining,
        monogramText: monogram,
        fitType,
        measurements: custom
          ? { chest: Number(mm.chest), shoulders: Number(mm.shoulders), sleeves: Number(mm.sleeves), waist: Number(mm.waist), backLength: Number(mm.backLength), height: mm.height }
          : {},
        notes,
        estimatedPricePKR: price,
      });
      setSubmitted(true);
    } catch {
      setSubmitError('We couldn’t send your request. Please try again or message us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const nav = (back, next, nextLabel) => (
    <div className="flex items-center justify-between border-t border-line pt-5">
      {back ? (
        <button type="button" onClick={() => setStep(back)} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> Back</button>
      ) : <span />}
      {next && (
        <button type="button" onClick={() => setStep(next)} className="btn-primary">{nextLabel} <ArrowRight className="h-4 w-4" /></button>
      )}
    </div>
  );

  const h = 'text-xl font-semibold';
  const sub = 'mb-3 text-sm font-semibold';

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold sm:text-5xl">Design your jacket</h1>
        <p className="mt-3 text-ink-soft">Choose every detail, enter your measurements, and we’ll make it for you in 10–14 days. Free delivery across Pakistan.</p>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        {/* WIZARD */}
        <div>
          <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Steps">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <li key={label}>
                  <button type="button" onClick={() => setStep(n)} aria-current={active ? 'step' : undefined} className="w-full text-left">
                    <span className={`block h-1 rounded-full ${active || done ? 'bg-ink' : 'bg-line-strong'}`} />
                    <span className={`mt-2 block text-xs font-semibold sm:text-sm ${active ? 'text-ink' : 'text-ink-muted'}`}>
                      <span className="hidden sm:inline">{n}. </span>{label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="space-y-7 rounded-lg border border-line p-5 sm:p-7">
            {step === 1 && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className={h}>Choose a style</h2>
                  <div className="flex gap-1 rounded-md border border-line p-1" role="group" aria-label="Gender">
                    {['Men', 'Women'].map((g) => (
                      <button key={g} type="button" aria-pressed={gender === g} onClick={() => setGender(g)} className={`rounded px-4 py-1.5 text-sm font-semibold ${gender === g ? 'bg-ink text-white' : 'text-ink-soft hover:bg-stone'}`}>{g}</button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SILHOUETTES.map((s) => (
                    <Option key={s.name} selected={silhouette === s.name} onClick={() => setSilhouette(s.name)} className="flex gap-3">
                      <img src={s.image} alt="" onError={imgFallback} className="h-20 w-16 shrink-0 rounded bg-stone object-cover" />
                      <span className="min-w-0 pr-5">
                        <span className="block text-sm font-semibold">{s.name}</span>
                        <span className="mt-1 block text-xs text-ink-muted">{s.desc}</span>
                      </span>
                    </Option>
                  ))}
                </div>
                {nav(null, 2, 'Leather & colour')}
              </>
            )}

            {step === 2 && (
              <>
                <h2 className={h}>Leather and colour</h2>
                <div>
                  <p className={sub}>Leather</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {LEATHERS.map((l) => (
                      <Option key={l.name} selected={leatherType === l.name} onClick={() => setLeatherType(l.name)}>
                        <span className="flex items-center gap-2 pr-5"><span className="text-sm font-semibold">{l.name}</span></span>
                        <span className="mt-1 inline-block rounded bg-saddle-50 px-1.5 py-0.5 text-[11px] font-semibold text-saddle-700">{l.tag}</span>
                        <span className="mt-1.5 block text-xs text-ink-muted">{l.desc}</span>
                      </Option>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={sub}>Colour: <span className="font-normal text-ink-soft">{color.name}</span></p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {COLORS.map((c) => (
                      <Option key={c.name} selected={color.name === c.name} onClick={() => setColor(c)} className="flex items-center gap-2.5 !p-3">
                        <span className="h-5 w-5 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: c.hex }} />
                        <span className="min-w-0 truncate pr-4 text-xs font-medium">{c.name}</span>
                      </Option>
                    ))}
                  </div>
                </div>
                {nav(1, 3, 'Hardware & lining')}
              </>
            )}

            {step === 3 && (
              <>
                <h2 className={h}>Hardware, lining and monogram</h2>
                <div>
                  <p className={sub}>Zips and metal finish</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {HARDWARE.map((x) => (
                      <Option key={x.name} selected={hardware === x.name} onClick={() => setHardware(x.name)}>
                        <span className="block pr-5 text-sm font-semibold">{x.name}</span>
                        <span className="mt-1 block text-xs text-ink-muted">{x.desc}</span>
                      </Option>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={sub}>Inner lining</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {LININGS.map((x) => (
                      <Option key={x.name} selected={lining === x.name} onClick={() => setLining(x.name)}>
                        <span className="block pr-5 text-sm font-semibold">{x.name}</span>
                        <span className="mt-1 block text-xs text-ink-muted">{x.desc}</span>
                      </Option>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="mono" className={`${sub} block`}>Monogram (optional, +Rs 2,500)</label>
                  <input id="mono" maxLength={12} value={monogram} onChange={(e) => setMonogram(e.target.value.toUpperCase())} placeholder="e.g. U.F. or HASSAN" className="input max-w-xs font-semibold uppercase tracking-widest" />
                  <p className="mt-1.5 text-xs text-ink-muted">Hot-stamped on the genuine leather patch inside the collar.</p>

                  {/* Live Atelier Monogram Patch Preview */}
                  <div className="mt-3 flex items-center gap-4 rounded-xl border border-[#E4E3DF] bg-[#FAF3EE]/60 p-4">
                    <div className="flex h-16 w-36 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#8A4B25]/50 bg-[#8A4B25] p-2 text-center shadow-inner">
                      <span className="font-serif text-lg font-bold tracking-widest uppercase text-amber-100 drop-shadow-sm">
                        {monogram.trim() ? monogram : 'YOUR INITIALS'}
                      </span>
                    </div>
                    <div className="text-xs text-[#3B3F47]">
                      <p className="font-bold text-ink flex items-center gap-1.5">
                        <span>Atelier Monogram Stamp</span>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">Gold Foil</span>
                      </p>
                      <p className="text-[#6A6F78] mt-0.5">
                        Permanently heat-pressed into full-grain leather patch at 180°C inside the back collar neck.
                      </p>
                    </div>
                  </div>
                </div>
                {nav(2, 4, 'Fit & size')}
              </>
            )}

            {step === 4 && (
              <>
                <h2 className={h}>Fit and size</h2>
                <div>
                  <p className={sub}>Fit</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Slim Fit', 'Regular Fit', 'Relaxed Fit'].map((f) => (
                      <button key={f} type="button" aria-pressed={fitType === f} onClick={() => setFitType(f)} className={`rounded-md border py-3 text-sm font-semibold ${fitType === f ? 'border-ink bg-ink text-white' : 'border-line-strong hover:border-ink'}`}>{f}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Sizing</p>
                    <div className="flex gap-1 rounded-md border border-line p-1" role="group" aria-label="Sizing method">
                      <button type="button" aria-pressed={custom} onClick={() => setCustom(true)} className={`rounded px-3 py-1.5 text-sm font-semibold ${custom ? 'bg-ink text-white' : 'text-ink-soft hover:bg-stone'}`}>My measurements</button>
                      <button type="button" aria-pressed={!custom} onClick={() => setCustom(false)} className={`rounded px-3 py-1.5 text-sm font-semibold ${!custom ? 'bg-ink text-white' : 'text-ink-soft hover:bg-stone'}`}>Standard size</button>
                    </div>
                  </div>

                  {custom ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {[['chest', 'Chest (in)'], ['shoulders', 'Shoulders (in)'], ['sleeves', 'Sleeve (in)'], ['waist', 'Waist (in)'], ['backLength', 'Jacket length (in)']].map(([k, l]) => (
                        <div key={k}>
                          <label htmlFor={`s-${k}`} className="label">{l}</label>
                          <input id={`s-${k}`} type="number" inputMode="decimal" step="0.5" min="1" value={mm[k]} onChange={sm(k)} className="input" />
                        </div>
                      ))}
                      <div>
                        <label htmlFor="s-h" className="label">Height</label>
                        <input id="s-h" value={mm.height} onChange={sm('height')} className="input" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => (
                        <button key={s} type="button" aria-pressed={standardSize === s} onClick={() => setStandardSize(s)} className={`min-w-[3.25rem] rounded-md border py-2.5 text-sm font-semibold ${standardSize === s ? 'border-ink bg-ink text-white' : 'border-line-strong hover:border-ink'}`}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="notes" className="label">Notes for our tailors (optional)</label>
                  <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. extra deep inside pocket, slimmer sleeves" className="input" />
                </div>

                {formError && <p role="alert" className="rounded-md bg-sale/5 px-3 py-2 text-sm text-sale">{formError}</p>}

                <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => setStep(3)} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> Back</button>
                  <button type="button" onClick={addBespoke} className="btn-primary px-7 py-3.5 lg:hidden">
                    {addedMsg ? <><Check className="h-4 w-4" /> Added to bag</> : <><ShoppingBag className="h-4 w-4" /> Add to bag · {formatPrice(price)}</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        <aside className="rounded-lg border border-line lg:sticky lg:top-32">
          <div className="aspect-[4/3] overflow-hidden rounded-t-lg bg-stone">
            <img src={current?.image} alt={silhouette} onError={imgFallback} className="h-full w-full object-cover" />
          </div>
          <div className="p-5">
            <h2 className="font-sans text-lg font-semibold">{silhouette}</h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              {[
                ['For', `${gender} · ${fitType}`],
                ['Leather', leatherType],
                ['Colour', color.name],
                ['Hardware', hardware],
                ['Lining', lining],
                ...(monogram ? [['Monogram', monogram]] : []),
                ['Size', custom ? `Custom · ${mm.chest}″ chest, ${mm.sleeves}″ sleeve` : `Standard ${standardSize}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2">
                  <dt className="shrink-0 text-ink-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
              <div>
                <p className="text-xs text-ink-muted">Estimated price</p>
                <p className="font-display text-3xl font-semibold">{formatPrice(price)}</p>
              </div>
              <p className="text-right text-xs text-ink-muted">Free delivery<br />10–14 days</p>
            </div>

            <button type="button" onClick={addBespoke} className="btn-primary mt-4 hidden w-full py-3.5 lg:flex">
              {addedMsg ? <><Check className="h-4 w-4" /> Added to bag</> : <><ShoppingBag className="h-4 w-4" /> Add to bag</>}
            </button>
            {step !== 4 && <p className="mt-3 hidden text-xs text-ink-muted lg:block">You can add to bag any time. Step 4 asks for your size.</p>}

            <div className="mt-5 border-t border-line pt-5">
              <p className="text-sm font-semibold">Prefer to talk to a tailor first?</p>
              {submitted ? (
                <p className="mt-3 flex items-start gap-2 rounded-md bg-ok/10 p-3 text-sm text-ok">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Request sent. We’ll contact you on WhatsApp or phone shortly.
                </p>
              ) : (
                <form onSubmit={submitConsult} className="mt-3 space-y-3">
                  <input required placeholder="Full name" aria-label="Full name" value={contact.customerName} onChange={(e) => setContact((c) => ({ ...c, customerName: e.target.value }))} className="input" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input required type="email" placeholder="Email" aria-label="Email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} className="input" />
                    <input required type="tel" placeholder="WhatsApp / phone" aria-label="Phone" value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} className="input" />
                  </div>
                  {submitError && <p role="alert" className="text-sm text-sale">{submitError}</p>}
                  <button type="submit" disabled={submitting} className="btn-outline w-full">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Request a consultation
                  </button>
                </form>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CustomStudioPage;
