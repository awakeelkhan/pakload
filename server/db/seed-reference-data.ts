import { db } from './index';
import { tirCountries, pakistanRoutes, legalTerms, prohibitedItems } from './schema';

// TIR Convention Member Countries (60+ countries)
const tirCountriesData = [
  // Europe
  { code: 'ALB', name: 'Albania', region: 'Europe', tirMember: true, customsUnion: null },
  { code: 'AND', name: 'Andorra', region: 'Europe', tirMember: true, customsUnion: null },
  { code: 'AUT', name: 'Austria', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'BLR', name: 'Belarus', region: 'Europe', tirMember: true, customsUnion: 'EAEU' },
  { code: 'BEL', name: 'Belgium', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'BIH', name: 'Bosnia and Herzegovina', region: 'Europe', tirMember: true, customsUnion: null },
  { code: 'BGR', name: 'Bulgaria', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'HRV', name: 'Croatia', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'CYP', name: 'Cyprus', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'CZE', name: 'Czech Republic', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'DNK', name: 'Denmark', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'EST', name: 'Estonia', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'FIN', name: 'Finland', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'FRA', name: 'France', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'DEU', name: 'Germany', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'GRC', name: 'Greece', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'HUN', name: 'Hungary', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'IRL', name: 'Ireland', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'ITA', name: 'Italy', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'LVA', name: 'Latvia', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'LTU', name: 'Lithuania', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'LUX', name: 'Luxembourg', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'MKD', name: 'North Macedonia', region: 'Europe', tirMember: true, customsUnion: null },
  { code: 'MLT', name: 'Malta', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'MDA', name: 'Moldova', region: 'Europe', tirMember: true, customsUnion: null },
  { code: 'MNE', name: 'Montenegro', region: 'Europe', tirMember: true, customsUnion: null },
  { code: 'NLD', name: 'Netherlands', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'NOR', name: 'Norway', region: 'Europe', tirMember: true, customsUnion: 'EFTA' },
  { code: 'POL', name: 'Poland', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'PRT', name: 'Portugal', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'ROU', name: 'Romania', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'RUS', name: 'Russia', region: 'Europe', tirMember: true, customsUnion: 'EAEU' },
  { code: 'SRB', name: 'Serbia', region: 'Europe', tirMember: true, customsUnion: null },
  { code: 'SVK', name: 'Slovakia', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'SVN', name: 'Slovenia', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'ESP', name: 'Spain', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'SWE', name: 'Sweden', region: 'Europe', tirMember: true, customsUnion: 'EU' },
  { code: 'CHE', name: 'Switzerland', region: 'Europe', tirMember: true, customsUnion: 'EFTA' },
  { code: 'UKR', name: 'Ukraine', region: 'Europe', tirMember: true, customsUnion: null },
  { code: 'GBR', name: 'United Kingdom', region: 'Europe', tirMember: true, customsUnion: null },
  
  // Middle East
  { code: 'IRN', name: 'Iran', region: 'Middle East', tirMember: true, customsUnion: null, borderCrossings: ['Taftan-Mirjaveh', 'Quetta-Zahedan'] },
  { code: 'IRQ', name: 'Iraq', region: 'Middle East', tirMember: true, customsUnion: null },
  { code: 'ISR', name: 'Israel', region: 'Middle East', tirMember: true, customsUnion: null },
  { code: 'JOR', name: 'Jordan', region: 'Middle East', tirMember: true, customsUnion: null },
  { code: 'KWT', name: 'Kuwait', region: 'Middle East', tirMember: true, customsUnion: 'GCC' },
  { code: 'LBN', name: 'Lebanon', region: 'Middle East', tirMember: true, customsUnion: null },
  { code: 'OMN', name: 'Oman', region: 'Middle East', tirMember: true, customsUnion: 'GCC' },
  { code: 'QAT', name: 'Qatar', region: 'Middle East', tirMember: true, customsUnion: 'GCC' },
  { code: 'SAU', name: 'Saudi Arabia', region: 'Middle East', tirMember: true, customsUnion: 'GCC' },
  { code: 'SYR', name: 'Syria', region: 'Middle East', tirMember: true, customsUnion: null },
  { code: 'TUR', name: 'Turkey', region: 'Middle East', tirMember: true, customsUnion: null, borderCrossings: ['Kapikule', 'Habur', 'Gurbulak'] },
  { code: 'ARE', name: 'United Arab Emirates', region: 'Middle East', tirMember: true, customsUnion: 'GCC' },
  { code: 'YEM', name: 'Yemen', region: 'Middle East', tirMember: true, customsUnion: null },
  
  // Central Asia
  { code: 'AFG', name: 'Afghanistan', region: 'Central Asia', tirMember: true, customsUnion: null, borderCrossings: ['Torkham', 'Chaman-Spin Boldak', 'Ghulam Khan'] },
  { code: 'KAZ', name: 'Kazakhstan', region: 'Central Asia', tirMember: true, customsUnion: 'EAEU' },
  { code: 'KGZ', name: 'Kyrgyzstan', region: 'Central Asia', tirMember: true, customsUnion: 'EAEU' },
  { code: 'TJK', name: 'Tajikistan', region: 'Central Asia', tirMember: true, customsUnion: null },
  { code: 'TKM', name: 'Turkmenistan', region: 'Central Asia', tirMember: true, customsUnion: null },
  { code: 'UZB', name: 'Uzbekistan', region: 'Central Asia', tirMember: true, customsUnion: null },
  
  // South Asia
  { code: 'PAK', name: 'Pakistan', region: 'South Asia', tirMember: true, customsUnion: null, borderCrossings: ['Torkham', 'Chaman', 'Taftan', 'Wagah', 'Sost-Khunjerab'] },
  { code: 'IND', name: 'India', region: 'South Asia', tirMember: true, customsUnion: null, borderCrossings: ['Wagah-Attari'] },
  
  // East Asia
  { code: 'CHN', name: 'China', region: 'East Asia', tirMember: true, customsUnion: null, borderCrossings: ['Khunjerab Pass', 'Kashgar'] },
  { code: 'MNG', name: 'Mongolia', region: 'East Asia', tirMember: true, customsUnion: null },
  { code: 'KOR', name: 'South Korea', region: 'East Asia', tirMember: true, customsUnion: null },
  
  // Caucasus
  { code: 'ARM', name: 'Armenia', region: 'Caucasus', tirMember: true, customsUnion: 'EAEU' },
  { code: 'AZE', name: 'Azerbaijan', region: 'Caucasus', tirMember: true, customsUnion: null },
  { code: 'GEO', name: 'Georgia', region: 'Caucasus', tirMember: true, customsUnion: null },
  
  // Africa
  { code: 'DZA', name: 'Algeria', region: 'Africa', tirMember: true, customsUnion: null },
  { code: 'EGY', name: 'Egypt', region: 'Africa', tirMember: true, customsUnion: null },
  { code: 'LBY', name: 'Libya', region: 'Africa', tirMember: true, customsUnion: null },
  { code: 'MAR', name: 'Morocco', region: 'Africa', tirMember: true, customsUnion: null },
  { code: 'TUN', name: 'Tunisia', region: 'Africa', tirMember: true, customsUnion: null },
];

