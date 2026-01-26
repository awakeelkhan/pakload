import { useState, useEffect } from 'react';
import { 
  Settings, Save, RefreshCw, DollarSign, Percent, 
  FileText, Bell, Shield, Globe, Truck, AlertCircle,
  Check, X, ChevronDown, ChevronRight
} from 'lucide-react';

interface ConfigItem {
  key: string;
  value: string;
  category: string;
  dataType: string;
  description: string;
  isPublic: boolean;
  status: string;
}

interface ConfigCategory {
  name: string;
  icon: any;
  description: string;
  configs: ConfigItem[];
}

const CATEGORY_INFO: Record<string, { icon: any; description: string }> = {
  fees: { icon: DollarSign, description: 'Platform fee settings' },
  taxes: { icon: Percent, description: 'GST and tax configuration' },
  limits: { icon: Shield, description: 'User and load limits' },
  bidding: { icon: FileText, description: 'Bidding system settings' },
  payments: { icon: DollarSign, description: 'Payment processing settings' },
  verification: { icon: Shield, description: 'Document verification settings' },
  notifications: { icon: Bell, description: 'Notification preferences' },
  ratings: { icon: FileText, description: 'Rating system settings' },
  builty: { icon: Truck, description: 'Builty receipt settings' },
  market_requests: { icon: Globe, description: 'Market request settings' },
  currency: { icon: Globe, description: 'Currency settings' },
  tir: { icon: Truck, description: 'TIR international settings' },
  system: { icon: Settings, description: 'System settings' },
  general: { icon: Settings, description: 'General settings' },
};

