import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Book, FileText, Database, Shield, Code, Settings, 
  ChevronRight, ChevronDown, Search, Home, Server,
  Users, Package, Truck, CreditCard, MapPin, Activity,
  CheckCircle, AlertTriangle, XCircle, Info, ExternalLink,
  Copy, Check
} from 'lucide-react';

type Section = 'overview' | 'api' | 'database' | 'security' | 'features' | 'troubleshooting';

export default function Documentation() {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>(['auth', 'loads']);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const toggleExpand = (item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'features', label: 'Features', icon: Settings },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-slate-600 hover:text-green-600"
              >
                <Home className="w-5 h-5" />
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Book className="w-5 h-5 text-green-600" />
                Documentation & Help Center
              </h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-64 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-slate-200 p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Documentation</h3>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id as Section)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Quick Links */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#test-accounts" className="text-green-600 hover:underline flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Test Accounts
                    </a>
                  </li>
                  <li>
                    <a href="#api-base" className="text-green-600 hover:underline flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      API Base URL
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">PakLoad Platform Documentation</h2>
                  <p className="text-slate-600 mb-6">
                    Welcome to the PakLoad documentation. This comprehensive guide covers all aspects of the 
                    China-Pakistan logistics loadboard platform, including API references, database schema, 
                    security features, and troubleshooting guides.
                  </p>

                  {/* Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">API Status</span>
                      </div>
                      <p className="text-sm text-green-700">All systems operational</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Database</span>
                      </div>
                      <p className="text-sm text-green-700">PostgreSQL Connected</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Security</span>
                      </div>
                      <p className="text-sm text-green-700">JWT Authentication Active</p>
                    </div>
                  </div>

                  {/* Quick Start */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Start</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      <div>
                        <h4 className="font-medium text-slate-900">Create an Account</h4>
                        <p className="text-sm text-slate-600">Register as a Shipper or Carrier to access the platform</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      <div>
                        <h4 className="font-medium text-slate-900">Post or Find Loads</h4>
                        <p className="text-sm text-slate-600">Shippers can post loads, Carriers can browse and bid</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      <div>
                        <h4 className="font-medium text-slate-900">Track Shipments</h4>
                        <p className="text-sm text-slate-600">Monitor your shipments in real-time with tracking numbers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Accounts */}
                <div id="test-accounts" className="bg-white rounded-lg border border-slate-200 p-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Test Accounts
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-3 px-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Admin</span></td>
                          <td className="py-3 px-4 font-mono text-slate-600">admin@pakload.com</td>
                          <td className="py-3 px-4 font-mono text-slate-600">admin123</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Shipper</span></td>
                          <td className="py-3 px-4 font-mono text-slate-600">shipper@pakload.com</td>
                          <td className="py-3 px-4 font-mono text-slate-600">shipper123</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Carrier</span></td>
                          <td className="py-3 px-4 font-mono text-slate-600">demo@pakload.com</td>
                          <td className="py-3 px-4 font-mono text-slate-600">carrier123</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* API Reference Section */}
            {activeSection === 'api' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">API Reference</h2>
                  <p className="text-slate-600 mb-6">
                    Complete API documentation for the PakLoad platform. All endpoints use JSON for request/response bodies.
                  </p>

                  <div id="api-base" className="p-4 bg-slate-900 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 text-sm">Base URL</span>
                        <p className="text-green-400 font-mono">http://localhost:5000/api</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard('http://localhost:5000/api', 'base')}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedEndpoint === 'base' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Authentication Endpoints */}
                  <div className="border border-slate-200 rounded-lg mb-4">
                    <button
                      onClick={() => toggleExpand('auth')}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-slate-900">Authentication</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">4 endpoints</span>
                      </div>
                      {expandedItems.includes('auth') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    {expandedItems.includes('auth') && (
                      <div className="border-t border-slate-200 p-4 space-y-4">
                        <EndpointItem 
                          method="POST" 
                          path="/v1/auth/register" 
                          description="Register a new user account"
                          body={{ firstName: 'string', lastName: 'string', email: 'string', password: 'string', role: 'shipper|carrier' }}
                        />
                        <EndpointItem 
                          method="POST" 
                          path="/v1/auth/login" 
                          description="Login with email and password"
                          body={{ email: 'string', password: 'string' }}
                        />
                        <EndpointItem 
                          method="POST" 
                          path="/v1/auth/otp/request" 
                          description="Request OTP for phone login"
                          body={{ phone: 'string' }}
                        />
                        <EndpointItem 
                          method="POST" 
                          path="/v1/auth/otp/verify" 
                          description="Verify OTP and login"
                          body={{ phone: 'string', otp: 'string' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Loads Endpoints */}
                  <div className="border border-slate-200 rounded-lg mb-4">
                    <button
                      onClick={() => toggleExpand('loads')}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-slate-900">Loads</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">5 endpoints</span>
                      </div>
                      {expandedItems.includes('loads') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    {expandedItems.includes('loads') && (
                      <div className="border-t border-slate-200 p-4 space-y-4">
                        <EndpointItem method="GET" path="/loads" description="Get all loads with optional filters" />
                        <EndpointItem method="GET" path="/loads/:id" description="Get a specific load by ID" />
                        <EndpointItem 
                          method="POST" 
                          path="/loads" 
                          description="Create a new load"
                          body={{ origin: 'string', destination: 'string', cargoType: 'string', weight: 'number', pickupDate: 'date' }}
                        />
                        <EndpointItem method="PUT" path="/loads/:id" description="Update an existing load" />
                        <EndpointItem method="DELETE" path="/loads/:id" description="Delete a load" />
                      </div>
                    )}
                  </div>

                  {/* Vehicles Endpoints */}
                  <div className="border border-slate-200 rounded-lg mb-4">
                    <button
                      onClick={() => toggleExpand('vehicles')}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-slate-900">Vehicles/Trucks</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">5 endpoints</span>
                      </div>
                      {expandedItems.includes('vehicles') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    {expandedItems.includes('vehicles') && (
                      <div className="border-t border-slate-200 p-4 space-y-4">
                        <EndpointItem method="GET" path="/trucks" description="Get all vehicles with optional filters" />
                        <EndpointItem method="GET" path="/trucks/:id" description="Get a specific vehicle by ID" />
                        <EndpointItem 
                          method="POST" 
                          path="/trucks" 
                          description="Register a new vehicle"
                          body={{ type: 'string', registrationNumber: 'string', capacity: 'number', currentLocation: 'string' }}
                        />
                        <EndpointItem method="PUT" path="/trucks/:id" description="Update vehicle details" />
                        <EndpointItem method="DELETE" path="/trucks/:id" description="Remove a vehicle" />
                      </div>
                    )}
                  </div>

                  {/* Bookings Endpoints */}
                  <div className="border border-slate-200 rounded-lg mb-4">
                    <button
                      onClick={() => toggleExpand('bookings')}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-slate-900">Bookings</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">3 endpoints</span>
                      </div>
                      {expandedItems.includes('bookings') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    {expandedItems.includes('bookings') && (
                      <div className="border-t border-slate-200 p-4 space-y-4">
                        <EndpointItem method="GET" path="/bookings" description="Get all bookings for current user" />
                        <EndpointItem method="GET" path="/bookings/:trackingNumber" description="Get booking by tracking number" />
                        <EndpointItem 
                          method="POST" 
                          path="/bookings" 
                          description="Create a new booking"
                          body={{ loadId: 'number', carrierId: 'number', price: 'number', pickupDate: 'date' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Admin Endpoints */}
                  <div className="border border-slate-200 rounded-lg mb-4">
                    <button
                      onClick={() => toggleExpand('admin')}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-slate-900">Admin API</span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">49 endpoints</span>
                      </div>
                      {expandedItems.includes('admin') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    {expandedItems.includes('admin') && (
                      <div className="border-t border-slate-200 p-4">
                        <p className="text-sm text-slate-600 mb-4">
                          Admin endpoints require authentication with admin role. Base path: <code className="bg-slate-100 px-2 py-1 rounded">/api/admin</code>
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 bg-slate-50 rounded">
                            <span className="font-medium">Cargo Categories</span>
                            <span className="text-slate-500 ml-2">8 endpoints</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded">
                            <span className="font-medium">Pricing Rules</span>
                            <span className="text-slate-500 ml-2">10 endpoints</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded">
                            <span className="font-medium">Route Pricing</span>
                            <span className="text-slate-500 ml-2">9 endpoints</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded">
                            <span className="font-medium">Platform Config</span>
                            <span className="text-slate-500 ml-2">10 endpoints</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded">
                            <span className="font-medium">Audit Logs</span>
                            <span className="text-slate-500 ml-2">4 endpoints</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded">
                            <span className="font-medium">Routes Management</span>
                            <span className="text-slate-500 ml-2">8 endpoints</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Database Section */}
            {activeSection === 'database' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Database Architecture</h2>
                  <p className="text-slate-600 mb-6">
                    PakLoad uses PostgreSQL with Drizzle ORM for type-safe database operations.
                  </p>

                  {/* Connection Info */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Database Connected</span>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Server:</strong> AWS EC2 PostgreSQL</p>
                      <p><strong>Host:</strong> 13.63.16.242:5432</p>
                      <p><strong>Database:</strong> pakload</p>
                    </div>
                  </div>

                  {/* Tables */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Tables (14 total)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { name: 'users', icon: Users, color: 'blue' },
                      { name: 'loads', icon: Package, color: 'green' },
                      { name: 'vehicles', icon: Truck, color: 'purple' },
                      { name: 'bookings', icon: CreditCard, color: 'amber' },
                      { name: 'routes', icon: MapPin, color: 'red' },
                      { name: 'payments', icon: CreditCard, color: 'emerald' },
                      { name: 'reviews', icon: Activity, color: 'pink' },
                      { name: 'platform_config', icon: Settings, color: 'slate' },
                      { name: 'activity_logs', icon: Activity, color: 'indigo' },
                      { name: 'notifications', icon: Info, color: 'cyan' },
                      { name: 'cargo_categories', icon: Package, color: 'orange' },
                      { name: 'pricing_rules', icon: CreditCard, color: 'teal' },
                      { name: 'route_pricing', icon: MapPin, color: 'violet' },
                      { name: 'audit_logs', icon: FileText, color: 'rose' },
                    ].map((table) => (
                      <div key={table.name} className={`p-3 bg-${table.color}-50 border border-${table.color}-200 rounded-lg flex items-center gap-2`}>
                        <table.icon className={`w-4 h-4 text-${table.color}-600`} />
                        <span className="text-sm font-medium text-slate-700">{table.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Data Flow */}
                  <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Data Flow</h3>
                  <div className="p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-300">
                    <pre>{`Frontend Request
    ↓
API Route (/api/*)
    ↓
Repository (Business Logic)
    ↓
Drizzle ORM
    ↓
PostgreSQL Database (EC2)
    ↓
Real Data Response`}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Security & Authentication</h2>
                  
                  {/* Auth Flow */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Authentication Flow</h3>
                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">JWT Token Authentication</h4>
                      <p className="text-sm text-slate-600">
                        All authenticated requests require a Bearer token in the Authorization header.
                      </p>
                      <code className="block mt-2 p-2 bg-slate-900 text-green-400 rounded text-sm">
                        Authorization: Bearer &lt;token&gt;
                      </code>
                    </div>
                  </div>

                  {/* RBAC */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Role-Based Access Control</h3>
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Permissions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-3 px-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Admin</span></td>
                          <td className="py-3 px-4 text-slate-600">Full access to all endpoints including admin panel</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Shipper</span></td>
                          <td className="py-3 px-4 text-slate-600">Post loads, view carriers, manage bookings</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Carrier</span></td>
                          <td className="py-3 px-4 text-slate-600">Browse loads, manage vehicles, submit quotes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Middleware */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Middleware</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <code className="text-sm text-purple-600">requireAuth</code>
                      <p className="text-sm text-slate-600 mt-2">Validates JWT token</p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <code className="text-sm text-purple-600">requireAdmin</code>
                      <p className="text-sm text-slate-600 mt-2">Ensures admin role</p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <code className="text-sm text-purple-600">requireRole(...)</code>
                      <p className="text-sm text-slate-600 mt-2">Flexible role checking</p>
                    </div>
                  </div>

                  {/* Audit Logging */}
                  <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Audit Logging</h3>
                  <p className="text-slate-600 mb-4">All admin actions are automatically logged with:</p>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li>User ID and action type</li>
                    <li>Entity type and ID</li>
                    <li>Old and new values (change detection)</li>
                    <li>IP address and user agent</li>
                    <li>Timestamp and severity level</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Platform Features</h2>
                  
                  {/* Feature Status */}
                  <div className="space-y-4">
                    <FeatureItem title="User Authentication" status="complete" description="Email/password login, OTP verification, JWT tokens" />
                    <FeatureItem title="Load Management" status="complete" description="Post, search, filter, and bid on loads" />
                    <FeatureItem title="Vehicle Management" status="complete" description="Register and manage fleet vehicles" />
                    <FeatureItem title="Booking System" status="complete" description="Create and track bookings" />
                    <FeatureItem title="Admin Dashboard" status="complete" description="49 admin API endpoints with RBAC" />
                    <FeatureItem title="Real-time Stats" status="complete" description="Live platform statistics" />
                    <FeatureItem title="Profile Management" status="complete" description="Edit profile and change password" />
                    <FeatureItem title="Toast Notifications" status="complete" description="Success/error feedback system" />
                    <FeatureItem title="Form Validation" status="complete" description="Client-side validation on all forms" />
                    <FeatureItem title="Publishing Workflow" status="complete" description="Draft → Published → Archived states" />
                  </div>
                </div>
              </div>
            )}

            {/* Troubleshooting Section */}
            {activeSection === 'troubleshooting' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Troubleshooting Guide</h2>
                  
                  <div className="space-y-6">
                    <TroubleshootItem 
                      title="Cannot login - Invalid credentials"
                      solution="Verify email and password. Use test accounts: admin@pakload.com / admin123"
                    />
                    <TroubleshootItem 
                      title="API returns 401 Unauthorized"
                      solution="Ensure you're sending the Authorization header with a valid Bearer token"
                    />
                    <TroubleshootItem 
                      title="Database connection failed"
                      solution="Check that PostgreSQL is running and .env has correct DATABASE_URL"
                    />
                    <TroubleshootItem 
                      title="CORS errors in browser"
                      solution="Backend allows localhost:5173. For other origins, update CORS config in server/index.ts"
                    />
                    <TroubleshootItem 
                      title="Vehicle creation fails"
                      solution="Ensure status is 'active', 'maintenance', or 'inactive' (not 'available')"
                    />
                    <TroubleshootItem 
                      title="Load status mismatch"
                      solution="Use 'posted' status for new loads, not 'available'"
                    />
                  </div>

                  {/* Contact Support */}
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Need More Help?</h3>
                    <p className="text-sm text-blue-700">
                      Contact the development team or check the GitHub repository for more information.
                    </p>
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
function EndpointItem({ method, path, description, body }: { method: string; path: string; description: string; body?: Record<string, string> }) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-2 py-1 rounded text-xs font-bold ${methodColors[method]}`}>{method}</span>
        <code className="text-sm text-slate-700">{path}</code>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
      {body && (
        <div className="mt-2 p-2 bg-slate-900 rounded text-xs font-mono text-slate-300">
          {JSON.stringify(body, null, 2)}
        </div>
      )}
    </div>
  );
}

function FeatureItem({ title, status, description }: { title: string; status: 'complete' | 'partial' | 'planned'; description: string }) {
  const statusConfig = {
    complete: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Complete' },
    partial: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Partial' },
    planned: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Planned' },
  };
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`p-4 ${config.bg} rounded-lg flex items-start gap-4`}>
      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-900">{title}</h4>
          <span className={`text-xs ${config.color}`}>({config.label})</span>
        </div>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

function TroubleshootItem({ title, solution }: { title: string; solution: string }) {
  return (
    <div className="border-l-4 border-amber-400 pl-4">
      <h4 className="font-medium text-slate-900 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        {title}
      </h4>
      <p className="text-sm text-slate-600 mt-1">
        <strong>Solution:</strong> {solution}
      </p>
    </div>
  );
}
