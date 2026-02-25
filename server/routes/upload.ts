import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { paymentProofs, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadDir, 'images');
const documentsDir = path.join(uploadDir, 'documents');

[uploadDir, imagesDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    cb(null, isImage || isVideo ? imagesDir : documentsDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const allAllowed = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocTypes];
  
  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  }
});

// Extend Express Request to include multer file types
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

// Upload single image
router.post('/image', requireAuth, upload.single('image'), (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/images/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Upload multiple images
router.post('/images', requireAuth, upload.array('images', 10), (req: MulterRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadedFiles = files.map(file => ({
      url: `${baseUrl}/uploads/images/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      files: uploadedFiles,
      urls: uploadedFiles.map(f => f.url)
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Upload single document
router.post('/document', requireAuth, upload.single('document'), (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Upload multiple documents
router.post('/documents', requireAuth, upload.array('documents', 10), (req: MulterRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadedFiles = files.map(file => ({
      url: `${baseUrl}/uploads/documents/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      files: uploadedFiles,
      urls: uploadedFiles.map(f => f.url)
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Payment proof upload
router.post('/payment-proof', requireAuth, upload.single('file'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { transactionRef, type } = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const isImage = req.file.mimetype.startsWith('image/');
    const folder = isImage ? 'images' : 'documents';
    const fileUrl = `${baseUrl}/uploads/${folder}/${req.file.filename}`;

    // Save payment proof to database
    const [newProof] = await db.insert(paymentProofs).values({
      userId: req.user!.id,
      transactionRef: transactionRef || `TXN-${Date.now()}`,
      fileUrl,
      fileName: req.file.originalname,
      status: 'pending',
    }).returning();

    console.log(`Payment proof uploaded by user ${req.user?.id}: ${transactionRef}, ${fileUrl}`);

    // Notify admins about new payment proof
    try {
      const { notificationService } = await import('../repositories/notificationRepository.js');
      await notificationService.notifyAllAdmins(
        'New Payment Proof Uploaded',
        `A user has uploaded payment proof for transaction: ${transactionRef}. Please verify and confirm.`,
        '/admin/payments',
        { userId: req.user?.id, transactionRef, fileUrl, proofId: newProof.id }
      );
    } catch (notifError) {
      console.error('Error sending payment proof notification:', notifError);
    }

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      transactionRef,
      proofId: newProof.id,
      message: 'Payment proof uploaded successfully. Admin will verify shortly.'
    });
  } catch (error: any) {
    console.error('Payment proof upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Admin: Get all payment proofs
router.get('/payment-proofs', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const proofs = await db.select({
      id: paymentProofs.id,
      userId: paymentProofs.userId,
      transactionRef: paymentProofs.transactionRef,
      fileUrl: paymentProofs.fileUrl,
      fileName: paymentProofs.fileName,
      status: paymentProofs.status,
      verifiedBy: paymentProofs.verifiedBy,
      verifiedAt: paymentProofs.verifiedAt,
      notes: paymentProofs.notes,
      createdAt: paymentProofs.createdAt,
      userName: users.firstName,
      userLastName: users.lastName,
      userEmail: users.email,
    })
    .from(paymentProofs)
    .leftJoin(users, eq(paymentProofs.userId, users.id))
    .orderBy(desc(paymentProofs.createdAt));

    const transformedProofs = proofs.map(p => ({
      ...p,
      userName: `${p.userName || ''} ${p.userLastName || ''}`.trim() || p.userEmail || `User #${p.userId}`,
    }));

    res.json(transformedProofs);
  } catch (error: any) {
    console.error('Error fetching payment proofs:', error);
    res.status(500).json({ error: 'Failed to fetch payment proofs' });
  }
});

// Admin: Verify payment proof
router.post('/payment-proofs/:id/verify', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const proofId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const [updated] = await db.update(paymentProofs)
      .set({
        status: status || 'verified',
        verifiedBy: req.user!.id,
        verifiedAt: new Date(),
        notes,
        updatedAt: new Date(),
      })
      .where(eq(paymentProofs.id, proofId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    console.error('Error verifying payment proof:', error);
    res.status(500).json({ error: 'Failed to verify payment proof' });
  }
});

// Mixed upload (images + documents)
router.post('/mixed', requireAuth, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 5 }
]), (req: MulterRequest, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const result: any = { success: true, images: [], documents: [] };

    if (files && files.images) {
      result.images = files.images.map(file => ({
        url: `${baseUrl}/uploads/images/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
    }

    if (files && files.documents) {
      result.documents = files.documents.map(file => ({
        url: `${baseUrl}/uploads/documents/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
    }

    res.json(result);
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

export default router;
