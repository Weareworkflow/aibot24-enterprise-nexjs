import { getDb } from './mongodb';
import { NotificationTemplate } from './types';

/**
 * AutomationsService
 * Formal CRUD for Notification Templates
 */
export class AutomationsService {
    private static COLLECTION = 'notification_templates';

    /**
     * List templates by tenant
     */
    static async listByTenant(tenantId: string): Promise<NotificationTemplate[]> {
        const db = await getDb();
        return db.collection(this.COLLECTION)
            .find({ tenantId })
            .sort({ createdAt: -1 })
            .toArray() as unknown as NotificationTemplate[];
    }

    /**
     * Get a single template by ID
     */
    static async getById(id: string): Promise<NotificationTemplate | null> {
        const db = await getDb();
        return db.collection(this.COLLECTION).findOne({ id }) as unknown as NotificationTemplate | null;
    }

    /**
     * Get a single template by Key and Tenant
     */
    static async getByKey(tenantId: string, key: string): Promise<NotificationTemplate | null> {
        const db = await getDb();
        return db.collection(this.COLLECTION).findOne({ tenantId, key }) as unknown as NotificationTemplate | null;
    }

    /**
     * Create a new template
     */
    static async create(data: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const db = await getDb();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        const template: NotificationTemplate = {
            ...data,
            id,
            createdAt: now,
            updatedAt: now
        };

        await db.collection(this.COLLECTION).insertOne(template);
        return id;
    }

    /**
     * Update an existing template
     */
    static async update(id: string, updates: Partial<NotificationTemplate>): Promise<boolean> {
        const db = await getDb();
        const { id: _, createdAt, ...validUpdates } = updates;

        const result = await db.collection(this.COLLECTION).updateOne(
            { id },
            {
                $set: {
                    ...validUpdates,
                    updatedAt: new Date().toISOString()
                }
            }
        );

        return result.modifiedCount > 0;
    }

    /**
     * Delete a template
     */
    static async delete(id: string): Promise<boolean> {
        const db = await getDb();
        const result = await db.collection(this.COLLECTION).deleteOne({ id });
        return result.deletedCount > 0;
    }
}
