import { Link } from 'wouter';
import { Users, Target, Award, Zap, Shield, Globe, Building, Code } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About PakLoad</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Revolutionizing logistics along the China-Pakistan Economic Corridor with cutting-edge technology and reliable service.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                To provide a seamless, transparent, and efficient logistics platform that connects shippers and carriers across the CPEC route, enabling businesses to grow and thrive through reliable transportation solutions.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
              <p className="text-slate-600 leading-relaxed">
                To become the leading digital logistics platform in Pakistan and beyond, facilitating international trade and strengthening economic ties between China and Pakistan through innovative technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Trust & Security</h3>
              <p className="text-sm text-slate-600">Verified carriers and secure transactions</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Innovation</h3>
              <p className="text-sm text-slate-600">Cutting-edge technology solutions</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Excellence</h3>
              <p className="text-sm text-slate-600">Commitment to quality service</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Partnership</h3>
              <p className="text-sm text-slate-600">Building lasting relationships</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Partnership</h2>
            <p className="text-lg text-slate-600">Built through collaboration and expertise</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Hypercloud Technology Partners */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Hypercloud Technology Partners</h3>
                  <p className="text-green-700 font-medium">Technical Development Partner</p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-6 leading-relaxed">
                Leading technology service provider specializing in mobile applications, web platforms, and cloud infrastructure. Hypercloud brings cutting-edge technical expertise to deliver world-class digital solutions.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-slate-700">iOS & Android Mobile Development</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-slate-700">Web-Based Admin Panel & Backend Systems</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-slate-700">AWS Cloud Deployment & Infrastructure</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Contact:</strong> abdul.wakeel@hypercloud.pk</p>
                <p><strong>Phone:</strong> 0313-9986357</p>
                <p><strong>Location:</strong> G9/4, Pakistan</p>
              </div>
            </div>

            {/* Zhengrong */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Zhengrong</h3>
                  <p className="text-blue-700 font-medium">Platform Owner & Operations</p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-6 leading-relaxed">
                Business operations and platform ownership, driving the vision for seamless logistics solutions across the China-Pakistan Economic Corridor. Zhengrong manages all business strategy, operations, and market expansion.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-slate-700">Business Strategy & Operations Management</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-slate-700">Market Expansion & Partnership Development</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-slate-700">Platform Ownership & Revenue Management</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Contact:</strong> info@zhengrong.com</p>
                <p><strong>Phone:</strong> +92 51 8897668</p>
                <p><strong>Location:</strong> B17, Pakistan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-slate-600">Verified Carriers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
              <div className="text-slate-600">Loads Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">25+</div>
              <div className="text-slate-600">Active Routes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-slate-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of businesses using PakLoad for their logistics needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <a className="px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors">
                Sign Up Free
              </a>
            </Link>
            <Link href="/contact">
              <a className="px-8 py-4 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors">
                Contact Us
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <div className="py-8 text-center bg-slate-50">
        <Link href="/">
          <a className="text-green-600 hover:text-green-700 font-medium">
            ← Back to Home
          </a>
        </Link>
      </div>
    </div>
  );
}
