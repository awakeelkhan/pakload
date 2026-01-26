import { Router } from 'express';
import { db } from '../db/index.js';
import { tirCountries, pakistanRoutes, legalTerms, prohibitedItems } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

// ============================================================================
// TIR COUNTRIES
// ============================================================================

// Get all TIR countries
router.get('/tir-countries', async (req, res) => {
  try {
    const { region, active = 'true' } = req.query;
    
    let countries = await db.select().from(tirCountries);
    
    if (active === 'true') {
      countries = countries.filter(c => c.active);
    }
    if (region) {
      countries = countries.filter(c => c.region === region);
    }
    
    // Group by region
    const byRegion = countries.reduce((acc: Record<string, typeof countries>, country) => {
      const r = country.region || 'Other';
      if (!acc[r]) acc[r] = [];
      acc[r].push(country);
      return acc;
    }, {});
    
    res.json({
      total: countries.length,
      countries,
      byRegion,
    });
  } catch (error) {
    console.error('Error fetching TIR countries:', error);
    res.status(500).json({ error: 'Failed to fetch TIR countries' });
  }
});

// Get TIR country by code
router.get('/tir-countries/:code', async (req, res) => {
  try {
    const [country] = await db.select()
      .from(tirCountries)
      .where(eq(tirCountries.code, req.params.code.toUpperCase()));
    
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    res.json(country);
  } catch (error) {
    console.error('Error fetching TIR country:', error);
    res.status(500).json({ error: 'Failed to fetch TIR country' });
  }
});

// ============================================================================
// PAKISTAN ROUTES
// ============================================================================

// Get all Pakistan routes
router.get('/pakistan-routes', async (req, res) => {
  try {
    const { fromCity, toCity, routeType, popularity } = req.query;
    
    let routes = await db.select().from(pakistanRoutes).where(eq(pakistanRoutes.active, true));
    
    if (fromCity) {
      routes = routes.filter(r => 
        r.fromCity.toLowerCase().includes((fromCity as string).toLowerCase())
      );
    }
    if (toCity) {
      routes = routes.filter(r => 
        r.toCity.toLowerCase().includes((toCity as string).toLowerCase())
      );
    }
    if (routeType) {
      routes = routes.filter(r => r.routeType === routeType);
    }
    if (popularity) {
      routes = routes.filter(r => r.popularity === popularity);
    }
    
    // Group by route type
    const byType = routes.reduce((acc: Record<string, typeof routes>, route) => {
      const t = route.routeType || 'other';
      if (!acc[t]) acc[t] = [];
      acc[t].push(route);
      return acc;
    }, {});
    
    res.json({
      total: routes.length,
      routes,
      byType,
    });
  } catch (error) {
    console.error('Error fetching Pakistan routes:', error);
    res.status(500).json({ error: 'Failed to fetch Pakistan routes' });
  }
});

