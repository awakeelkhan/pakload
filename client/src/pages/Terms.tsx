import { Link } from 'wouter';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
              <p className="text-slate-600 mt-1">Effective Date: January 11, 2026</p>
            </div>
          </div>
          
          <p className="text-slate-600 leading-relaxed">
            These Terms of Service govern your use of the PakLoad logistics platform. By using our services, you agree to these terms.
          </p>
        </div>

        {/* Partnership Agreement Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Partnership Agreement</h2>
          </div>
          
          <div className="bg-white rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Parties to the Agreement</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Service Provider</h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <p><strong>Hypercloud Technology Partners</strong></p>
                  <p>Address: G9/4, Pakistan</p>
                  <p>Phone: 0313-9986357</p>
                  <p>Email: abdul.wakeel@hypercloud.pk</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Platform Owner</h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <p><strong>Zhengrong</strong></p>
                  <p>Address: B17, Pakistan</p>
                  <p>Phone: +92 51 8897668</p>
                  <p>Email: info@zhengrong.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Project Cost & Payment Structure
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Total Development Cost:</strong> PKR 1,500,000</p>
                <div className="ml-4 mt-2">
                  <p className="font-medium text-slate-900">Cash Payment: PKR 1,000,000</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>40% at project start</li>
                    <li>30% at mid-stage</li>
                    <li>30% upon final delivery</li>
                  </ul>
                </div>
                <div className="ml-4 mt-2">
                  <p className="font-medium text-slate-900">Service Partnership: PKR 500,000 (Value-Based)</p>
                  <p className="ml-4 mt-1">20% of net profit, payable quarterly after profitability</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Ownership & Intellectual Property
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Upon completion and full payment:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All rights and ownership vest exclusively in Zhengrong</li>
                  <li>Zhengrong retains exclusive rights over business model, branding, and revenue</li>
                  <li>Hypercloud may showcase project for portfolio purposes</li>
                  <li>Hypercloud retains ownership of proprietary development methods</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">User Accounts</h2>
            <div className="space-y-3 text-slate-600">
              <p>To use PakLoad, you must:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Platform Services</h2>
            <div className="space-y-3 text-slate-600">
              <p>PakLoad provides:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Load posting and matching services</li>
                <li>Carrier verification and ratings</li>
                <li>Real-time shipment tracking</li>
                <li>Secure payment processing</li>
                <li>Communication tools between shippers and carriers</li>
              </ul>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">User Responsibilities</h2>
            <div className="space-y-3 text-slate-600">
              <p><strong>Shippers must:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide accurate load information</li>
                <li>Ensure cargo is properly packaged</li>
                <li>Have necessary permits and documentation</li>
                <li>Pay agreed rates on time</li>
              </ul>
              <p className="mt-4"><strong>Carriers must:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Maintain valid licenses and insurance</li>
                <li>Provide accurate vehicle information</li>
                <li>Deliver shipments safely and on time</li>
                <li>Update tracking information regularly</li>
              </ul>
            </div>
          </section>

          {/* Fees and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Fees and Payments</h2>
            <div className="space-y-3 text-slate-600">
              <p>PakLoad charges service fees for platform usage. All fees are clearly displayed before transaction confirmation.</p>
              <p className="font-semibold text-slate-900">Excluded costs (paid by users):</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Payment processing fees</li>
                <li>Insurance costs</li>
                <li>Fuel and operational expenses</li>
                <li>Customs and duties</li>
              </ul>
            </div>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              PakLoad acts as a platform connecting shippers and carriers. We are not responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-slate-600 mt-2">
              <li>Loss or damage to cargo</li>
              <li>Delays in delivery</li>
              <li>Disputes between users</li>
              <li>Third-party service failures</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Termination</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose security risks.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms are governed by the laws of Pakistan. Any disputes shall be resolved in Pakistani courts.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h2>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <p><strong>Legal Inquiries:</strong> legal@pakload.com</p>
              <p><strong>Technical Support:</strong> abdul.wakeel@hypercloud.pk</p>
              <p><strong>Business Support:</strong> info@zhengrong.com</p>
              <p><strong>Phone:</strong> +92 51 8897668</p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/">
            <a className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