export function AdminSettings() {
  const [configs, setConfigs] = useState<Record<string, ConfigItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['fees', 'taxes']);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/by-category', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch configurations');
      }
      
      const data = await response.json();
      setConfigs(data.configs || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeConfigs = async () => {
    try {
      setInitializing(true);
      const response = await fetch('/api/admin/settings/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize configurations');
      }
      
      const data = await response.json();
      setSuccess(`Initialized ${data.created} configurations`);
      fetchConfigs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInitializing(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async (key: string) => {
    const newValue = editedValues[key];
    if (newValue === undefined) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: newValue }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      setSuccess(`${key} updated successfully`);
      setEditedValues(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      fetchConfigs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveBulkConfigs = async () => {
    if (Object.keys(editedValues).length === 0) return;

    try {
      setSaving(true);
      const updates = Object.entries(editedValues).map(([key, value]) => ({
        key,
        value,
      }));

      const response = await fetch('/api/admin/settings/bulk/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configurations');
      }
      
      setSuccess(`${updates.length} configurations updated`);
      setEditedValues({});
      fetchConfigs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderConfigInput = (config: ConfigItem) => {
    const currentValue = editedValues[config.key] ?? config.value;
    const isEdited = editedValues[config.key] !== undefined;

    if (config.dataType === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleValueChange(config.key, currentValue === 'true' ? 'false' : 'true')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              currentValue === 'true' ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                currentValue === 'true' ? 'left-7' : 'left-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">
            {currentValue === 'true' ? 'Enabled' : 'Disabled'}
          </span>
          {isEdited && (
            <button
              onClick={() => saveConfig(config.key)}
              className="ml-2 p-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Check className="h-3 w-3" />
            </button>
          )}
        </div>
      );
    }

    if (config.dataType === 'number') {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleValueChange(config.key, e.target.value)}
            className={`w-32 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              isEdited ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
            }`}
          />
          {isEdited && (
            <>
              <button
                onClick={() => saveConfig(config.key)}
                className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={() => setEditedValues(prev => {
                  const { [config.key]: _, ...rest } = prev;
                  return rest;
                })}
                className="p-1 bg-gray-300 text-gray-600 rounded hover:bg-gray-400"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      );
    }

    if (config.dataType === 'json') {
      return (
        <div className="flex items-center gap-2">
          <textarea
            value={currentValue}
            onChange={(e) => handleValueChange(config.key, e.target.value)}
            rows={2}
            className={`w-64 px-3 py-1.5 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary ${
              isEdited ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
            }`}
          />
          {isEdited && (
            <button
              onClick={() => saveConfig(config.key)}
              className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Check className="h-3 w-3" />
            </button>
          )}
        </div>
      );
    }

    // Default: string
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => handleValueChange(config.key, e.target.value)}
          className={`w-64 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
            isEdited ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
          }`}
        />
        {isEdited && (
          <>
            <button
              onClick={() => saveConfig(config.key)}
              className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => setEditedValues(prev => {
                const { [config.key]: _, ...rest } = prev;
                return rest;
              })}
              className="p-1 bg-gray-300 text-gray-600 rounded hover:bg-gray-400"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = Object.keys(configs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Platform Settings
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Configure platform fees, taxes, limits, and other settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {Object.keys(editedValues).length > 0 && (
            <button
              onClick={saveBulkConfigs}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save All ({Object.keys(editedValues).length})
            </button>
          )}
          <button
            onClick={fetchConfigs}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {categories.length === 0 && (
            <button
              onClick={initializeConfigs}
              disabled={initializing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {initializing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              Initialize Defaults
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <AlertCircle className="h-5 w-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
          <Check className="h-5 w-5" />
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* No configs message */}
      {categories.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No configurations found</h3>
          <p className="text-gray-500 mt-1">Click "Initialize Defaults" to set up default configurations</p>
        </div>
      )}

      {/* Configuration Categories */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryInfo = CATEGORY_INFO[category] || CATEGORY_INFO.general;
          const Icon = categoryInfo.icon;
          const isExpanded = expandedCategories.includes(category);
          const categoryConfigs = configs[category] || [];

          return (
            <div key={category} className="bg-white border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium capitalize">{category.replace(/_/g, ' ')}</h3>
                    <p className="text-sm text-gray-500">{categoryInfo.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{categoryConfigs.length} settings</span>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Setting</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Public</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {categoryConfigs.map((config) => (
                        <tr key={config.key} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm">{config.key}</div>
                            {config.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{config.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {renderConfigInput(config)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                              {config.dataType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {config.isPublic ? (
                              <span className="text-green-600 text-xs">Public</span>
                            ) : (
                              <span className="text-gray-400 text-xs">Private</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {/* Platform Fee Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-8 w-8" />
            <div>
              <h3 className="font-bold text-lg">Platform Fee</h3>
              <p className="text-green-100 text-sm">Hidden from users</p>
            </div>
          </div>
          <div className="text-3xl font-bold">
            {configs.fees?.find(c => c.key === 'platform_fee_percent')?.value || '5'}%
          </div>
          <div className="text-green-100 text-sm mt-2">
            Min: PKR {configs.fees?.find(c => c.key === 'min_platform_fee')?.value || '500'} | 
            Max: PKR {configs.fees?.find(c => c.key === 'max_platform_fee')?.value || '50,000'}
          </div>
        </div>

        {/* GST Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Percent className="h-8 w-8" />
            <div>
              <h3 className="font-bold text-lg">GST</h3>
              <p className="text-blue-100 text-sm">Tax configuration</p>
            </div>
          </div>
          <div className="text-3xl font-bold">
            {configs.taxes?.find(c => c.key === 'gst_percent')?.value || '16'}%
          </div>
          <div className="text-blue-100 text-sm mt-2">
            Status: {configs.taxes?.find(c => c.key === 'gst_enabled')?.value === 'true' ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {/* Load Limits Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8" />
            <div>
              <h3 className="font-bold text-lg">Load Limits</h3>
              <p className="text-purple-100 text-sm">User restrictions</p>
            </div>
          </div>
          <div className="text-xl font-bold">
            Individual: {configs.limits?.find(c => c.key === 'individual_max_active_loads')?.value || '5'}
          </div>
          <div className="text-xl font-bold">
            Company: {configs.limits?.find(c => c.key === 'company_max_active_loads')?.value || '100'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
