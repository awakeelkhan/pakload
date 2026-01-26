import { db } from '../db/index.js';
import { loadMedia, loads } from '../db/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';

export class LoadMediaRepository {
  // Add media to a load
  async create(data: {
    loadId: number;
    mediaType: 'image' | 'video' | 'document';
    mediaUrl: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    caption?: string;
    displayOrder?: number;
    uploadedBy: number;
  }) {
    const result = await db.insert(loadMedia).values({
      loadId: data.loadId,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
      thumbnailUrl: data.thumbnailUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      caption: data.caption,
      displayOrder: data.displayOrder || 0,
      uploadedBy: data.uploadedBy,
    }).returning();
    
    return result[0];
  }

  // Add multiple media items
  async createMany(items: Array<{
    loadId: number;
    mediaType: 'image' | 'video' | 'document';
    mediaUrl: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    caption?: string;
    displayOrder?: number;
    uploadedBy: number;
  }>) {
    if (items.length === 0) return [];
    
    const result = await db.insert(loadMedia).values(items).returning();
    return result;
  }

  // Get all media for a load
  async findByLoadId(loadId: number) {
    return await db.select()
      .from(loadMedia)
      .where(eq(loadMedia.loadId, loadId))
      .orderBy(asc(loadMedia.displayOrder), desc(loadMedia.createdAt));
  }

  // Get media by type for a load
  async findByLoadIdAndType(loadId: number, mediaType: string) {
    return await db.select()
      .from(loadMedia)
      .where(
        and(
          eq(loadMedia.loadId, loadId),
          eq(loadMedia.mediaType, mediaType)
        )
      )
      .orderBy(asc(loadMedia.displayOrder));
  }

  // Get images for a load
  async getImages(loadId: number) {
    return this.findByLoadIdAndType(loadId, 'image');
  }

  // Get videos for a load
  async getVideos(loadId: number) {
    return this.findByLoadIdAndType(loadId, 'video');
  }

  // Get documents for a load
  async getDocuments(loadId: number) {
    return this.findByLoadIdAndType(loadId, 'document');
  }

  // Find by ID
  async findById(id: number) {
    const result = await db.select()
      .from(loadMedia)
      .where(eq(loadMedia.id, id));
    return result[0] || null;
  }

  // Update media
  async update(id: number, data: Partial<{
    caption: string;
    displayOrder: number;
    thumbnailUrl: string;
  }>) {
    const result = await db.update(loadMedia)
      .set(data)
      .where(eq(loadMedia.id, id))
      .returning();
    return result[0] || null;
  }

  // Delete media
  async delete(id: number) {
    await db.delete(loadMedia).where(eq(loadMedia.id, id));
  }

  // Delete all media for a load
  async deleteByLoadId(loadId: number) {
    await db.delete(loadMedia).where(eq(loadMedia.loadId, loadId));
  }

  // Reorder media
  async reorder(loadId: number, mediaIds: number[]) {
    for (let i = 0; i < mediaIds.length; i++) {
      await db.update(loadMedia)
        .set({ displayOrder: i })
        .where(
          and(
            eq(loadMedia.id, mediaIds[i]),
            eq(loadMedia.loadId, loadId)
          )
        );
    }
  }

  // Get media count for a load
  async getCount(loadId: number) {
    const media = await this.findByLoadId(loadId);
    return {
      total: media.length,
      images: media.filter(m => m.mediaType === 'image').length,
      videos: media.filter(m => m.mediaType === 'video').length,
      documents: media.filter(m => m.mediaType === 'document').length,
    };
  }
}

export const loadMediaRepo = new LoadMediaRepository();
