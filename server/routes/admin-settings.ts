import { Router } from 'express';
import { PlatformConfigRepository } from '../repositories/platformConfigRepository.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const configRepo = new PlatformConfigRepository();

// Default configuration values
const DEFAULT_CONFIGS = [
  // Platform Fees
  { key: 'platform_fee_percent', value: '5', category: 'fees', dataType: 'number', description: 'Platform fee percentage on freight charges', isPublic: false },
  { key: 'min_platform_fee', value: '500', category: 'fees', dataType: 'number', description: 'Minimum platform fee (PKR)', isPublic: false },
  { key: 'max_platform_fee', value: '50000', category: 'fees', dataType: 'number', description: 'Maximum platform fee cap (PKR)', isPublic: false },
  
  // GST Settings
  { key: 'gst_enabled', value: 'true', category: 'taxes', dataType: 'boolean', description: 'Enable GST on transactions', isPublic: true },
  { key: 'gst_percent', value: '16', category: 'taxes', dataType: 'number', description: 'GST percentage', isPublic: true },
  { key: 'gst_registration_number', value: '', category: 'taxes', dataType: 'string', description: 'Platform GST registration number', isPublic: true },
  
  // Withholding Tax
  { key: 'withholding_tax_enabled', value: 'false', category: 'taxes', dataType: 'boolean', description: 'Enable withholding tax', isPublic: false },
  { key: 'withholding_tax_percent', value: '4.5', category: 'taxes', dataType: 'number', description: 'Withholding tax percentage', isPublic: false },
  
  // Load Limits
  { key: 'individual_max_active_loads', value: '5', category: 'limits', dataType: 'number', description: 'Max active loads for individual shippers', isPublic: true },
  { key: 'company_max_active_loads', value: '100', category: 'limits', dataType: 'number', description: 'Max active loads for company shippers', isPublic: true },
  { key: 'max_load_value', value: '10000000', category: 'limits', dataType: 'number', description: 'Maximum load value (PKR)', isPublic: true },
  { key: 'min_load_value', value: '1000', category: 'limits', dataType: 'number', description: 'Minimum load value (PKR)', isPublic: true },
  
  // Bid Settings
  { key: 'bid_validity_hours', value: '48', category: 'bidding', dataType: 'number', description: 'Default bid validity in hours', isPublic: true },
  { key: 'max_bids_per_load', value: '50', category: 'bidding', dataType: 'number', description: 'Maximum bids allowed per load', isPublic: true },
  { key: 'auto_expire_bids', value: 'true', category: 'bidding', dataType: 'boolean', description: 'Automatically expire old bids', isPublic: false },
  
  // Payment Settings
  { key: 'advance_payment_percent', value: '30', category: 'payments', dataType: 'number', description: 'Default advance payment percentage', isPublic: true },
  { key: 'payment_hold_days', value: '3', category: 'payments', dataType: 'number', description: 'Days to hold payment after delivery', isPublic: true },
  { key: 'escrow_enabled', value: 'true', category: 'payments', dataType: 'boolean', description: 'Enable escrow payments', isPublic: true },
  
  // Document Verification
  { key: 'auto_approve_documents', value: 'false', category: 'verification', dataType: 'boolean', description: 'Auto-approve uploaded documents', isPublic: false },
  { key: 'document_expiry_warning_days', value: '30', category: 'verification', dataType: 'number', description: 'Days before expiry to warn users', isPublic: true },
  { key: 'require_all_documents', value: 'true', category: 'verification', dataType: 'boolean', description: 'Require all mandatory documents for activation', isPublic: true },
  
  // Notifications
  { key: 'email_notifications_enabled', value: 'true', category: 'notifications', dataType: 'boolean', description: 'Enable email notifications', isPublic: true },
  { key: 'sms_notifications_enabled', value: 'true', category: 'notifications', dataType: 'boolean', description: 'Enable SMS notifications', isPublic: true },
  { key: 'push_notifications_enabled', value: 'true', category: 'notifications', dataType: 'boolean', description: 'Enable push notifications', isPublic: true },
  
  // Rating Settings
  { key: 'min_rating_for_premium', value: '4.5', category: 'ratings', dataType: 'number', description: 'Minimum rating for premium badge', isPublic: true },
  { key: 'rating_weight_recent', value: '0.7', category: 'ratings', dataType: 'number', description: 'Weight for recent ratings (0-1)', isPublic: false },
  
  // Builty Settings
  { key: 'builty_terms_version', value: '1.0', category: 'builty', dataType: 'string', description: 'Current builty terms version', isPublic: true },
  { key: 'builty_claim_period_hours', value: '24', category: 'builty', dataType: 'number', description: 'Hours to file damage claim after delivery', isPublic: true },
  { key: 'builty_auto_generate', value: 'true', category: 'builty', dataType: 'boolean', description: 'Auto-generate builty on booking confirmation', isPublic: false },
  
  // Market Request Settings
  { key: 'market_request_expiry_days', value: '7', category: 'market_requests', dataType: 'number', description: 'Days before market request expires', isPublic: true },
  { key: 'market_request_auto_assign', value: 'false', category: 'market_requests', dataType: 'boolean', description: 'Auto-assign requests to team members', isPublic: false },
  
  // Currency Settings
  { key: 'default_currency', value: 'PKR', category: 'currency', dataType: 'string', description: 'Default currency', isPublic: true },
  { key: 'supported_currencies', value: '["PKR", "USD", "CNY", "EUR"]', category: 'currency', dataType: 'json', description: 'Supported currencies', isPublic: true },
  { key: 'usd_to_pkr_rate', value: '278.50', category: 'currency', dataType: 'number', description: 'USD to PKR exchange rate', isPublic: true },
  
  // TIR Settings
  { key: 'tir_enabled', value: 'true', category: 'tir', dataType: 'boolean', description: 'Enable TIR international routes', isPublic: true },
  { key: 'tir_premium_percent', value: '10', category: 'tir', dataType: 'number', description: 'Premium percentage for TIR loads', isPublic: false },
  
  // Maintenance
  { key: 'maintenance_mode', value: 'false', category: 'system', dataType: 'boolean', description: 'Platform maintenance mode', isPublic: true },
  { key: 'maintenance_message', value: 'Platform is under maintenance. Please try again later.', category: 'system', dataType: 'string', description: 'Maintenance mode message', isPublic: true },
];

