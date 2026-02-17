import { Router } from 'express';
import { db } from '../db/index.js';
import { userDocuments, companyProfiles, driverProfiles, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { notificationService } from '../repositories/notificationRepository.js';

const router = Router();

// Get user's documents
router.get('/my-documents', requireAuth, async (req, res) => {
  try {
    const documents = await db.select().from(userDocuments).where(eq(userDocuments.userId, req.user!.id));
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload a document
router.post('/upload', requireAuth, async (req, res) => {
  try {
    const { documentType, documentNumber, documentUrl, issueDate, expiryDate, issuingAuthority } = req.body;
    
    const [newDoc] = await db.insert(userDocuments).values({
      userId: req.user!.id,
      documentType,
      documentNumber,
      documentUrl,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      issuingAuthority,
      status: 'pending',
    }).returning();
    
    // Notify all admins about the new document
    const userName = `${req.user!.firstName} ${req.user!.lastName}`.trim() || req.user!.email;
    const docTypeName = documentType?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Document';
    
    try {
      await notificationService.notifyAllAdmins(
        'New Document Submitted',
        `${userName} has submitted a ${docTypeName} for verification.`,
        '/admin/verification',
        { userId: req.user!.id, documentType, documentId: newDoc.id }
      );
    } catch (notifyError) {
      console.error('Error sending admin notification:', notifyError);
      // Don't fail the request if notification fails
    }
    
    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Admin: Verify a document
router.patch('/:id/verify', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const [updated] = await db.update(userDocuments)
      .set({
        status,
        verifiedBy: req.user!.id,
        verifiedAt: new Date(),
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        updatedAt: new Date(),
      })
      .where(eq(userDocuments.id, parseInt(req.params.id)))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
});

// Get company profile
router.get('/company-profile', requireAuth, async (req, res) => {
  try {
    const [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, req.user!.id));
    res.json(profile || null);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// Create/Update company profile
router.post('/company-profile', requireAuth, async (req, res) => {
  try {
    const existing = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, req.user!.id));
    
    const profileData = {
      userId: req.user!.id,
      companyName: req.body.companyName,
      registrationNumber: req.body.registrationNumber,
      ntnNumber: req.body.ntnNumber,
      address: req.body.address,
      city: req.body.city,
      province: req.body.province,
      country: req.body.country || 'Pakistan',
      postalCode: req.body.postalCode,
      latitude: req.body.latitude?.toString(),
      longitude: req.body.longitude?.toString(),
      officePicture: req.body.officePicture,
      officePhotos: req.body.officePhotos,
      contactPerson: req.body.contactPerson,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail,
      website: req.body.website,
    };
    
    let result;
    if (existing.length > 0) {
      [result] = await db.update(companyProfiles)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(companyProfiles.userId, req.user!.id))
        .returning();
    } else {
      [result] = await db.insert(companyProfiles).values(profileData).returning();
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error saving company profile:', error);
    res.status(500).json({ error: 'Failed to save company profile' });
  }
});

// Get driver profile
router.get('/driver-profile', requireAuth, async (req, res) => {
  try {
    const [profile] = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, req.user!.id));
    res.json(profile || null);
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    res.status(500).json({ error: 'Failed to fetch driver profile' });
  }
});

// Create/Update driver profile
router.post('/driver-profile', requireAuth, async (req, res) => {
  try {
    const existing = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, req.user!.id));
    
    const profileData = {
      userId: req.user!.id,
      carrierId: req.body.carrierId,
      licenseNumber: req.body.licenseNumber,
      licenseType: req.body.licenseType,
      licenseExpiry: new Date(req.body.licenseExpiry),
      nicNumber: req.body.nicNumber,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
      bloodGroup: req.body.bloodGroup,
      emergencyContact: req.body.emergencyContact,
      emergencyContactName: req.body.emergencyContactName,
      yearsExperience: req.body.yearsExperience,
    };
    
    let result;
    if (existing.length > 0) {
      [result] = await db.update(driverProfiles)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(driverProfiles.userId, req.user!.id))
        .returning();
    } else {
      [result] = await db.insert(driverProfiles).values(profileData).returning();
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error saving driver profile:', error);
    res.status(500).json({ error: 'Failed to save driver profile' });
  }
});

// Admin: Get all documents for a specific user (carrier verification)
router.get('/user/:userId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const documents = await db.select().from(userDocuments).where(eq(userDocuments.userId, userId));
    res.json(documents);
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({ error: 'Failed to fetch user documents' });
  }
});

// Admin: Get all pending documents for verification
router.get('/pending', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const documents = await db.select().from(userDocuments).where(eq(userDocuments.status, 'pending'));
    res.json(documents);
  } catch (error) {
    console.error('Error fetching pending documents:', error);
    res.status(500).json({ error: 'Failed to fetch pending documents' });
  }
});

// Admin: Get all documents (for admin dashboard)
router.get('/all', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    // Join with users table to get user info
    const documents = await db
      .select({
        id: userDocuments.id,
        userId: userDocuments.userId,
        documentType: userDocuments.documentType,
        documentNumber: userDocuments.documentNumber,
        documentUrl: userDocuments.documentUrl,
        status: userDocuments.status,
        issueDate: userDocuments.issueDate,
        expiryDate: userDocuments.expiryDate,
        issuingAuthority: userDocuments.issuingAuthority,
        verifiedBy: userDocuments.verifiedBy,
        verifiedAt: userDocuments.verifiedAt,
        rejectionReason: userDocuments.rejectionReason,
        createdAt: userDocuments.createdAt,
        updatedAt: userDocuments.updatedAt,
        userName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userRole: users.role,
      })
      .from(userDocuments)
      .leftJoin(users, eq(userDocuments.userId, users.id));
    
    // Transform to include full userName
    const transformedDocs = documents.map(doc => ({
      ...doc,
      userName: `${doc.userName || ''} ${doc.userLastName || ''}`.trim() || `User #${doc.userId}`,
    }));
    
    res.json(transformedDocs);
  } catch (error) {
    console.error('Error fetching all documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get a specific document by ID (for viewing/downloading)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const [document] = await db.select().from(userDocuments).where(eq(userDocuments.id, docId));
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Allow access if admin or document owner
    if (req.user!.role !== 'admin' && document.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Required documents by role
router.get('/required-documents/:role', (req, res) => {
  const requiredDocs: Record<string, string[]> = {
    carrier: [
      'company_registration',
      'nic_copy',
      'tax_certificate',
      'insurance_certificate',
    ],
    driver: [
      'nic_copy',
      'driving_license_htv',
    ],
    shipper: [
      'company_registration',
      'nic_copy',
      'tax_certificate',
    ],
    broker: [
      'company_registration',
      'nic_copy',
      'tax_certificate',
    ],
  };
  
  const role = req.params.role.toLowerCase();
  res.json({
    role,
    requiredDocuments: requiredDocs[role] || [],
  });
});

export default router;
