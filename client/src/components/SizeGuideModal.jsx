import React, { useState } from 'react';
import { X, Ruler, Scissors } from 'lucide-react';
import { Modal } from './ui';
import { Link } from 'react-router-dom';

const MEN = [
  { size: 'XS', chest: ['34 - 36', '86 - 91'], waist: ['28 - 30', '71 - 76'], shoulder: ['17.5', '44'], sleeve: ['24.5', '62'] },
  { size: 'S', chest: ['36 - 38', '91 - 96'], waist: ['30 - 32', '76 - 81'], shoulder: ['18.0', '46'], sleeve: ['25.0', '63.5'] },
  { size: 'M', chest: ['38 - 40', '96 - 101'], waist: ['32 - 34', '81 - 86'], shoulder: ['18.5', '47'], sleeve: ['25.5', '65'] },
  { size: 'L', chest: ['40 - 42', '101 - 106'], waist: ['34 - 36', '86 - 91'], shoulder: ['19.0', '48.5'], sleeve: ['26.0', '66'] },
  { size: 'XL', chest: ['42 - 44', '106 - 112'], waist: ['36 - 38', '91 - 96'], shoulder: ['19.5', '50'], sleeve: ['26.5', '67.5'] },
  { size: '2XL', chest: ['44 - 46', '112 - 117'], waist: ['38 - 40', '96 - 101'], shoulder: ['20.0', '51'], sleeve: ['27.0', '68.5'] },
  { size: '3XL', chest: ['46 - 48', '117 - 122'], waist: ['40 - 42', '101 - 106'], shoulder: ['20.5', '52'], sleeve: ['27.5', '70'] },
];
const WOMEN = [
  { size: 'XS', chest: ['32 - 33', '81 - 84'], waist: ['25 - 26', '63 - 66'], shoulder: ['15.5', '39'], sleeve: ['23.5', '60'] },
  { size: 'S', chest: ['34 - 35', '86 - 89'], waist: ['27 - 28', '68 - 71'], shoulder: ['16.0', '41'], sleeve: ['24.0', '61'] },
  { size: 'M', chest: ['36 - 37', '91 - 94'], waist: ['29 - 30', '73 - 76'], shoulder: ['16.5', '42'], sleeve: ['24.5', '62'] },
  { size: 'L', chest: ['38 - 40', '96 - 101'], waist: ['31 - 33', '78 - 84'], shoulder: ['17.0', '43'], sleeve: ['25.0', '63.5'] },
  { size: 'XL', chest: ['41 - 43', '104 - 109'], waist: ['34 - 36', '86 - 91'], shoulder: ['17.5', '44.5'], sleeve: ['25.5', '65'] },
  { size: '2XL', chest: ['44 - 46', '112 - 117'], waist: ['37 - 39', '94 - 99'], shoulder: ['18.0', '46'], sleeve: ['26.0', '66'] },
];

const SizeGuideModal = ({ isOpen, onClose }) => {
  const [gender, setGender] = useState('Men');
  const [unit, setUnit] = useState(0); // 0 = inches, 1 = cm
  const rows = gender === 'Men' ? MEN : WOMEN;

  const Seg = ({ value, current, set, children }) => (
    <button
      type="button"
      onClick={() => set(value)}
      aria-pressed={current === value}
      className={`rounded px-3.5 py-1.5 text-sm font-semibold transition-colors ${current === value ? 'bg-ink text-white' : 'text-ink-soft hover:bg-stone'}`}
    >
      {children}
    </button>
  );

  return (
    <Modal open={isOpen} onClose={onClose} title="Size guide" maxWidth="max-w-3xl">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Ruler className="h-5 w-5 text-saddle-600" /> Size guide
        </h2>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-stone">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto p-5">
        <p className="mb-4 text-sm text-ink-muted">
          Measurements are body measurements, not garment measurements. Between two sizes, we suggest sizing up for a layered fit.
        </p>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-md border border-line p-1">
            <Seg value="Men" current={gender} set={setGender}>Men</Seg>
            <Seg value="Women" current={gender} set={setGender}>Women</Seg>
          </div>
          <div className="flex gap-1 rounded-md border border-line p-1">
            <Seg value={0} current={unit} set={setUnit}>Inches</Seg>
            <Seg value={1} current={unit} set={setUnit}>cm</Seg>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead className="bg-stone text-xs text-ink-soft">
              <tr>
                {['Size', 'Chest', 'Waist', 'Shoulder', 'Sleeve'].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.size}>
                  <td className="px-4 py-3 font-semibold">{r.size}</td>
                  <td className="px-4 py-3">{r.chest[unit]}</td>
                  <td className="px-4 py-3">{r.waist[unit]}</td>
                  <td className="px-4 py-3">{r.shoulder[unit]}</td>
                  <td className="px-4 py-3">{r.sleeve[unit]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-lg bg-saddle-50 p-4">
          <Scissors className="mt-0.5 h-5 w-5 shrink-0 text-saddle-600" />
          <div className="text-sm">
            <p className="font-semibold">Can’t find your fit?</p>
            <p className="mt-0.5 text-ink-soft">
              Choose <strong>Made to measure</strong> on any jacket and enter your own measurements, or{' '}
              <Link to="/custom-studio" onClick={onClose} className="link">design one in the custom studio</Link>.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SizeGuideModal;
