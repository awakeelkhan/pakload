import { Link } from 'wouter';
import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-600 mt-1">Last updated: January 11, 2026</p>
            </div>
          </div>
          
          <p className="text-slate-600 leading-relaxed">
            PakLoad is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our logistics platform.
          </p>
        </div>

        {/* Company Information */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Providers</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Hypercloud Technology Partners */}
            <div className="bg-white rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Hypercloud Technology Partners</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Address:</strong> G9/4, Pakistan</p>
                <p><strong>Phone:</strong> 0313-9986357</p>
                <p><strong>Email:</strong> abdul.wakeel@hypercloud.pk</p>
                <p className="mt-4 text-xs text-slate-500">Technical Development & Service Provider</p>
              </div>
            </div>

            {/* Zhengrong */}
            <div className="bg-white rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Zhengrong</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Address:</strong> B17, Pakistan</p>
                <p><strong>Phone:</strong> +92 51 8897668</p>
                <p><strong>Email:</strong> info@zhengrong.com</p>
                <p className="mt-4 text-xs text-slate-500">Platform Owner & Business Operations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-slate-900">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Company name and business information</li>
                  <li>Payment and billing information</li>
                  <li>Government-issued identification (for verification)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Load and shipment details</li>
                  <li>Vehicle information</li>
                  <li>GPS location data (for tracking)</li>
                  <li>Communication records</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-slate-900">How We Use Your Information</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>To provide and maintain our logistics services</li>
              <li>To process transactions and send notifications</li>
              <li>To improve our platform and user experience</li>
              <li>To communicate with you about services and updates</li>
              <li>To ensure security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-slate-900">Data Security</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              We implement industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest. We use secure AWS cloud infrastructure and regularly update our security protocols.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-slate-900">Data Sharing</h2>
            </div>
            <div className="space-y-3 text-slate-600">
              <p>We may share your information with:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Other users (shippers and carriers) to facilitate transactions</li>
                <li>Service providers who assist in platform operations</li>
                <li>Payment processors for transaction processing</li>
                <li>Law enforcement when required by law</li>
              </ul>
              <p className="font-semibold text-slate-900 mt-4">
                We never sell your personal information to third parties.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies & Tracking</h2>
            <p className="text-slate-600 leading-relaxed">
              We use cookies and similar tracking technologies to improve your experience, analyze usage patterns, and deliver personalized content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p className="text-slate-600 mb-4">
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <p><strong>Email:</strong> privacy@pakload.com</p>
              <p><strong>Technical Support:</strong> abdul.wakeel@hypercloud.pk</p>
              <p><strong>Business Inquiries:</strong> info@zhengrong.com</p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/">
            <a className="text-green-600 hover:text-green-700 font-medium">
              ← Back to Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
