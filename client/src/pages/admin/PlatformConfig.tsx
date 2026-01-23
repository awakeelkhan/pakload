import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Database, Plus, Edit2, Save, X, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { LoadingSkeleton } from '../../components/Loading';

interface Config {
  id: number;
  key: string;
  value: string;
  description?: string;
  category: string;
  dataType: string;
  isPublic: boolean;
  status: string;
}

export default function PlatformConfig() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general',
    dataType: 'string',
    isPublic: false,
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/config', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string) => {
    try {
      await fetch(`/api/admin/config/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: editValue })
      });
      setEditingKey(null);
      fetchConfigs();
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const handlePublish = async (key: string) => {
    try {
      await fetch(`/api/admin/config/${key}/publish`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      fetchConfigs();
    } catch (error) {
      console.error('Error publishing config:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfig)
      });
      setShowAddModal(false);
      setNewConfig({ key: '', value: '', description: '', category: 'general', dataType: 'string', isPublic: false });
      fetchConfigs();
    } catch (error) {
      console.error('Error creating config:', error);
    }
  };

  const categories = ['all', ...Array.from(new Set(configs.map(c => c.category)))];
  const filteredConfigs = selectedCategory === 'all' 
    ? configs 
    : configs.filter(c => c.category === selectedCategory);

  // Common settings for quick access
  const commonSettings = [
    { key: 'currency', label: 'Currency', description: 'Default currency for the platform', defaultValue: 'PKR' },
    { key: 'currency_symbol', label: 'Currency Symbol', description: 'Currency symbol to display', defaultValue: 'Rs' },
    { key: 'platform_fee_percentage', label: 'Platform Fee %', description: 'Commission percentage', defaultValue: '5.0' },
    { key: 'min_load_price', label: 'Min Load Price', description: 'Minimum price for a load', defaultValue: '1000' },
    { key: 'max_load_weight', label: 'Max Load Weight (kg)', description: 'Maximum allowed weight', defaultValue: '50000' },
    { key: 'support_email', label: 'Support Email', description: 'Customer support email', defaultValue: 'support@pakload.com' },
    { key: 'support_phone', label: 'Support Phone', description: 'Customer support phone', defaultValue: '+92-300-1234567' },
    { key: 'maintenance_mode', label: 'Maintenance Mode', description: 'Enable maintenance mode', defaultValue: 'false' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link href="/admin/settings">
                  <a className="hover:text-gray-700">Admin Settings</a>
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>Platform Configuration</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Database className="w-8 h-8 text-orange-600" />
                Platform Configuration
              </h1>
              <p className="mt-2 text-gray-600">
                Manage currency, general settings, and system configuration
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Config
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
        {/* Quick Settings */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonSettings.map((setting) => {
              const existingConfig = configs.find(c => c.key === setting.key);
              const isEditing = editingKey === setting.key;
              
              return (
                <div key={setting.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-xs text-gray-500">{setting.description}</div>
                    </div>
                    {existingConfig && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        existingConfig.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {existingConfig.status}
                      </span>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => handleUpdate(setting.key)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {existingConfig?.value || setting.defaultValue}
                      </code>
                      <div className="flex gap-2">
                        {existingConfig && existingConfig.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(setting.key)}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingKey(setting.key);
                            setEditValue(existingConfig?.value || setting.defaultValue);
                          }}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* All Configs Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConfigs.map((config) => (
                <tr key={config.key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm font-mono text-gray-900">{config.key}</code>
                  </td>
                  <td className="px-6 py-4">
                    {editingKey === config.key ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{config.value}</code>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.dataType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {config.isPublic ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      config.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {config.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {editingKey === config.key ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdate(config.key)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {config.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(config.key)}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingKey(config.key);
                            setEditValue(config.value);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>

      {/* Add Config Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Configuration</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                  <input
                    type="text"
                    value={newConfig.key}
                    onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., max_upload_size"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="text"
                    value={newConfig.value}
                    onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newConfig.category}
                    onChange={(e) => setNewConfig({ ...newConfig, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="general">General</option>
                    <option value="payment">Payment</option>
                    <option value="notification">Notification</option>
                    <option value="security">Security</option>
                    <option value="feature">Feature</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                  <select
                    value={newConfig.dataType}
                    onChange={(e) => setNewConfig({ ...newConfig, dataType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newConfig.isPublic}
                    onChange={(e) => setNewConfig({ ...newConfig, isPublic: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Public (visible to frontend)</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
