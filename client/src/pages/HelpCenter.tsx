import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  HelpCircle, Book, Package, Truck, Users, Shield, 
  ChevronRight, ChevronDown, Search, Home, Play,
  CheckCircle, MapPin, CreditCard, Bell, FileText,
  Phone, Mail, MessageSquare, Star, Clock, ArrowRight,
  Bookmark, Eye, Edit, Trash2, Plus, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type UserRole = 'shipper' | 'carrier' | 'admin' | 'all';
type Section = 'getting-started' | 'shipper' | 'carrier' | 'admin' | 'faq';

export default function HelpCenter() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: Play, color: 'green' },
    { id: 'shipper', label: 'For Shippers', icon: Package, color: 'blue' },
    { id: 'carrier', label: 'For Carriers', icon: Truck, color: 'purple' },
    { id: 'admin', label: 'For Admins', icon: Shield, color: 'red' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, color: 'amber' },
  ];

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click 'Sign Up' on the homepage, choose your role (Shipper or Carrier), fill in your details, and verify your email. You'll be ready to use the platform immediately."
    },
    {
      question: "How do I post a load?",
      answer: "After logging in as a Shipper, click 'Post Load' in the navigation. Fill out the 6-step form with origin, destination, cargo details, schedule, and pricing. Submit to make your load visible to carriers."
    },
    {
      question: "How do I find available loads?",
      answer: "As a Carrier, go to 'Find Loads' page. Use filters to narrow down by origin, destination, cargo type, or date. Click on any load to see details and submit a quote."
    },
    {
      question: "How do I track my shipment?",
      answer: "Use the 'Track Shipment' feature in the navigation. Enter your tracking number to see real-time status, location, and estimated delivery time."
    },
    {
      question: "How do I add my vehicles?",
      answer: "Carriers can add vehicles from Dashboard > My Vehicles. Click 'Add Vehicle', enter details like type, registration, capacity, and current location."
    },
    {
      question: "How do I submit a quote/bid?",
      answer: "When viewing a load, click 'Submit Quote'. Enter your proposed price and any notes. The shipper will review and accept or negotiate."
    },
    {
      question: "How do I change my password?",
      answer: "Go to Profile > Click 'Change Password'. Enter your current password and new password twice to confirm."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We support bank transfers, mobile wallets (JazzCash, Easypaisa), and credit/debit cards. Payment terms are agreed between shipper and carrier."
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-green-100 text-sm mb-4">
            <button onClick={() => navigate('/')} className="hover:text-white">Home</button>
            <ChevronRight className="w-4 h-4" />
            <span>Help Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-green-100 text-lg mb-6">Find guides, tutorials, and answers to common questions</p>
          
          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-green-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-16 mb-12">
          <button 
            onClick={() => setActiveSection('shipper')}
            className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border border-slate-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">I'm a Shipper</h3>
            <p className="text-sm text-slate-600">Learn how to post loads, find carriers, and manage shipments</p>
          </button>

          <button 
            onClick={() => setActiveSection('carrier')}
            className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border border-slate-200"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">I'm a Carrier</h3>
            <p className="text-sm text-slate-600">Learn how to find loads, manage your fleet, and grow your business</p>
          </button>

          <button 
            onClick={() => setActiveSection('admin')}
            className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border border-slate-200"
          >
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">I'm an Admin</h3>
            <p className="text-sm text-slate-600">Learn how to manage the platform, users, and settings</p>
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <nav className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Help Topics</h3>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id as Section)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? `bg-${section.color}-50 text-${section.color}-700 font-medium`
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Contact Support */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Need More Help?</h3>
                <div className="space-y-3">
                  <a href="mailto:support@pakload.com" className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-600">
                    <Mail className="w-4 h-4" />
                    support@pakload.com
                  </a>
                  <a href="tel:+923001234567" className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-600">
                    <Phone className="w-4 h-4" />
                    +92 300 123 4567
                  </a>
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Getting Started */}
            {activeSection === 'getting-started' && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Getting Started with PakLoad</h2>
                  
                  <div className="space-y-6">
                    <StepCard 
                      number={1}
                      title="Create Your Account"
                      description="Sign up as a Shipper (to post loads) or Carrier (to transport goods). Verification takes just a few minutes."
                      icon={Users}
                    />
                    <StepCard 
                      number={2}
                      title="Complete Your Profile"
                      description="Add your company details, contact information, and verification documents for better trust."
                      icon={Edit}
                    />
                    <StepCard 
                      number={3}
                      title="Start Using the Platform"
                      description="Shippers can post loads immediately. Carriers can browse loads and submit quotes."
                      icon={Play}
                    />
                    <StepCard 
                      number={4}
                      title="Track & Manage"
                      description="Use your dashboard to track shipments, manage bookings, and communicate with partners."
                      icon={Eye}
                    />
                  </div>
                </div>

                {/* Video Tutorials Placeholder */}
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-600" />
                    Video Tutorials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">How to Post Your First Load</p>
                      </div>
                    </div>
                    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Finding and Bidding on Loads</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipper Guide */}
            {activeSection === 'shipper' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Shipper's Guide</h2>
                      <p className="text-slate-600">Everything you need to know about posting and managing loads</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <GuideSection 
                      title="How to Post a Load"
                      steps={[
                        "Click 'Post Load' in the navigation menu",
                        "Enter origin and destination cities",
                        "Specify cargo type, weight, and dimensions",
                        "Set pickup and delivery dates",
                        "Enter your price or mark as 'Open for Quotes'",
                        "Add any special requirements (refrigeration, hazmat, etc.)",
                        "Review and submit your load"
                      ]}
                    />

                    <GuideSection 
                      title="Managing Your Loads"
                      steps={[
                        "View all your loads from Dashboard > My Loads",
                        "Edit load details before a carrier accepts",
                        "View quotes from carriers and compare prices",
                        "Accept a quote to book the carrier",
                        "Track your shipment in real-time",
                        "Mark as delivered when complete"
                      ]}
                    />

                    <GuideSection 
                      title="Finding Carriers"
                      steps={[
                        "Go to 'Find Trucks' to browse available carriers",
                        "Filter by location, vehicle type, and capacity",
                        "View carrier profiles, ratings, and reviews",
                        "Send a quote request directly to carriers",
                        "Compare multiple quotes before deciding"
                      ]}
                    />

                    <TipBox 
                      title="Pro Tip"
                      content="Add detailed descriptions and photos of your cargo to attract more carriers and get better quotes."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Carrier Guide */}
            {activeSection === 'carrier' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Carrier's Guide</h2>
                      <p className="text-slate-600">Learn how to find loads and grow your transport business</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <GuideSection 
                      title="Finding Loads"
                      steps={[
                        "Go to 'Find Loads' in the navigation",
                        "Use filters: origin, destination, cargo type, dates",
                        "Save frequent searches for quick access",
                        "Click on a load to see full details",
                        "Check shipper's profile and ratings",
                        "Submit your quote with your best price"
                      ]}
                    />

                    <GuideSection 
                      title="Managing Your Fleet"
                      steps={[
                        "Go to Dashboard > My Vehicles",
                        "Click 'Add Vehicle' to register a new truck",
                        "Enter vehicle type, registration, and capacity",
                        "Set current location for better matching",
                        "Update vehicle status (Available, In Use, Maintenance)",
                        "Keep maintenance records up to date"
                      ]}
                    />

                    <GuideSection 
                      title="Submitting Quotes"
                      steps={[
                        "Find a load that matches your route",
                        "Click 'Submit Quote' on the load details",
                        "Enter your proposed price",
                        "Add any notes or conditions",
                        "Wait for shipper's response",
                        "If accepted, confirm and start the job"
                      ]}
                    />

                    <GuideSection 
                      title="Completing Deliveries"
                      steps={[
                        "Update shipment status as you progress",
                        "Use the tracking feature to share location",
                        "Get proof of delivery signed",
                        "Upload delivery confirmation",
                        "Request payment through the platform",
                        "Ask shipper for a review"
                      ]}
                    />

                    <TipBox 
                      title="Pro Tip"
                      content="Keep your vehicle information and availability updated to appear in more search results and get more job offers."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Admin Guide */}
            {activeSection === 'admin' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Admin Guide</h2>
                      <p className="text-slate-600">Platform management and configuration</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <GuideSection 
                      title="Accessing Admin Panel"
                      steps={[
                        "Login with your admin account",
                        "Click your profile icon > Admin Dashboard",
                        "Or go to Admin Settings for configuration",
                        "View platform statistics and activity"
                      ]}
                    />

                    <GuideSection 
                      title="Managing Cargo Categories"
                      steps={[
                        "Go to Admin Settings > Cargo Categories",
                        "Add new cargo types with base rates",
                        "Edit existing categories",
                        "Publish/unpublish categories",
                        "Set display order for the UI"
                      ]}
                    />

                    <GuideSection 
                      title="Configuring Pricing Rules"
                      steps={[
                        "Go to Admin Settings > Pricing Rules",
                        "Create rules based on weight, distance, or cargo type",
                        "Set multipliers and surcharges",
                        "Activate rules for automatic pricing",
                        "Test rules before publishing"
                      ]}
                    />

                    <GuideSection 
                      title="Managing Routes"
                      steps={[
                        "Go to Admin Settings > Routes Management",
                        "Add new routes with origin/destination",
                        "Set distances and estimated transit times",
                        "Configure route-specific pricing",
                        "Mark popular routes for promotion"
                      ]}
                    />

                    <GuideSection 
                      title="Viewing Audit Logs"
                      steps={[
                        "Go to Admin Settings > Audit Logs",
                        "View all admin actions with timestamps",
                        "Filter by user, action type, or date",
                        "Export logs for compliance",
                        "Monitor for suspicious activity"
                      ]}
                    />

                    <TipBox 
                      title="Important"
                      content="All admin actions are logged for security and compliance. Always use the publishing workflow (Draft → Published) for configuration changes."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeSection === 'faq' && (
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-900">{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4 text-slate-600">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Still Need Help */}
                <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Still have questions?</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Our support team is here to help you 24/7.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href="mailto:support@pakload.com"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email Support
                    </a>
                    <a 
                      href="tel:+923001234567"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Call Us
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StepCard({ number, title, description, icon: Icon }: { number: number; title: string; description: string; icon: any }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <Icon className="w-6 h-6 text-slate-400 flex-shrink-0" />
    </div>
  );
}

function GuideSection({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="border-l-4 border-green-500 pl-4">
      <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
            <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function TipBox({ title, content }: { title: string; content: string }) {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h4 className="font-semibold text-amber-800 mb-1 flex items-center gap-2">
        <Star className="w-4 h-4" />
        {title}
      </h4>
      <p className="text-sm text-amber-700">{content}</p>
    </div>
  );
}
