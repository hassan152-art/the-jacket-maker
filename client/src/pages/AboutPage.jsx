import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ruler, Layers, Hammer } from 'lucide-react';
import { imgFallback } from '../components/ui';

const LEATHERS = [
  ['Sheepskin nappa', 'Silky, lightweight and comfortable every day.'],
  ['Heavy cowhide', '1.2 mm thick, with a motorcycle heritage.'],
  ['Goat suede', 'A soft nap with deep, rich colour.'],
  ['Merino shearling', 'The warmest option for cold winters.'],
];

const AboutPage = () => (
  <div>
    <section className="bg-stone">
      <div className="container-page max-w-4xl py-14 text-center sm:py-20">
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Leather outerwear, made properly</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
          The Jacket Maker was founded on a simple idea: good leather shouldn’t carry a huge middleman markup. We combine traditional leathercraft with made-to-measure tailoring, and sell directly to you.
        </p>
      </div>
    </section>

    <section className="container-page grid items-center gap-10 py-14 md:grid-cols-2 sm:py-20">
      <div className="overflow-hidden rounded-xl bg-stone">
        <img
          src="https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1000&q=80"
          alt="Leather being cut in our workshop"
          loading="lazy"
          onError={imgFallback}
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      <div>
        <h2 className="text-3xl font-semibold">Full-grain leather, not coated scraps</h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Many fashion brands sand down imperfect hides and spray them with a plastic coating, then call it “genuine leather”. Within months it cracks and peels.
        </p>
        <p className="mt-3 leading-relaxed text-ink-soft">
          At our ateliers in Pakistan we use only the full-grain layer: the top, densest part of the hide. It keeps its natural grain, breathes, and develops a rich patina over the years.
        </p>
        <dl className="mt-7 grid gap-3 sm:grid-cols-2">
          {LEATHERS.map(([t, d]) => (
            <div key={t} className="rounded-lg border border-line p-4">
              <dt className="text-sm font-semibold">{t}</dt>
              <dd className="mt-0.5 text-xs text-ink-muted">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>

    <section className="bg-ink text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3 sm:py-20">
        <div className="md:col-span-1">
          <h2 className="text-3xl font-semibold text-white">Why made-to-measure is free</h2>
          <p className="mt-4 leading-relaxed text-white/75">
            Off-the-rack sizing means compromise: sleeves too long, or a chest that’s too tight. Because we make one piece at a time, our pattern makers can cut every jacket to your chest, shoulder, sleeve and waist measurements at no extra cost.
          </p>
          <Link to="/custom-studio" className="btn mt-7 bg-white text-ink hover:bg-saddle-100">
            Open the custom studio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="grid gap-6 sm:grid-cols-3 md:col-span-2">
          {[
            [Ruler, 'Your measurements', 'Enter them online. We check every number before cutting.'],
            [Hammer, 'Hand-finished', 'Each jacket is cut, stitched and finished in our workshop.'],
            [Layers, '30-day alterations', 'If something needs adjusting, we do it for free.'],
          ].map(([Icon, t, d]) => (
            <li key={t} className="rounded-lg bg-white/5 p-5">
              <Icon className="h-6 w-6 text-saddle-100" />
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-white/70">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  </div>
);

export default AboutPage;