// Initialize default configurations
router.post('/initialize', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    let created = 0;
    let skipped = 0;

    for (const config of DEFAULT_CONFIGS) {
      const existing = await configRepo.findByKey(config.key);
      if (!existing) {
        await configRepo.create({
          ...config,
          status: 'published',
          publishedAt: new Date(),
          updatedBy: req.user!.id,
        });
        created++;
      } else {
        skipped++;
      }
    }

    res.json({
      message: 'Configuration initialized',
      created,
      skipped,
      total: DEFAULT_CONFIGS.length,
    });
  } catch (error) {
    console.error('Initialize config error:', error);
    res.status(500).json({ error: 'Failed to initialize configuration' });
  }
});

// Get all configurations (admin)
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { category, status } = req.query;
    
    const configs = await configRepo.findAll({
      category: category as string,
      status: status as string,
    });

    res.json({ configs });
  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ error: 'Failed to get configurations' });
  }
});

// Get configurations by category (admin)
router.get('/by-category', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const grouped = await configRepo.getByCategory();
    res.json({ configs: grouped });
  } catch (error) {
    console.error('Get configs by category error:', error);
    res.status(500).json({ error: 'Failed to get configurations' });
  }
});

// Get public configurations (no auth required)
router.get('/public', async (req, res) => {
  try {
    const configs = await configRepo.findPublic();
    
    // Convert to key-value object
    const result: Record<string, any> = {};
    for (const config of configs) {
      switch (config.dataType) {
        case 'number':
          result[config.key] = parseFloat(config.value);
          break;
        case 'boolean':
          result[config.key] = config.value === 'true';
          break;
        case 'json':
          try {
            result[config.key] = JSON.parse(config.value);
          } catch {
            result[config.key] = config.value;
          }
          break;
        default:
          result[config.key] = config.value;
      }
    }

    res.json({ configs: result });
  } catch (error) {
    console.error('Get public configs error:', error);
    res.status(500).json({ error: 'Failed to get configurations' });
  }
});

// Get single configuration value
router.get('/value/:key', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const value = await configRepo.getValue(req.params.key);
    
    if (value === null) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ key: req.params.key, value });
  } catch (error) {
    console.error('Get config value error:', error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

// Get single configuration (full details)
router.get('/:key', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const config = await configRepo.findByKey(req.params.key);
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ config });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

// Create new configuration
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { key, value, category, dataType, description, isPublic } = req.body;

    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    // Check if key already exists
    const existing = await configRepo.findByKey(key);
    if (existing) {
      return res.status(400).json({ error: 'Configuration key already exists' });
    }

    const config = await configRepo.create({
      key,
      value,
      category: category || 'general',
      dataType: dataType || 'string',
      description,
      isPublic: isPublic || false,
      status: 'draft',
      updatedBy: req.user!.id,
    });

    res.status(201).json({ message: 'Configuration created', config });
  } catch (error) {
    console.error('Create config error:', error);
    res.status(500).json({ error: 'Failed to create configuration' });
  }
});

