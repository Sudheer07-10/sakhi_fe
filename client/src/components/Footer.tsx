import { Link } from 'wouter';
import { Shield, AlertCircle, Heart, BookOpen, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-100 py-10 md:py-14 w-full">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                S
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 leading-tight">Sakhi</h3>
                <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
                  Care Navigation & Education
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
              An India-first, source-grounded AI companion for reproductive health, fertility education, and voluntary post-care navigation. Built for Startup Buildathon India 2026.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-400">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Non-clinical companion &bull; No hospital login required</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-3">
              Companion Pathways
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/try" className="text-gray-600 hover:text-purple-700 transition-colors">
                  Pre-Care Education
                </Link>
              </li>
              <li>
                <Link href="/try" className="text-gray-600 hover:text-purple-700 transition-colors">
                  Post-Care Navigation
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-purple-700 transition-colors">
                  Sakhi Overview
                </Link>
              </li>
              <li>
                <Link href="/try" className="text-purple-700 font-semibold hover:underline flex items-center gap-1">
                  Start Talking to Sakhi &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Languages Supported */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-3">
              Supported Languages
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>English (General Care)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                <span>తెలుగు (Telugu)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Tinglish (Colloquial)</span>
              </li>
            </ul>
          </div>

          {/* Clinical Boundaries & Notice */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-3">
              Safety Boundaries
            </h4>
            <div className="space-y-2 text-[11px] text-gray-500 leading-relaxed">
              <p>
                <strong>Not a hospital record:</strong> Sakhi is not connected to clinic directories. Treatment details are voluntarily self-reported.
              </p>
              <p className="text-red-700 font-medium">
                <strong>Emergency:</strong> For acute abdominal pain, heavy bleeding, or high fever, contact your nearest emergency hospital immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Sakhi &bull; Startup Buildathon India 2026 &bull; Web MVP v3.1
          </p>
          <p className="text-center sm:text-right text-[11px]">
            Information only &bull; Not individual medical diagnosis or prescription
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
