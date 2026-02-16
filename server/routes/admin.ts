import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { CargoCategoryRepository } from '../repositories/cargoCategoryRepository.js';
import { PricingRuleRepository } from '../repositories/pricingRuleRepository.js';
import { RoutePricingRepository } from '../repositories/routePricingRepository.js';
import { PlatformConfigRepository } from '../repositories/platformConfigRepository.js';
import { AuditLogRepository } from '../repositories/auditLogRepository.js';
import { RouteRepository } from '../repositories/routeRepository.js';

const router = Router();

// Initialize repositories
const categoryRepo = new CargoCategoryRepository();
const pricingRuleRepo = new PricingRuleRepository();
const routePricingRepo = new RoutePricingRepository();
const configRepo = new PlatformConfigRepository();
const auditLogRepo = new AuditLogRepository();
const routeRepo = new RouteRepository();

// Apply auth middleware to all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// ==================== CARGO CATEGORIES ====================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const { status } = req.query;
    const categories = await categoryRepo.findAll(status ? { status: status as string } : undefined);
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'cargo_categories',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await categoryRepo.findById(parseInt(req.params.id));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const category = await categoryRepo.create({
      ...req.body,
      createdBy: req.user!.id,
      status: 'draft',
    });
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'create',
      entity: 'cargo_categories',
      entityId: category.id,
      newValues: category,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const oldCategory = await categoryRepo.findById(parseInt(req.params.id));
    const category = await categoryRepo.update(parseInt(req.params.id), {
      ...req.body,
      updatedBy: req.user!.id,
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'cargo_categories',
      entityId: category.id,
      oldValues: oldCategory,
      newValues: category,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Publish category
router.post('/categories/:id/publish', async (req, res) => {
  try {
    const category = await categoryRepo.publish(parseInt(req.params.id), req.user!.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'publish',
      entity: 'cargo_categories',
      entityId: category.id,
      newValues: { status: 'published' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'warning',
    });
    
    res.json(category);
  } catch (error) {
    console.error('Error publishing category:', error);
    res.status(500).json({ error: 'Failed to publish category' });
  }
});

// Unpublish category
router.post('/categories/:id/unpublish', async (req, res) => {
  try {
    const category = await categoryRepo.unpublish(parseInt(req.params.id), req.user!.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'unpublish',
      entity: 'cargo_categories',
      entityId: category.id,
      newValues: { status: 'draft' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'warning',
    });
    
    res.json(category);
  } catch (error) {
    console.error('Error unpublishing category:', error);
    res.status(500).json({ error: 'Failed to unpublish category' });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await categoryRepo.findById(parseInt(req.params.id));
    await categoryRepo.delete(parseInt(req.params.id));
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'delete',
      entity: 'cargo_categories',
      entityId: parseInt(req.params.id),
      oldValues: category,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'critical',
    });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Reorder categories
router.post('/categories/reorder', async (req, res) => {
  try {
    await categoryRepo.reorder(req.body.updates);
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'cargo_categories',
      newValues: { reordered: req.body.updates },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
});

// Get category statistics
router.get('/categories/stats', async (req, res) => {
  try {
    const stats = await categoryRepo.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category stats' });
  }
});

// ==================== PRICING RULES ====================

// Get all pricing rules
router.get('/pricing-rules', async (req, res) => {
  try {
    const { status, ruleType, categoryId, routeId } = req.query;
    const rules = await pricingRuleRepo.findAll({
      status: status as string,
      ruleType: ruleType as string,
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      routeId: routeId ? parseInt(routeId as string) : undefined,
    });
    res.json(rules);
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
});

// Get pricing rule by ID
router.get('/pricing-rules/:id', async (req, res) => {
  try {
    const rule = await pricingRuleRepo.findById(parseInt(req.params.id));
    if (!rule) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }
    res.json(rule);
  } catch (error) {
    console.error('Error fetching pricing rule:', error);
    res.status(500).json({ error: 'Failed to fetch pricing rule' });
  }
});

// Get active pricing rules
router.get('/pricing-rules/active/list', async (req, res) => {
  try {
    const rules = await pricingRuleRepo.findActive();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching active rules:', error);
    res.status(500).json({ error: 'Failed to fetch active rules' });
  }
});

// Find applicable pricing rules
router.post('/pricing-rules/applicable', async (req, res) => {
  try {
    const rules = await pricingRuleRepo.findApplicable(req.body);
    res.json(rules);
  } catch (error) {
    console.error('Error finding applicable rules:', error);
    res.status(500).json({ error: 'Failed to find applicable rules' });
  }
});

// Create pricing rule
router.post('/pricing-rules', async (req, res) => {
  try {
    const rule = await pricingRuleRepo.create({
      ...req.body,
      createdBy: req.user!.id,
      status: 'draft',
    });
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'create',
      entity: 'pricing_rules',
      entityId: rule.id,
      newValues: rule,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating pricing rule:', error);
    res.status(500).json({ error: 'Failed to create pricing rule' });
  }
});

// Update pricing rule
router.put('/pricing-rules/:id', async (req, res) => {
  try {
    const oldRule = await pricingRuleRepo.findById(parseInt(req.params.id));
    const rule = await pricingRuleRepo.update(parseInt(req.params.id), {
      ...req.body,
      updatedBy: req.user!.id,
    });
    
    if (!rule) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'pricing_rules',
      entityId: rule.id,
      oldValues: oldRule,
      newValues: rule,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(rule);
  } catch (error) {
    console.error('Error updating pricing rule:', error);
    res.status(500).json({ error: 'Failed to update pricing rule' });
  }
});

// Publish pricing rule
router.post('/pricing-rules/:id/publish', async (req, res) => {
  try {
    const rule = await pricingRuleRepo.publish(parseInt(req.params.id), req.user!.id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'publish',
      entity: 'pricing_rules',
      entityId: rule.id,
      newValues: { status: 'published' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'warning',
    });
    
    res.json(rule);
  } catch (error) {
    console.error('Error publishing pricing rule:', error);
    res.status(500).json({ error: 'Failed to publish pricing rule' });
  }
});

// Unpublish pricing rule
router.post('/pricing-rules/:id/unpublish', async (req, res) => {
  try {
    const rule = await pricingRuleRepo.unpublish(parseInt(req.params.id), req.user!.id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'unpublish',
      entity: 'pricing_rules',
      entityId: rule.id,
      newValues: { status: 'draft' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'warning',
    });
    
    res.json(rule);
  } catch (error) {
    console.error('Error unpublishing pricing rule:', error);
    res.status(500).json({ error: 'Failed to unpublish pricing rule' });
  }
});

// Delete pricing rule
router.delete('/pricing-rules/:id', async (req, res) => {
  try {
    const rule = await pricingRuleRepo.findById(parseInt(req.params.id));
    await pricingRuleRepo.delete(parseInt(req.params.id));
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'delete',
      entity: 'pricing_rules',
      entityId: parseInt(req.params.id),
      oldValues: rule,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'critical',
    });
    
    res.json({ message: 'Pricing rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting pricing rule:', error);
    res.status(500).json({ error: 'Failed to delete pricing rule' });
  }
});

// Get pricing rule statistics
router.get('/pricing-rules/stats/summary', async (req, res) => {
  try {
    const stats = await pricingRuleRepo.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching pricing rule stats:', error);
    res.status(500).json({ error: 'Failed to fetch pricing rule stats' });
  }
});

// ==================== ROUTE PRICING ====================

// Get all route pricing
router.get('/route-pricing', async (req, res) => {
  try {
    const { status, routeId, categoryId } = req.query;
    const pricing = await routePricingRepo.findAll({
      status: status as string,
      routeId: routeId ? parseInt(routeId as string) : undefined,
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
    });
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching route pricing:', error);
    res.status(500).json({ error: 'Failed to fetch route pricing' });
  }
});

// Get route pricing by ID
router.get('/route-pricing/:id', async (req, res) => {
  try {
    const pricing = await routePricingRepo.findById(parseInt(req.params.id));
    if (!pricing) {
      return res.status(404).json({ error: 'Route pricing not found' });
    }
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching route pricing:', error);
    res.status(500).json({ error: 'Failed to fetch route pricing' });
  }
});

// Get active route pricing
router.get('/route-pricing/active/:routeId', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const pricing = await routePricingRepo.findActive(
      parseInt(req.params.routeId),
      categoryId ? parseInt(categoryId as string) : undefined
    );
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching active route pricing:', error);
    res.status(500).json({ error: 'Failed to fetch active route pricing' });
  }
});

// Create route pricing
router.post('/route-pricing', async (req, res) => {
  try {
    const pricing = await routePricingRepo.create({
      ...req.body,
      createdBy: req.user!.id,
      status: 'draft',
    });
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'create',
      entity: 'route_pricing',
      entityId: pricing.id,
      newValues: pricing,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(pricing);
  } catch (error) {
    console.error('Error creating route pricing:', error);
    res.status(500).json({ error: 'Failed to create route pricing' });
  }
});

// Bulk create route pricing
router.post('/route-pricing/bulk', async (req, res) => {
  try {
    const pricingData = req.body.pricing.map((p: any) => ({
      ...p,
      createdBy: req.user!.id,
      status: 'draft',
    }));
    
    const pricing = await routePricingRepo.bulkCreate(pricingData);
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'create',
      entity: 'route_pricing',
      newValues: { count: pricing.length },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(pricing);
  } catch (error) {
    console.error('Error bulk creating route pricing:', error);
    res.status(500).json({ error: 'Failed to bulk create route pricing' });
  }
});

// Update route pricing
router.put('/route-pricing/:id', async (req, res) => {
  try {
    const oldPricing = await routePricingRepo.findById(parseInt(req.params.id));
    const pricing = await routePricingRepo.update(parseInt(req.params.id), {
      ...req.body,
      updatedBy: req.user!.id,
    });
    
    if (!pricing) {
      return res.status(404).json({ error: 'Route pricing not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'route_pricing',
      entityId: pricing.id,
      oldValues: oldPricing,
      newValues: pricing,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(pricing);
  } catch (error) {
    console.error('Error updating route pricing:', error);
    res.status(500).json({ error: 'Failed to update route pricing' });
  }
});

// Publish route pricing
router.post('/route-pricing/:id/publish', async (req, res) => {
  try {
    const pricing = await routePricingRepo.publish(parseInt(req.params.id), req.user!.id);
    
    if (!pricing) {
      return res.status(404).json({ error: 'Route pricing not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'publish',
      entity: 'route_pricing',
      entityId: pricing.id,
      newValues: { status: 'published' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'warning',
    });
    
    res.json(pricing);
  } catch (error) {
    console.error('Error publishing route pricing:', error);
    res.status(500).json({ error: 'Failed to publish route pricing' });
  }
});

// Unpublish route pricing
router.post('/route-pricing/:id/unpublish', async (req, res) => {
  try {
    const pricing = await routePricingRepo.unpublish(parseInt(req.params.id), req.user!.id);
    
    if (!pricing) {
      return res.status(404).json({ error: 'Route pricing not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'unpublish',
      entity: 'route_pricing',
      entityId: pricing.id,
      newValues: { status: 'draft' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'warning',
    });
    
    res.json(pricing);
  } catch (error) {
    console.error('Error unpublishing route pricing:', error);
    res.status(500).json({ error: 'Failed to unpublish route pricing' });
  }
});

// Delete route pricing
router.delete('/route-pricing/:id', async (req, res) => {
  try {
    const pricing = await routePricingRepo.findById(parseInt(req.params.id));
    await routePricingRepo.delete(parseInt(req.params.id));
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'delete',
      entity: 'route_pricing',
      entityId: parseInt(req.params.id),
      oldValues: pricing,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'critical',
    });
    
    res.json({ message: 'Route pricing deleted successfully' });
  } catch (error) {
    console.error('Error deleting route pricing:', error);
    res.status(500).json({ error: 'Failed to delete route pricing' });
  }
});

// Get route pricing statistics
router.get('/route-pricing/stats/summary', async (req, res) => {
  try {
    const stats = await routePricingRepo.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching route pricing stats:', error);
    res.status(500).json({ error: 'Failed to fetch route pricing stats' });
  }
});

// ==================== PLATFORM CONFIG ====================

// Get all platform configs
router.get('/config', async (req, res) => {
  try {
    const { category, status, isPublic } = req.query;
    const configs = await configRepo.findAll({
      category: category as string,
      status: status as string,
      isPublic: isPublic === 'true',
    });
    res.json(configs);
  } catch (error) {
    console.error('Error fetching configs:', error);
    res.status(500).json({ error: 'Failed to fetch configs' });
  }
});

// Get config by key
router.get('/config/:key', async (req, res) => {
  try {
    const config = await configRepo.findByKey(req.params.key);
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// Get config value (parsed)
router.get('/config/:key/value', async (req, res) => {
  try {
    const value = await configRepo.getValue(req.params.key);
    if (value === null) {
      return res.status(404).json({ error: 'Config not found or not published' });
    }
    res.json({ value });
  } catch (error) {
    console.error('Error fetching config value:', error);
    res.status(500).json({ error: 'Failed to fetch config value' });
  }
});

// Get configs by category
router.get('/config/by-category/all', async (req, res) => {
  try {
    const configs = await configRepo.getByCategory();
    res.json(configs);
  } catch (error) {
    console.error('Error fetching configs by category:', error);
    res.status(500).json({ error: 'Failed to fetch configs by category' });
  }
});

// Create config
router.post('/config', async (req, res) => {
  try {
    const config = await configRepo.create({
      ...req.body,
      status: 'draft',
    });
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'create',
      entity: 'platform_config',
      entityId: config.id,
      newValues: config,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating config:', error);
    res.status(500).json({ error: 'Failed to create config' });
  }
});

// Update config
router.put('/config/:key', async (req, res) => {
  try {
    const oldConfig = await configRepo.findByKey(req.params.key);
    const config = await configRepo.update(req.params.key, {
      ...req.body,
      updatedBy: req.user!.id,
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'platform_config',
      entityId: config.id,
      oldValues: oldConfig,
      newValues: config,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// Bulk update configs
router.post('/config/bulk-update', async (req, res) => {
  try {
    const updates = req.body.updates.map((u: any) => ({
      ...u,
      updatedBy: req.user!.id,
    }));
    
    await configRepo.bulkUpdate(updates);
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'platform_config',
      newValues: { count: updates.length },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json({ message: 'Configs updated successfully' });
  } catch (error) {
    console.error('Error bulk updating configs:', error);
    res.status(500).json({ error: 'Failed to bulk update configs' });
  }
});

// Publish config
router.post('/config/:key/publish', async (req, res) => {
  try {
    const config = await configRepo.publish(req.params.key, req.user!.id);
    
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'publish',
      entity: 'platform_config',
      entityId: config.id,
      newValues: { status: 'published' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'warning',
    });
    
    res.json(config);
  } catch (error) {
    console.error('Error publishing config:', error);
    res.status(500).json({ error: 'Failed to publish config' });
  }
});

// Unpublish config
router.post('/config/:key/unpublish', async (req, res) => {
  try {
    const config = await configRepo.unpublish(req.params.key, req.user!.id);
    
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'unpublish',
      entity: 'platform_config',
      entityId: config.id,
      newValues: { status: 'draft' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'warning',
    });
    
    res.json(config);
  } catch (error) {
    console.error('Error unpublishing config:', error);
    res.status(500).json({ error: 'Failed to unpublish config' });
  }
});

// Delete config
router.delete('/config/:key', async (req, res) => {
  try {
    const config = await configRepo.findByKey(req.params.key);
    await configRepo.delete(req.params.key);
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'delete',
      entity: 'platform_config',
      entityId: config?.id,
      oldValues: config,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'critical',
    });
    
    res.json({ message: 'Config deleted successfully' });
  } catch (error) {
    console.error('Error deleting config:', error);
    res.status(500).json({ error: 'Failed to delete config' });
  }
});

// Get config statistics
router.get('/config/stats/summary', async (req, res) => {
  try {
    const stats = await configRepo.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching config stats:', error);
    res.status(500).json({ error: 'Failed to fetch config stats' });
  }
});

// ==================== AUDIT LOGS ====================

// Get all audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { userId, action, entity, severity, startDate, endDate, limit } = req.query;
    
    const logs = await auditLogRepo.findAll({
      userId: userId ? parseInt(userId as string) : undefined,
      action: action as string,
      entity: entity as string,
      severity: severity as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : 100,
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs for specific entity
router.get('/audit-logs/:entity/:entityId', async (req, res) => {
  try {
    const logs = await auditLogRepo.findByEntity(
      req.params.entity,
      parseInt(req.params.entityId)
    );
    res.json(logs);
  } catch (error) {
    console.error('Error fetching entity audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch entity audit logs' });
  }
});

// Get recent audit logs
router.get('/audit-logs/recent/list', async (req, res) => {
  try {
    const { limit } = req.query;
    const logs = await auditLogRepo.findRecent(limit ? parseInt(limit as string) : 50);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching recent audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch recent audit logs' });
  }
});

// Get audit log statistics
router.get('/audit-logs/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await auditLogRepo.getStats({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({ error: 'Failed to fetch audit log stats' });
  }
});

// ==================== ROUTES MANAGEMENT ====================

// Get all routes
router.get('/routes', async (req, res) => {
  try {
    const routes = await routeRepo.findAll();
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Get route by ID
router.get('/routes/:id', async (req, res) => {
  try {
    const route = await routeRepo.findById(parseInt(req.params.id));
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// Search routes
router.get('/routes/search/:query', async (req, res) => {
  try {
    const routes = await routeRepo.search(req.params.query);
    res.json(routes);
  } catch (error) {
    console.error('Error searching routes:', error);
    res.status(500).json({ error: 'Failed to search routes' });
  }
});

// Get popular routes
router.get('/routes/popular/list', async (req, res) => {
  try {
    const { limit } = req.query;
    const routes = await routeRepo.findPopular(limit ? parseInt(limit as string) : 10);
    res.json(routes);
  } catch (error) {
    console.error('Error fetching popular routes:', error);
    res.status(500).json({ error: 'Failed to fetch popular routes' });
  }
});

// Create route
router.post('/routes', async (req, res) => {
  try {
    const route = await routeRepo.create(req.body);
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'create',
      entity: 'routes',
      entityId: route.id,
      newValues: route,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(route);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

// Update route
router.put('/routes/:id', async (req, res) => {
  try {
    const oldRoute = await routeRepo.findById(parseInt(req.params.id));
    const route = await routeRepo.update(parseInt(req.params.id), req.body);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'routes',
      entityId: route.id,
      oldValues: oldRoute,
      newValues: route,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(route);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ error: 'Failed to update route' });
  }
});

// Update route statistics
router.put('/routes/:id/stats', async (req, res) => {
  try {
    const route = await routeRepo.updateStats(parseInt(req.params.id), req.body);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    console.error('Error updating route stats:', error);
    res.status(500).json({ error: 'Failed to update route stats' });
  }
});

// Delete route
router.delete('/routes/:id', async (req, res) => {
  try {
    const route = await routeRepo.findById(parseInt(req.params.id));
    await routeRepo.delete(parseInt(req.params.id));
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'delete',
      entity: 'routes',
      entityId: parseInt(req.params.id),
      oldValues: route,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'critical',
    });
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

// Get route statistics
router.get('/routes/stats/summary', async (req, res) => {
  try {
    const stats = await routeRepo.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching route stats:', error);
    res.status(500).json({ error: 'Failed to fetch route stats' });
  }
});

// ==================== USER MANAGEMENT ====================

import { UserRepository } from '../repositories/userRepository.js';
const userRepo = new UserRepository();

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { role, status, search, page = '1', limit = '20' } = req.query;
    
    const filters: any = {};
    if (role) filters.role = role as string;
    if (status) filters.status = status as string;
    if (search) filters.search = search as string;
    
    const users = await userRepo.findAll(filters);
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    // Remove passwords from response
    const safeUsers = paginatedUsers.map(({ password, ...user }) => user);
    
    res.json({
      users: safeUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: users.length,
        totalPages: Math.ceil(users.length / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await userRepo.findById(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user status (activate, suspend, etc.)
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const userId = parseInt(req.params.id);
    
    if (!['active', 'pending', 'suspended', 'deleted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const oldUser = await userRepo.findById(userId);
    if (!oldUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = await userRepo.update(userId, { status });
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'users',
      entityId: userId,
      oldValues: { status: oldUser.status },
      newValues: { status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: status === 'suspended' ? 'warning' : 'info',
    });
    
    const { password, ...safeUser } = updatedUser!;
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Verify user
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const oldUser = await userRepo.findById(userId);
    if (!oldUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = await userRepo.update(userId, { verified: true });
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'users',
      entityId: userId,
      oldValues: { verified: oldUser.verified },
      newValues: { verified: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    const { password, ...safeUser } = updatedUser!;
    res.json(safeUser);
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.id);
    
    if (!['admin', 'shipper', 'carrier'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const oldUser = await userRepo.findById(userId);
    if (!oldUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = await userRepo.update(userId, { role });
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'users',
      entityId: userId,
      oldValues: { role: oldUser.role },
      newValues: { role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'critical',
    });
    
    const { password, ...safeUser } = updatedUser!;
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user (soft delete - set status to deleted)
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await userRepo.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Soft delete by setting status to deleted
    await userRepo.update(userId, { status: 'deleted' });
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'delete',
      entity: 'users',
      entityId: userId,
      oldValues: user,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'critical',
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user statistics
router.get('/users/stats/summary', async (req, res) => {
  try {
    const stats = await userRepo.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// ==================== LOAD APPROVAL ====================

// Get loads pending approval
router.get('/loads/pending-approval', async (req, res) => {
  try {
    const { db } = await import('../db/index.js');
    const { loads, users } = await import('../db/schema.js');
    const { eq } = await import('drizzle-orm');
    
    const pendingLoads = await db.select({
      load: loads,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        email: users.email,
      }
    })
    .from(loads)
    .leftJoin(users, eq(loads.shipperId, users.id))
    .where(eq(loads.approvalStatus, 'pending'));
    
    res.json(pendingLoads);
  } catch (error) {
    console.error('Error fetching pending loads:', error);
    res.status(500).json({ error: 'Failed to fetch pending loads' });
  }
});

// Approve load
router.patch('/loads/:id/approve', async (req, res) => {
  try {
    const loadId = parseInt(req.params.id);
    const { db } = await import('../db/index.js');
    const { loads } = await import('../db/schema.js');
    const { eq } = await import('drizzle-orm');
    
    const [updatedLoad] = await db.update(loads)
      .set({
        approvalStatus: 'approved',
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        status: 'posted',
        updatedAt: new Date(),
      })
      .where(eq(loads.id, loadId))
      .returning();
    
    if (!updatedLoad) {
      return res.status(404).json({ error: 'Load not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'loads',
      entityId: loadId,
      newValues: { approvalStatus: 'approved' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(updatedLoad);
  } catch (error) {
    console.error('Error approving load:', error);
    res.status(500).json({ error: 'Failed to approve load' });
  }
});

// Reject load
router.patch('/loads/:id/reject', async (req, res) => {
  try {
    const loadId = parseInt(req.params.id);
    const { reason } = req.body;
    const { db } = await import('../db/index.js');
    const { loads } = await import('../db/schema.js');
    const { eq } = await import('drizzle-orm');
    
    const [updatedLoad] = await db.update(loads)
      .set({
        approvalStatus: 'rejected',
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        rejectionReason: reason || 'No reason provided',
        updatedAt: new Date(),
      })
      .where(eq(loads.id, loadId))
      .returning();
    
    if (!updatedLoad) {
      return res.status(404).json({ error: 'Load not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'loads',
      entityId: loadId,
      newValues: { approvalStatus: 'rejected', rejectionReason: reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(updatedLoad);
  } catch (error) {
    console.error('Error rejecting load:', error);
    res.status(500).json({ error: 'Failed to reject load' });
  }
});

// ==================== BID APPROVAL ====================

// Get bids pending approval
router.get('/bids/pending-approval', async (req, res) => {
  try {
    const { db } = await import('../db/index.js');
    const { bookings, loads, users } = await import('../db/schema.js');
    const { eq } = await import('drizzle-orm');
    
    const pendingBids = await db.select({
      bid: bookings,
      load: loads,
      carrier: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
      }
    })
    .from(bookings)
    .leftJoin(loads, eq(bookings.loadId, loads.id))
    .leftJoin(users, eq(bookings.carrierId, users.id))
    .where(eq(bookings.approvalStatus, 'pending'));
    
    res.json(pendingBids);
  } catch (error) {
    console.error('Error fetching pending bids:', error);
    res.status(500).json({ error: 'Failed to fetch pending bids' });
  }
});

// Approve bid
router.patch('/bids/:id/approve', async (req, res) => {
  try {
    const bidId = parseInt(req.params.id);
    const { db } = await import('../db/index.js');
    const { bookings } = await import('../db/schema.js');
    const { eq } = await import('drizzle-orm');
    
    const [updatedBid] = await db.update(bookings)
      .set({
        approvalStatus: 'approved',
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        status: 'confirmed',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bidId))
      .returning();
    
    if (!updatedBid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'bookings',
      entityId: bidId,
      newValues: { approvalStatus: 'approved' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(updatedBid);
  } catch (error) {
    console.error('Error approving bid:', error);
    res.status(500).json({ error: 'Failed to approve bid' });
  }
});

// Reject bid
router.patch('/bids/:id/reject', async (req, res) => {
  try {
    const bidId = parseInt(req.params.id);
    const { reason } = req.body;
    const { db } = await import('../db/index.js');
    const { bookings } = await import('../db/schema.js');
    const { eq } = await import('drizzle-orm');
    
    const [updatedBid] = await db.update(bookings)
      .set({
        approvalStatus: 'rejected',
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        rejectionReason: reason || 'No reason provided',
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bidId))
      .returning();
    
    if (!updatedBid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    await auditLogRepo.log({
      userId: req.user!.id,
      action: 'update',
      entity: 'bookings',
      entityId: bidId,
      newValues: { approvalStatus: 'rejected', rejectionReason: reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(updatedBid);
  } catch (error) {
    console.error('Error rejecting bid:', error);
    res.status(500).json({ error: 'Failed to reject bid' });
  }
});

export default router;