// Pakistan Domestic Routes
const pakistanRoutesData = [
  // Major Motorway Routes
  {
    routeCode: 'M1-ISB-PSH',
    fromCity: 'Islamabad',
    fromProvince: 'Federal',
    fromLatitude: '33.6844000',
    fromLongitude: '72.0479000',
    toCity: 'Peshawar',
    toProvince: 'KPK',
    toLatitude: '34.0151000',
    toLongitude: '71.5249000',
    distanceKm: 155,
    estimatedHours: '2.0',
    routeType: 'motorway',
    tollPlazas: 3,
    majorCities: ['Islamabad', 'Burhan', 'Swabi', 'Peshawar'],
    popularity: 'high',
  },
  {
    routeCode: 'M2-ISB-LHR',
    fromCity: 'Islamabad',
    fromProvince: 'Federal',
    fromLatitude: 33.6844,
    fromLongitude: 72.0479,
    toCity: 'Lahore',
    toProvince: 'Punjab',
    toLatitude: 31.5204,
    toLongitude: 74.3587,
    distanceKm: 375,
    estimatedHours: 4.0,
    routeType: 'motorway',
    tollPlazas: 8,
    majorCities: ['Islamabad', 'Kallar Kahar', 'Pindi Bhattian', 'Lahore'],
    popularity: 'high',
  },
  {
    routeCode: 'M3-LHR-MUL',
    fromCity: 'Lahore',
    fromProvince: 'Punjab',
    fromLatitude: 31.5204,
    fromLongitude: 74.3587,
    toCity: 'Multan',
    toProvince: 'Punjab',
    toLatitude: 30.1575,
    toLongitude: 71.5249,
    distanceKm: 342,
    estimatedHours: 4.0,
    routeType: 'motorway',
    tollPlazas: 6,
    majorCities: ['Lahore', 'Sahiwal', 'Khanewal', 'Multan'],
    popularity: 'high',
  },
  {
    routeCode: 'M4-FSL-MUL',
    fromCity: 'Faisalabad',
    fromProvince: 'Punjab',
    fromLatitude: 31.4504,
    fromLongitude: 73.1350,
    toCity: 'Multan',
    toProvince: 'Punjab',
    toLatitude: 30.1575,
    toLongitude: 71.5249,
    distanceKm: 242,
    estimatedHours: 3.0,
    routeType: 'motorway',
    tollPlazas: 5,
    majorCities: ['Faisalabad', 'Toba Tek Singh', 'Khanewal', 'Multan'],
    popularity: 'medium',
  },
  {
    routeCode: 'M5-MUL-SKR',
    fromCity: 'Multan',
    fromProvince: 'Punjab',
    fromLatitude: 30.1575,
    fromLongitude: 71.5249,
    toCity: 'Sukkur',
    toProvince: 'Sindh',
    toLatitude: 27.7052,
    toLongitude: 68.8574,
    distanceKm: 392,
    estimatedHours: 4.5,
    routeType: 'motorway',
    tollPlazas: 7,
    majorCities: ['Multan', 'Bahawalpur', 'Rahim Yar Khan', 'Sukkur'],
    popularity: 'high',
  },
  {
    routeCode: 'M9-HYD-KHI',
    fromCity: 'Hyderabad',
    fromProvince: 'Sindh',
    fromLatitude: 25.3960,
    fromLongitude: 68.3578,
    toCity: 'Karachi',
    toProvince: 'Sindh',
    toLatitude: 24.8607,
    toLongitude: 67.0011,
    distanceKm: 136,
    estimatedHours: 1.5,
    routeType: 'motorway',
    tollPlazas: 3,
    majorCities: ['Hyderabad', 'Jamshoro', 'Karachi'],
    popularity: 'high',
  },
  
  // National Highway Routes
  {
    routeCode: 'N5-KHI-PSH',
    fromCity: 'Karachi',
    fromProvince: 'Sindh',
    fromLatitude: 24.8607,
    fromLongitude: 67.0011,
    toCity: 'Peshawar',
    toProvince: 'KPK',
    toLatitude: 34.0151,
    toLongitude: 71.5249,
    distanceKm: 1819,
    estimatedHours: 24.0,
    routeType: 'national_highway',
    tollPlazas: 15,
    majorCities: ['Karachi', 'Hyderabad', 'Sukkur', 'Multan', 'Lahore', 'Islamabad', 'Peshawar'],
    restrictions: 'Heavy vehicles restricted during peak hours in cities',
    popularity: 'high',
  },
  {
    routeCode: 'N25-KHI-QTA',
    fromCity: 'Karachi',
    fromProvince: 'Sindh',
    fromLatitude: 24.8607,
    fromLongitude: 67.0011,
    toCity: 'Quetta',
    toProvince: 'Balochistan',
    toLatitude: 30.1798,
    toLongitude: 66.9750,
    distanceKm: 687,
    estimatedHours: 12.0,
    routeType: 'national_highway',
    tollPlazas: 5,
    majorCities: ['Karachi', 'Hub', 'Bela', 'Khuzdar', 'Kalat', 'Quetta'],
    restrictions: 'Security escort required for some sections',
    popularity: 'medium',
  },
  {
    routeCode: 'N35-ISB-SST',
    fromCity: 'Islamabad',
    fromProvince: 'Federal',
    fromLatitude: 33.6844,
    fromLongitude: 72.0479,
    toCity: 'Sost',
    toProvince: 'Gilgit-Baltistan',
    toLatitude: 36.7167,
    toLongitude: 74.8833,
    distanceKm: 887,
    estimatedHours: 18.0,
    routeType: 'national_highway',
    tollPlazas: 4,
    majorCities: ['Islamabad', 'Abbottabad', 'Mansehra', 'Chilas', 'Gilgit', 'Sost'],
    restrictions: 'Closed during winter (Nov-Apr) due to snow. Karakoram Highway.',
    popularity: 'medium',
  },
  {
    routeCode: 'N50-QTA-DGK',
    fromCity: 'Quetta',
    fromProvince: 'Balochistan',
    fromLatitude: 30.1798,
    fromLongitude: 66.9750,
    toCity: 'Dera Ghazi Khan',
    toProvince: 'Punjab',
    toLatitude: 30.0489,
    toLongitude: 70.6455,
    distanceKm: 350,
    estimatedHours: 6.0,
    routeType: 'national_highway',
    tollPlazas: 3,
    majorCities: ['Quetta', 'Loralai', 'Dera Ghazi Khan'],
    popularity: 'medium',
  },
  {
    routeCode: 'N55-PSH-KHI',
    fromCity: 'Peshawar',
    fromProvince: 'KPK',
    fromLatitude: 34.0151,
    fromLongitude: 71.5249,
    toCity: 'Karachi',
    toProvince: 'Sindh',
    toLatitude: 24.8607,
    toLongitude: 67.0011,
    distanceKm: 1264,
    estimatedHours: 20.0,
    routeType: 'national_highway',
    tollPlazas: 10,
    majorCities: ['Peshawar', 'D.I.Khan', 'D.G.Khan', 'Rajanpur', 'Kashmore', 'Larkana', 'Karachi'],
    restrictions: 'Indus Highway - Alternative to N5',
    popularity: 'medium',
  },
  
  // CPEC Routes
  {
    routeCode: 'CPEC-GWD-KSH',
    fromCity: 'Gwadar',
    fromProvince: 'Balochistan',
    fromLatitude: 25.1264,
    fromLongitude: 62.3225,
    toCity: 'Kashgar',
    toProvince: 'China',
    toLatitude: 39.4547,
    toLongitude: 75.9797,
    distanceKm: 2442,
    estimatedHours: 48.0,
    routeType: 'cpec_corridor',
    tollPlazas: 20,
    majorCities: ['Gwadar', 'Turbat', 'Quetta', 'D.I.Khan', 'Islamabad', 'Gilgit', 'Sost', 'Khunjerab', 'Kashgar'],
    restrictions: 'International border crossing. TIR Carnet required.',
    popularity: 'high',
  },
  {
    routeCode: 'CPEC-KHI-KSH',
    fromCity: 'Karachi',
    fromProvince: 'Sindh',
    fromLatitude: 24.8607,
    fromLongitude: 67.0011,
    toCity: 'Kashgar',
    toProvince: 'China',
    toLatitude: 39.4547,
    toLongitude: 75.9797,
    distanceKm: 2700,
    estimatedHours: 52.0,
    routeType: 'cpec_corridor',
    tollPlazas: 22,
    majorCities: ['Karachi', 'Hyderabad', 'Sukkur', 'Multan', 'Lahore', 'Islamabad', 'Gilgit', 'Sost', 'Khunjerab', 'Kashgar'],
    restrictions: 'International border crossing. TIR Carnet required.',
    popularity: 'high',
  },
  
  // Border Crossing Routes
  {
    routeCode: 'BC-TKH-JBD',
    fromCity: 'Torkham',
    fromProvince: 'KPK',
    fromLatitude: 34.1000,
    fromLongitude: 71.0833,
    toCity: 'Jalalabad',
    toProvince: 'Afghanistan',
    toLatitude: 34.4306,
    toLongitude: 70.4500,
    distanceKm: 58,
    estimatedHours: 2.0,
    routeType: 'border_crossing',
    tollPlazas: 0,
    majorCities: ['Torkham', 'Jalalabad'],
    restrictions: 'Border crossing. Valid visa and customs documents required.',
    popularity: 'high',
  },
  {
    routeCode: 'BC-CHM-KND',
    fromCity: 'Chaman',
    fromProvince: 'Balochistan',
    fromLatitude: 30.9167,
    fromLongitude: 66.4500,
    toCity: 'Kandahar',
    toProvince: 'Afghanistan',
    toLatitude: 31.6133,
    toLongitude: 65.7100,
    distanceKm: 100,
    estimatedHours: 3.0,
    routeType: 'border_crossing',
    tollPlazas: 0,
    majorCities: ['Chaman', 'Spin Boldak', 'Kandahar'],
    restrictions: 'Border crossing. Valid visa and customs documents required.',
    popularity: 'medium',
  },
  {
    routeCode: 'BC-WGH-AMR',
    fromCity: 'Wagah',
    fromProvince: 'Punjab',
    fromLatitude: 31.6047,
    fromLongitude: 74.5728,
    toCity: 'Amritsar',
    toProvince: 'India',
    toLatitude: 31.6340,
    toLongitude: 74.8723,
    distanceKm: 28,
    estimatedHours: 1.0,
    routeType: 'border_crossing',
    tollPlazas: 0,
    majorCities: ['Wagah', 'Attari', 'Amritsar'],
    restrictions: 'Limited cargo types. Prior approval required.',
    popularity: 'low',
  },
  {
    routeCode: 'BC-TFT-ZHD',
    fromCity: 'Taftan',
    fromProvince: 'Balochistan',
    fromLatitude: 28.9667,
    fromLongitude: 61.5833,
    toCity: 'Zahedan',
    toProvince: 'Iran',
    toLatitude: 29.4963,
    toLongitude: 60.8629,
    distanceKm: 95,
    estimatedHours: 2.5,
    routeType: 'border_crossing',
    tollPlazas: 0,
    majorCities: ['Taftan', 'Mirjaveh', 'Zahedan'],
    restrictions: 'Border crossing. TIR Carnet accepted.',
    popularity: 'medium',
  },
];

