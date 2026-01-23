import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Settings, Package, DollarSign, MapPin, Database, 
  FileText, Shield, TrendingUp, ChevronRight, Activity
} from 'lucide-react';

export default function AdminSettings() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({
    categories: { total: 0, published: 0, draft: 0 },
    pricingRules: { total: 0, active: 0, draft: 0 },
    routePricing: { total: 0, published: 0 },
    configs: { total: 0, published: 0 },
    auditLogs: { total: 0, today: 0 },
    routes: { total: 0, popular: 0 },
  });

  const settingsModules = [
    {
      title: 'Cargo Categories',
      description: 'Manage cargo types, base rates, and category settings',
      icon: Package,
      path: '/admin/settings/categories',
      color: 'bg-blue-500',
      stats: `${stats.categories.published}/${stats.categories.total} published`,
    },
    {
      title: 'Pricing Rules',
      description: 'Configure dynamic pricing rules and conditions',
      icon: DollarSign,
      path: '/admin/settings/pricing-rules',
      color: 'bg-green-500',
      stats: `${stats.pricingRules.active} active rules`,
    },
    {
      title: 'Route Pricing',
      description: 'Set route-specific pricing and surge multipliers',
      icon: MapPin,
      path: '/admin/settings/route-pricing',
      color: 'bg-purple-500',
      stats: `${stats.routePricing.total} routes configured`,
    },
    {
      title: 'Platform Config',
      description: 'System-wide configuration and feature flags',
      icon: Database,
      path: '/admin/settings/config',
      color: 'bg-orange-500',
      stats: `${stats.configs.published} active configs`,
    },
    {
      title: 'Routes Management',
      description: 'Manage routes, distances, and route analytics',
      icon: TrendingUp,
      path: '/admin/settings/routes',
      color: 'bg-indigo-500',
      stats: `${stats.routes.total} total routes`,
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and admin action history',
      icon: FileText,
      path: '/admin/settings/audit-logs',
      color: 'bg-red-500',
      stats: `${stats.auditLogs.today} actions today`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <button onClick={() => navigate('/dashboard')} className="hover:text-gray-700">Dashboard</button>
                <ChevronRight className="w-4 h-4" />
                <span>Admin Settings</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                Admin Settings
              </h1>
              <p className="mt-2 text-gray-600">
                Manage platform configuration, pricing, and system settings
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-xs text-green-600 font-medium">System Status</div>
                <div className="text-sm font-bold text-green-700">All Systems Operational</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modules Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsModules.map((module) => (
            <button 
              key={module.path} 
              onClick={() => navigate(module.path)}
              className="block group text-left w-full"
            >
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-blue-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${module.color} p-3 rounded-lg`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-500">
                      {module.stats}
                    </span>
                    <span className="text-xs text-blue-600 font-medium group-hover:underline">
                      Manage →
                    </span>
                  </div>
                </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left">
              <div className="font-medium">Publish All Drafts</div>
              <div className="text-xs text-blue-600 mt-1">Review and publish pending changes</div>
            </button>
            
            <button className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left">
              <div className="font-medium">Export Configuration</div>
              <div className="text-xs text-green-600 mt-1">Download current settings as JSON</div>
            </button>
            
            <button className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <div className="font-medium">View System Health</div>
              <div className="text-xs text-purple-600 mt-1">Check platform performance metrics</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Admin Activity
            </h2>
            <button onClick={() => navigate('/admin/settings/audit-logs')} className="text-sm text-blue-600 hover:underline">View All →</button>
          </div>
          
          <div className="space-y-3">
            {[
              { action: 'Published', entity: 'Pricing Rule', name: 'Heavy Weight Surcharge', time: '5 minutes ago', user: 'Admin User' },
              { action: 'Updated', entity: 'Category', name: 'Electronics', time: '1 hour ago', user: 'Admin User' },
              { action: 'Created', entity: 'Route Pricing', name: 'Karachi → Lahore', time: '2 hours ago', user: 'Admin User' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action === 'Published' ? 'bg-green-500' :
                    activity.action === 'Updated' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {activity.action} {activity.entity}: <span className="text-blue-600">{activity.name}</span>
                    </div>
                    <div className="text-xs text-gray-500">{activity.user} • {activity.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