// Update configuration
router.put('/:key', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { value, description, isPublic, category, dataType } = req.body;

    const existing = await configRepo.findByKey(req.params.key);
    if (!existing) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const updated = await configRepo.update(req.params.key, {
      value,
      description,
      isPublic,
      category,
      dataType,
      updatedBy: req.user!.id,
    });

    res.json({ message: 'Configuration updated', config: updated });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Bulk update configurations
router.put('/bulk/update', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const formattedUpdates = updates.map(u => ({
      key: u.key,
      value: String(u.value),
      updatedBy: req.user!.id,
    }));

    await configRepo.bulkUpdate(formattedUpdates);

    res.json({ message: 'Configurations updated', count: updates.length });
  } catch (error) {
    console.error('Bulk update config error:', error);
    res.status(500).json({ error: 'Failed to update configurations' });
  }
});

// Publish configuration
router.post('/:key/publish', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const config = await configRepo.publish(req.params.key, req.user!.id);
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ message: 'Configuration published', config });
  } catch (error) {
    console.error('Publish config error:', error);
    res.status(500).json({ error: 'Failed to publish configuration' });
  }
});

// Unpublish configuration
router.post('/:key/unpublish', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const config = await configRepo.unpublish(req.params.key, req.user!.id);
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ message: 'Configuration unpublished', config });
  } catch (error) {
    console.error('Unpublish config error:', error);
    res.status(500).json({ error: 'Failed to unpublish configuration' });
  }
});

// Delete configuration
router.delete('/:key', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const existing = await configRepo.findByKey(req.params.key);
    if (!existing) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    await configRepo.delete(req.params.key);
    res.json({ message: 'Configuration deleted' });
  } catch (error) {
    console.error('Delete config error:', error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
});

// Get configuration statistics
router.get('/admin/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const stats = await configRepo.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// ============ SPECIFIC SETTING ENDPOINTS ============

// Get fee settings
router.get('/category/fees', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const configs = await configRepo.findAll({ category: 'fees' });
    
    const fees: Record<string, any> = {};
    for (const config of configs) {
      fees[config.key] = config.dataType === 'number' ? parseFloat(config.value) : config.value;
    }

    res.json({ fees });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ error: 'Failed to get fee settings' });
  }
});

// Update fee settings
router.put('/category/fees', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { platform_fee_percent, min_platform_fee, max_platform_fee } = req.body;

    const updates = [];
    if (platform_fee_percent !== undefined) {
      updates.push({ key: 'platform_fee_percent', value: String(platform_fee_percent), updatedBy: req.user!.id });
    }
    if (min_platform_fee !== undefined) {
      updates.push({ key: 'min_platform_fee', value: String(min_platform_fee), updatedBy: req.user!.id });
    }
    if (max_platform_fee !== undefined) {
      updates.push({ key: 'max_platform_fee', value: String(max_platform_fee), updatedBy: req.user!.id });
    }

    if (updates.length > 0) {
      await configRepo.bulkUpdate(updates);
    }

    res.json({ message: 'Fee settings updated' });
  } catch (error) {
    console.error('Update fees error:', error);
    res.status(500).json({ error: 'Failed to update fee settings' });
  }
});

// Get tax settings
router.get('/category/taxes', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const configs = await configRepo.findAll({ category: 'taxes' });
    
    const taxes: Record<string, any> = {};
    for (const config of configs) {
      switch (config.dataType) {
        case 'number':
          taxes[config.key] = parseFloat(config.value);
          break;
        case 'boolean':
          taxes[config.key] = config.value === 'true';
          break;
        default:
          taxes[config.key] = config.value;
      }
    }

    res.json({ taxes });
  } catch (error) {
    console.error('Get taxes error:', error);
    res.status(500).json({ error: 'Failed to get tax settings' });
  }
});

// Update tax settings
router.put('/category/taxes', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { gst_enabled, gst_percent, gst_registration_number, withholding_tax_enabled, withholding_tax_percent } = req.body;

    const updates = [];
    if (gst_enabled !== undefined) {
      updates.push({ key: 'gst_enabled', value: String(gst_enabled), updatedBy: req.user!.id });
    }
    if (gst_percent !== undefined) {
      updates.push({ key: 'gst_percent', value: String(gst_percent), updatedBy: req.user!.id });
    }
    if (gst_registration_number !== undefined) {
      updates.push({ key: 'gst_registration_number', value: gst_registration_number, updatedBy: req.user!.id });
    }
    if (withholding_tax_enabled !== undefined) {
      updates.push({ key: 'withholding_tax_enabled', value: String(withholding_tax_enabled), updatedBy: req.user!.id });
    }
    if (withholding_tax_percent !== undefined) {
      updates.push({ key: 'withholding_tax_percent', value: String(withholding_tax_percent), updatedBy: req.user!.id });
    }

    if (updates.length > 0) {
      await configRepo.bulkUpdate(updates);
    }

    res.json({ message: 'Tax settings updated' });
  } catch (error) {
    console.error('Update taxes error:', error);
    res.status(500).json({ error: 'Failed to update tax settings' });
  }
});

export default router;