// Legal Terms & Disclaimers
const legalTermsData = [
  {
    termType: 'disclaimer',
    title: 'Prohibited & Illegal Items Disclaimer',
    content: `
PROHIBITED ITEMS POLICY

PakLoad strictly prohibits the transportation of the following items:

1. ILLEGAL SUBSTANCES
- Narcotics and controlled substances
- Illegal drugs and precursor chemicals
- Counterfeit currency

2. WEAPONS & EXPLOSIVES
- Firearms and ammunition (without valid permits)
- Explosives and explosive devices
- Military equipment

3. HAZARDOUS MATERIALS (without proper certification)
- Radioactive materials
- Toxic chemicals
- Flammable substances (Class 1-9 dangerous goods require special permits)

4. CONTRABAND
- Smuggled goods
- Items evading customs duties
- Stolen property

5. RESTRICTED ITEMS
- Alcohol (in prohibited areas)
- Tobacco products (exceeding legal limits)
- Wildlife and endangered species products

CONSEQUENCES:
- Immediate termination of service
- Reporting to law enforcement
- Full legal liability on the shipper
- Permanent ban from platform

By using PakLoad, you confirm that your shipment does not contain any prohibited items.
    `,
    version: '1.0',
    language: 'en',
    effectiveFrom: new Date('2024-01-01'),
    mandatory: true,
    displayOrder: 1,
  },
  {
    termType: 'liability',
    title: 'Client Responsibilities & Liability',
    content: `
CLIENT RESPONSIBILITIES

1. SHIPPER RESPONSIBILITIES
- Accurate declaration of cargo contents, weight, and dimensions
- Proper packaging and labeling of goods
- Providing all required documentation
- Ensuring cargo is legal and permitted for transport
- Payment of agreed freight charges

2. CARRIER RESPONSIBILITIES
- Safe transportation of goods
- Timely pickup and delivery
- Maintaining vehicle in roadworthy condition
- Valid insurance coverage
- Proper documentation during transit

3. LIABILITY LIMITATIONS
- PakLoad acts as a platform connecting shippers and carriers
- PakLoad is not liable for cargo damage, loss, or delays
- Maximum liability is limited to declared cargo value
- Force majeure events are excluded from liability
- Insurance claims must be filed within 7 days of delivery

4. CUSTOMS & POLICE DETENTION
- Client is responsible for all customs duties and taxes
- Detention due to documentation issues is client's responsibility
- Fines for non-compliance are borne by the responsible party
- PakLoad will cooperate with authorities as required by law

5. DISPUTE RESOLUTION
- Disputes to be resolved through arbitration
- Jurisdiction: Courts of Pakistan
- Governing law: Laws of Islamic Republic of Pakistan
    `,
    version: '1.0',
    language: 'en',
    effectiveFrom: new Date('2024-01-01'),
    mandatory: true,
    displayOrder: 2,
  },
  {
    termType: 'disclaimer',
    title: 'Customs & Police Detention Notice',
    content: `
CUSTOMS & LAW ENFORCEMENT NOTICE

IMPORTANT: Please read carefully before shipping.

1. CUSTOMS INSPECTION
- All cross-border shipments are subject to customs inspection
- Delays may occur due to random inspections
- Proper documentation reduces inspection time

2. POLICE CHECKPOINTS
- Vehicles may be stopped at police checkpoints
- Driver must carry all required documents
- Cargo may be inspected for security purposes

3. DETENTION SCENARIOS
a) Documentation Issues
   - Missing or incorrect documents
   - Expired permits or licenses
   - Mismatch between declared and actual cargo

b) Customs Violations
   - Undeclared goods
   - Incorrect valuation
   - Prohibited items

c) Security Concerns
   - Suspicious cargo
   - Intelligence-based checks
   - Random security audits

4. CLIENT OBLIGATIONS DURING DETENTION
- Provide additional documentation as requested
- Pay any applicable fines or duties
- Arrange for cargo clearance
- Bear storage charges during detention

5. PAKLOAD'S ROLE
- We will notify you immediately of any detention
- Provide documentation support where possible
- Coordinate with carrier for resolution
- We are NOT liable for detention-related costs

EMERGENCY CONTACTS:
- Customs Helpline: 0800-CUSTOMS
- FBR Helpline: 051-111-227-227
    `,
    version: '1.0',
    language: 'en',
    effectiveFrom: new Date('2024-01-01'),
    mandatory: true,
    displayOrder: 3,
  },
  {
    termType: 'terms',
    title: 'Computer Generated Receipt Terms',
    content: `
ELECTRONIC RECEIPT TERMS

1. VALIDITY
- Computer-generated receipts are legally valid documents
- Each receipt has a unique verification QR code
- Receipts are stored securely for 7 years

2. RECEIPT TYPES
a) Pickup Receipt - Issued when cargo is collected
b) Transit Receipt - Issued at checkpoints
c) Delivery Receipt - Issued upon final delivery
d) Customs Receipt - Issued after customs clearance

3. INFORMATION INCLUDED
- Unique receipt number
- Date, time, and location
- Cargo description and condition
- Digital signatures (where applicable)
- Photos of cargo condition

4. VERIFICATION
- Scan QR code to verify authenticity
- Contact support for manual verification
- Receipts cannot be altered after generation

5. LEGAL STANDING
- Receipts serve as proof of custody transfer
- Admissible as evidence in disputes
- Compliant with Electronic Transactions Ordinance 2002
    `,
    version: '1.0',
    language: 'en',
    effectiveFrom: new Date('2024-01-01'),
    mandatory: false,
    displayOrder: 4,
  },
  {
    termType: 'disclaimer',
    title: 'Document Visibility & Privacy',
    content: `
DOCUMENT PRIVACY POLICY

1. DOCUMENT HANDLING
- Uploaded documents are encrypted and stored securely
- Documents are only visible to authorized parties
- Verification documents are reviewed by trained staff

2. WHO CAN VIEW DOCUMENTS
- Platform administrators (for verification)
- Relevant party in a transaction (limited view)
- Law enforcement (upon valid legal request)

3. DOCUMENTS NOT SHOWN TO OTHER USERS
- NIC/CNIC copies
- Driving license details
- Bank account information
- Personal addresses (exact location)
- Company registration numbers (full)

4. VISIBLE INFORMATION
- Verification status (verified/pending)
- Company name
- General location (city level)
- Rating and reviews
- Service history summary

5. DATA RETENTION
- Active documents: Retained while account is active
- Expired documents: Deleted after 90 days
- Account deletion: All documents deleted within 30 days

6. YOUR RIGHTS
- Request document deletion
- Update documents anytime
- Download your data
- Restrict document sharing
    `,
    version: '1.0',
    language: 'en',
    effectiveFrom: new Date('2024-01-01'),
    mandatory: true,
    displayOrder: 5,
  },
];

