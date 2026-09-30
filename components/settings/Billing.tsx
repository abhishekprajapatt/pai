'use client';

import { Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
export default function BillingPanel() {
  const features = [
    'Chat on web, iOS, Android, and desktop',
    'Generate code and visualize data',
    'Write, edit, and create content',
    'Memory across conversations',
    'Create files and execute code',
    'Connect tools through remote MCP',
  ];
  return (
    <section>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Sparkles className="text-[#c7b59e]" />
            <div>
              <h2 className="font-semibold">Free plan</h2>
              <p className="text-sm text-white/50">Try Prajapatt</p>
            </div>
          </div>
          <ul className="mt-8 space-y-3 text-sm text-white/65">
            {features.map((feature) => (
              <li key={feature}>
                <Check size={15} className="mr-2 inline text-white/50" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => toast('Upgrade flow is ready to connect to billing')}
          className="rounded-lg bg-white px-4 py-2 text-sm text-black"
        >
          Upgrade plan
        </button>
      </div>
    </section>
  );
}