// Get route by code
router.get('/pakistan-routes/:code', async (req, res) => {
  try {
    const [route] = await db.select()
      .from(pakistanRoutes)
      .where(eq(pakistanRoutes.routeCode, req.params.code.toUpperCase()));
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// Get routes for map display (with coordinates)
router.get('/pakistan-routes/map/all', async (req, res) => {
  try {
    const routes = await db.select({
      id: pakistanRoutes.id,
      routeCode: pakistanRoutes.routeCode,
      fromCity: pakistanRoutes.fromCity,
      fromLatitude: pakistanRoutes.fromLatitude,
      fromLongitude: pakistanRoutes.fromLongitude,
      toCity: pakistanRoutes.toCity,
      toLatitude: pakistanRoutes.toLatitude,
      toLongitude: pakistanRoutes.toLongitude,
      distanceKm: pakistanRoutes.distanceKm,
      routeType: pakistanRoutes.routeType,
      popularity: pakistanRoutes.popularity,
    })
    .from(pakistanRoutes)
    .where(eq(pakistanRoutes.active, true));
    
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes for map:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// ============================================================================
// LEGAL TERMS
// ============================================================================

// Get all active legal terms
router.get('/legal-terms', async (req, res) => {
  try {
    const { termType, language = 'en' } = req.query;
    
    let terms = await db.select()
      .from(legalTerms)
      .where(eq(legalTerms.active, true));
    
    if (termType) {
      terms = terms.filter(t => t.termType === termType);
    }
    if (language) {
      terms = terms.filter(t => t.language === language);
    }
    
    // Sort by display order
    terms.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
    res.json(terms);
  } catch (error) {
    console.error('Error fetching legal terms:', error);
    res.status(500).json({ error: 'Failed to fetch legal terms' });
  }
});

// Get specific legal term
router.get('/legal-terms/:type', async (req, res) => {
  try {
    const terms = await db.select()
      .from(legalTerms)
      .where(and(
        eq(legalTerms.termType, req.params.type),
        eq(legalTerms.active, true)
      ));
    
    if (terms.length === 0) {
      return res.status(404).json({ error: 'Legal term not found' });
    }
    
    // Return the latest version
    res.json(terms[0]);
  } catch (error) {
    console.error('Error fetching legal term:', error);
    res.status(500).json({ error: 'Failed to fetch legal term' });
  }
});

// ============================================================================
// PROHIBITED ITEMS
// ============================================================================

// Get all prohibited items
router.get('/prohibited-items', async (req, res) => {
  try {
    const { category } = req.query;
    
    let items = await db.select()
      .from(prohibitedItems)
      .where(eq(prohibitedItems.active, true));
    
    if (category) {
      items = items.filter(i => i.category === category);
    }
    
    // Group by category
    const byCategory = items.reduce((acc: Record<string, typeof items>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    
    res.json({
      total: items.length,
      items,
      byCategory,
      categories: Object.keys(byCategory),
    });
  } catch (error) {
    console.error('Error fetching prohibited items:', error);
    res.status(500).json({ error: 'Failed to fetch prohibited items' });
  }
});

// ============================================================================
// PAKISTAN CITIES (for autocomplete)
// ============================================================================

router.get('/pakistan-cities', (req, res) => {
  const cities = [
    // Punjab
    { name: 'Lahore', province: 'Punjab', latitude: 31.5204, longitude: 74.3587 },
    { name: 'Faisalabad', province: 'Punjab', latitude: 31.4504, longitude: 73.1350 },
    { name: 'Rawalpindi', province: 'Punjab', latitude: 33.5651, longitude: 73.0169 },
    { name: 'Multan', province: 'Punjab', latitude: 30.1575, longitude: 71.5249 },
    { name: 'Gujranwala', province: 'Punjab', latitude: 32.1877, longitude: 74.1945 },
    { name: 'Sialkot', province: 'Punjab', latitude: 32.4945, longitude: 74.5229 },
    { name: 'Bahawalpur', province: 'Punjab', latitude: 29.3956, longitude: 71.6836 },
    { name: 'Sargodha', province: 'Punjab', latitude: 32.0836, longitude: 72.6711 },
    { name: 'Sahiwal', province: 'Punjab', latitude: 30.6682, longitude: 73.1114 },
    { name: 'Rahim Yar Khan', province: 'Punjab', latitude: 28.4202, longitude: 70.2952 },
    { name: 'Dera Ghazi Khan', province: 'Punjab', latitude: 30.0489, longitude: 70.6455 },
    
    // Sindh
    { name: 'Karachi', province: 'Sindh', latitude: 24.8607, longitude: 67.0011 },
    { name: 'Hyderabad', province: 'Sindh', latitude: 25.3960, longitude: 68.3578 },
    { name: 'Sukkur', province: 'Sindh', latitude: 27.7052, longitude: 68.8574 },
    { name: 'Larkana', province: 'Sindh', latitude: 27.5570, longitude: 68.2028 },
    { name: 'Nawabshah', province: 'Sindh', latitude: 26.2442, longitude: 68.4100 },
    { name: 'Mirpur Khas', province: 'Sindh', latitude: 25.5276, longitude: 69.0159 },
    
    // KPK
    { name: 'Peshawar', province: 'KPK', latitude: 34.0151, longitude: 71.5249 },
    { name: 'Mardan', province: 'KPK', latitude: 34.1986, longitude: 72.0404 },
    { name: 'Abbottabad', province: 'KPK', latitude: 34.1688, longitude: 73.2215 },
    { name: 'Swat', province: 'KPK', latitude: 35.2227, longitude: 72.4258 },
    { name: 'Dera Ismail Khan', province: 'KPK', latitude: 31.8626, longitude: 70.9019 },
    { name: 'Kohat', province: 'KPK', latitude: 33.5869, longitude: 71.4414 },
    { name: 'Mansehra', province: 'KPK', latitude: 34.3300, longitude: 73.2000 },
    
    // Balochistan
    { name: 'Quetta', province: 'Balochistan', latitude: 30.1798, longitude: 66.9750 },
    { name: 'Gwadar', province: 'Balochistan', latitude: 25.1264, longitude: 62.3225 },
    { name: 'Turbat', province: 'Balochistan', latitude: 26.0031, longitude: 63.0544 },
    { name: 'Khuzdar', province: 'Balochistan', latitude: 27.8000, longitude: 66.6167 },
    { name: 'Chaman', province: 'Balochistan', latitude: 30.9167, longitude: 66.4500 },
    { name: 'Hub', province: 'Balochistan', latitude: 25.0500, longitude: 66.8833 },
    
    // Gilgit-Baltistan
    { name: 'Gilgit', province: 'Gilgit-Baltistan', latitude: 35.9208, longitude: 74.3144 },
    { name: 'Skardu', province: 'Gilgit-Baltistan', latitude: 35.2971, longitude: 75.6333 },
    { name: 'Hunza', province: 'Gilgit-Baltistan', latitude: 36.3167, longitude: 74.6500 },
    { name: 'Sost', province: 'Gilgit-Baltistan', latitude: 36.7167, longitude: 74.8833 },
    
    // AJK
    { name: 'Muzaffarabad', province: 'AJK', latitude: 34.3700, longitude: 73.4711 },
    { name: 'Mirpur', province: 'AJK', latitude: 33.1500, longitude: 73.7500 },
    
    // Federal
    { name: 'Islamabad', province: 'Federal', latitude: 33.6844, longitude: 72.0479 },
    
    // Border Crossings
    { name: 'Torkham', province: 'KPK', latitude: 34.1000, longitude: 71.0833, isBorder: true },
    { name: 'Wagah', province: 'Punjab', latitude: 31.6047, longitude: 74.5728, isBorder: true },
    { name: 'Taftan', province: 'Balochistan', latitude: 28.9667, longitude: 61.5833, isBorder: true },
    { name: 'Khunjerab', province: 'Gilgit-Baltistan', latitude: 36.8500, longitude: 75.4167, isBorder: true },
  ];
  
  const { search, province } = req.query;
  
  let filtered = cities;
  if (search) {
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes((search as string).toLowerCase())
    );
  }
  if (province) {
    filtered = filtered.filter(c => c.province === province);
  }
  
  res.json(filtered);
});

export default router;