// Prohibited Items List
const prohibitedItemsData = [
  { category: 'Narcotics', itemName: 'Illegal Drugs', description: 'All controlled substances including heroin, cocaine, cannabis, etc.', legalReference: 'Control of Narcotic Substances Act 1997', penalty: 'Imprisonment up to death penalty' },
  { category: 'Narcotics', itemName: 'Drug Precursors', description: 'Chemicals used in drug manufacturing', legalReference: 'Control of Narcotic Substances Act 1997', penalty: 'Imprisonment up to 14 years' },
  { category: 'Weapons', itemName: 'Firearms', description: 'Guns, rifles, pistols without valid transport permit', legalReference: 'Pakistan Arms Ordinance 1965', penalty: 'Imprisonment up to 7 years' },
  { category: 'Weapons', itemName: 'Explosives', description: 'Bombs, grenades, explosive materials', legalReference: 'Explosive Substances Act 1908', penalty: 'Imprisonment up to life' },
  { category: 'Weapons', itemName: 'Ammunition', description: 'Bullets, cartridges without permit', legalReference: 'Pakistan Arms Ordinance 1965', penalty: 'Imprisonment up to 3 years' },
  { category: 'Contraband', itemName: 'Counterfeit Currency', description: 'Fake currency notes', legalReference: 'Pakistan Penal Code Section 489', penalty: 'Imprisonment up to life' },
  { category: 'Contraband', itemName: 'Smuggled Goods', description: 'Items evading customs duties', legalReference: 'Customs Act 1969', penalty: 'Fine and imprisonment' },
  { category: 'Contraband', itemName: 'Stolen Property', description: 'Goods obtained through theft', legalReference: 'Pakistan Penal Code Section 411', penalty: 'Imprisonment up to 7 years' },
  { category: 'Hazardous', itemName: 'Radioactive Materials', description: 'Nuclear materials without authorization', legalReference: 'Pakistan Nuclear Regulatory Authority Ordinance 2001', penalty: 'Imprisonment up to 10 years' },
  { category: 'Hazardous', itemName: 'Toxic Chemicals', description: 'Poisonous substances without proper permits', legalReference: 'Pakistan Environmental Protection Act 1997', penalty: 'Fine and imprisonment' },
  { category: 'Restricted', itemName: 'Alcohol', description: 'Alcoholic beverages (for Muslims/dry areas)', legalReference: 'Prohibition (Enforcement of Hadd) Order 1979', penalty: 'Imprisonment and lashing' },
  { category: 'Restricted', itemName: 'Wildlife Products', description: 'Endangered species, ivory, exotic animals', legalReference: 'Pakistan Trade Control of Wild Fauna and Flora Act 2012', penalty: 'Fine up to Rs. 1 million' },
  { category: 'Restricted', itemName: 'Antiquities', description: 'Historical artifacts without export permit', legalReference: 'Antiquities Act 1975', penalty: 'Imprisonment up to 5 years' },
  { category: 'Restricted', itemName: 'Currency', description: 'Cash exceeding Rs. 10,000 without declaration', legalReference: 'Foreign Exchange Regulation Act 1947', penalty: 'Confiscation and fine' },
];

