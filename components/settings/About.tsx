import { ExternalLink } from 'lucide-react';
export default function AboutPanel() {
  return (
    <section>
      <h2 className="text-lg font-semibold">About</h2>
      <div className="mt-7 space-y-5">
        <div>
          <h3 className="font-medium">Terms of use</h3>
          <p className="mt-2 rounded-lg border border-white/10 bg-white/[.03] p-4 text-sm leading-6 text-white/55">
            Use Prajapatt responsibly. Do not use the service to violate laws,
            privacy, or the rights of others.
          </p>
        </div>
        <div>
          <h3 className="font-medium">Privacy policy</h3>
          <p className="mt-2 rounded-lg border border-white/10 bg-white/[.03] p-4 text-sm leading-6 text-white/55">
            Your account data is used to provide and improve the product. Review
            the privacy policy for more information.
          </p>
        </div>
        <a
          href="/legal/terms"
          className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
        >
          Read legal documents <ExternalLink size={14} />
        </a>
        <p className="text-xs text-white/35">Prajapatt AI version 0.1.0</p>
      </div>
    </section>
  );
}
