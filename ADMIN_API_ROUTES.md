# 🔌 Admin API Routes - Complete Documentation

All admin API routes with RBAC, audit logging, and safe publishing workflows.

---

## 🔐 **Authentication**

All admin routes require:
- `Authorization: Bearer <token>` header
- User role must be `admin`

**Base URL:** `/api/admin`

---

## 📦 **Cargo Categories**

### Get All Categories
```http
GET /api/admin/categories?status=published
Response: 200 OK
[{ id, name, description, icon, baseRate, status, displayOrder, ... }]
```

### Get Category by ID
```http
GET /api/admin/categories/:id
Response: 200 OK
{ id, name, description, ... }
```

### Create Category
```http
POST /api/admin/categories
Body: { name, description, icon, baseRate, displayOrder }
Response: 201 Created
```

### Update Category
```http
PUT /api/admin/categories/:id
Body: { name, description, baseRate, ... }
Response: 200 OK
```

### Publish Category
```http
POST /api/admin/categories/:id/publish
Response: 200 OK
```

### Unpublish Category
```http
POST /api/admin/categories/:id/unpublish
Response: 200 OK
```

### Delete Category
```http
DELETE /api/admin/categories/:id
Response: 200 OK
```

### Reorder Categories
```http
POST /api/admin/categories/reorder
Body: { updates: [{ id, displayOrder }] }
Response: 200 OK
```

### Get Category Stats
```http
GET /api/admin/categories/stats
Response: { total, published, draft, archived }
```

---

## 💰 **Pricing Rules**

### Get All Rules
```http
GET /api/admin/pricing-rules?status=published&ruleType=weight
Response: 200 OK
```

### Get Rule by ID
```http
GET /api/admin/pricing-rules/:id
Response: 200 OK
```

### Get Active Rules
```http
GET /api/admin/pricing-rules/active/list
Response: 200 OK
```

### Find Applicable Rules
```http
POST /api/admin/pricing-rules/applicable
Body: { ruleType, categoryId, routeId, value }
Response: 200 OK
```

### Create Rule
```http
POST /api/admin/pricing-rules
Body: { name, description, ruleType, minValue, maxValue, pricePerUnit, multiplier, priority }
Response: 201 Created
```

### Update Rule
```http
PUT /api/admin/pricing-rules/:id
Response: 200 OK
```

### Publish Rule
```http
POST /api/admin/pricing-rules/:id/publish
Response: 200 OK
```

### Unpublish Rule
```http
POST /api/admin/pricing-rules/:id/unpublish
Response: 200 OK
```

### Delete Rule
```http
DELETE /api/admin/pricing-rules/:id
Response: 200 OK
```

### Get Rule Stats
```http
GET /api/admin/pricing-rules/stats/summary
Response: { total, published, draft, active, byType }
```

---

## 🗺️ **Route Pricing**

### Get All Route Pricing
```http
GET /api/admin/route-pricing?routeId=1&categoryId=2
Response: 200 OK
```

### Get Route Pricing by ID
```http
GET /api/admin/route-pricing/:id
Response: 200 OK
```

### Get Active Route Pricing
```http
GET /api/admin/route-pricing/active/:routeId?categoryId=1
Response: 200 OK
```

### Create Route Pricing
```http
POST /api/admin/route-pricing
Body: { routeId, categoryId, basePrice, pricePerKg, pricePerKm, surgeMultiplier }
Response: 201 Created
```

### Bulk Create Route Pricing
```http
POST /api/admin/route-pricing/bulk
Body: { pricing: [{ routeId, basePrice, ... }] }
Response: 201 Created
```

### Update Route Pricing
```http
PUT /api/admin/route-pricing/:id
Response: 200 OK
```

### Publish/Unpublish/Delete
```http
POST /api/admin/route-pricing/:id/publish
POST /api/admin/route-pricing/:id/unpublish
DELETE /api/admin/route-pricing/:id
```

---

## ⚙️ **Platform Config**

### Get All Configs
```http
GET /api/admin/config?category=payment&status=published
Response: 200 OK
```

### Get Config by Key
```http
GET /api/admin/config/:key
Response: 200 OK
```

### Get Config Value (Parsed)
```http
GET /api/admin/config/:key/value
Response: { value: <parsed_value> }
```