export async function seedReferenceData() {
  console.log('🌱 Seeding reference data...');
  
  try {
    // Seed TIR Countries
    console.log('  → Seeding TIR countries...');
    for (const country of tirCountriesData) {
      await db.insert(tirCountries).values(country).onConflictDoNothing();
    }
    console.log(`  ✓ Seeded ${tirCountriesData.length} TIR countries`);
    
    // Seed Pakistan Routes
    console.log('  → Seeding Pakistan routes...');
    for (const route of pakistanRoutesData) {
      await db.insert(pakistanRoutes).values(route).onConflictDoNothing();
    }
    console.log(`  ✓ Seeded ${pakistanRoutesData.length} Pakistan routes`);
    
    // Seed Legal Terms
    console.log('  → Seeding legal terms...');
    for (const term of legalTermsData) {
      await db.insert(legalTerms).values(term).onConflictDoNothing();
    }
    console.log(`  ✓ Seeded ${legalTermsData.length} legal terms`);
    
    // Seed Prohibited Items
    console.log('  → Seeding prohibited items...');
    for (const item of prohibitedItemsData) {
      await db.insert(prohibitedItems).values(item).onConflictDoNothing();
    }
    console.log(`  ✓ Seeded ${prohibitedItemsData.length} prohibited items`);
    
    console.log('✅ Reference data seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding reference data:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedReferenceData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
