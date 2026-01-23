import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LP</span>
              </div>
              <h3 className="text-white font-bold text-xl">PakLoad</h3>
            </div>
            <p className="text-sm mb-4">
              Revolutionizing logistics along the China-Pakistan Economic Corridor with cutting-edge technology and reliable service.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/loads')} className="hover:text-green-400 transition-colors">Find Loads</button></li>
              <li><button onClick={() => navigate('/trucks')} className="hover:text-green-400 transition-colors">Find Trucks</button></li>
              <li><button onClick={() => navigate('/post-load')} className="hover:text-green-400 transition-colors">Post a Load</button></li>
              <li><button onClick={() => navigate('/track')} className="hover:text-green-400 transition-colors">Track Shipment</button></li>
              <li><button onClick={() => navigate('/routes')} className="hover:text-green-400 transition-colors">CPEC Routes</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/about')} className="hover:text-green-400 transition-colors">About Us</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-green-400 transition-colors">Contact Us</button></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-green-400 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-green-400 transition-colors">Terms of Service</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@pakload.com" className="hover:text-green-400 transition-colors">
                  info@pakload.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="tel:+925188897668" className="hover:text-green-400 transition-colors">
                  +92 51 8897668
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} PakLoad. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="text-slate-500">Powered by Hypercloud Technology & Zhengrong</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