### Get Configs by Category
```http
GET /api/admin/config/by-category/all
Response: { general: [...], payment: [...], ... }
```

### Create Config
```http
POST /api/admin/config
Body: { key, value, description, category, dataType, isPublic }
Response: 201 Created
```

### Update Config
```http
PUT /api/admin/config/:key
Response: 200 OK
```

### Bulk Update Configs
```http
POST /api/admin/config/bulk-update
Body: { updates: [{ key, value }] }
Response: 200 OK
```

### Publish/Unpublish/Delete
```http
POST /api/admin/config/:key/publish
POST /api/admin/config/:key/unpublish
DELETE /api/admin/config/:key
```

---

## 📊 **Audit Logs**

### Get All Audit Logs
```http
GET /api/admin/audit-logs?userId=1&action=update&entity=pricing_rules&limit=100
Response: 200 OK
```

### Get Entity Audit Logs
```http
GET /api/admin/audit-logs/:entity/:entityId
Response: 200 OK
```

### Get Recent Audit Logs
```http
GET /api/admin/audit-logs/recent/list?limit=50
Response: 200 OK
```

### Get Audit Log Stats
```http
GET /api/admin/audit-logs/stats/summary?startDate=2024-01-01&endDate=2024-01-31
Response: { total, byAction, bySeverity, byEntity }
```

---

## 🛣️ **Routes Management**

### Get All Routes
```http
GET /api/admin/routes
Response: 200 OK
```

### Get Route by ID
```http
GET /api/admin/routes/:id
Response: 200 OK
```

### Search Routes
```http
GET /api/admin/routes/search/:query
Response: 200 OK
```

### Get Popular Routes
```http
GET /api/admin/routes/popular/list?limit=10
Response: 200 OK
```

### Create Route
```http
POST /api/admin/routes
Body: { from, to, distance, estimatedDays, borderCrossing }
Response: 201 Created
```

### Update Route
```http
PUT /api/admin/routes/:id
Response: 200 OK
```

### Update Route Stats
```http
PUT /api/admin/routes/:id/stats
Body: { activeTrucks, activeLoads, avgPrice }
Response: 200 OK
```

### Delete Route
```http
DELETE /api/admin/routes/:id
Response: 200 OK
```

### Get Route Stats
```http
GET /api/admin/routes/stats/summary
Response: { total, totalActiveTrucks, totalActiveLoads, avgDistance, popular }
```

---

## 🔒 **Security Features**

### RBAC Middleware
- `requireAuth` - Validates JWT token
- `requireAdmin` - Ensures user role is admin
- `requireRole(...roles)` - Flexible role checking

### Audit Logging
All admin actions are automatically logged with:
- User ID
- Action type (create, update, delete, publish, unpublish)
- Entity type and ID
- Old and new values (with automatic change detection)
- IP address and user agent
- Timestamp and severity level

### Publishing Workflow
- **Draft** → Create/edit without affecting live system
- **Published** → Active and visible to users
- **Archived** → Soft delete, data retained

---

## 📝 **Example Usage**

### Create and Publish a Pricing Rule
```javascript
// 1. Create draft rule
const rule = await fetch('/api/admin/pricing-rules', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer admin-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Heavy Weight Surcharge',
    description: 'Extra charge for loads over 10,000 kg',
    ruleType: 'weight',
    minValue: 10000,
    multiplier: 1.5,
    priority: 10
  })
});

// 2. Publish rule
await fetch(`/api/admin/pricing-rules/${rule.id}/publish`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer admin-token' }
});

// 3. View audit log
const logs = await fetch(`/api/admin/audit-logs/pricing_rules/${rule.id}`, {
  headers: { 'Authorization': 'Bearer admin-token' }
});
```

---

## ✅ **Implementation Status**

- [x] Auth middleware with RBAC
- [x] Cargo categories endpoints (8 routes)
- [x] Pricing rules endpoints (10 routes)
- [x] Route pricing endpoints (9 routes)
- [x] Platform config endpoints (10 routes)
- [x] Audit logs endpoints (4 routes)
- [x] Routes management endpoints (8 routes)
- [x] Automatic audit logging
- [x] Publishing workflow
- [x] Error handling
- [x] Input validation ready

**Total: 49 admin API endpoints** 🎉
