import { getDb } from './mongodb';
import { WorkflowTrigger } from './types';

export class TriggersService {
    private static COLLECTION = 'workflow_triggers';

    static async listByTenant(tenantId: string): Promise<WorkflowTrigger[]> {
        const db = await getDb();
        return db.collection(this.COLLECTION)
            .find({ tenantId })
            .sort({ createdAt: -1 })
            .toArray() as unknown as WorkflowTrigger[];
    }

    static async listActiveByEvent(tenantId: string, event: string): Promise<WorkflowTrigger[]> {
        const db = await getDb();
        return db.collection(this.COLLECTION)
            .find({ tenantId, evento: event, activo: true })
            .toArray() as unknown as WorkflowTrigger[];
    }

    static async getById(id: string): Promise<WorkflowTrigger | null> {
        const db = await getDb();
        return db.collection(this.COLLECTION).findOne({ id }) as unknown as WorkflowTrigger | null;
    }

    static async create(data: Omit<WorkflowTrigger, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const db = await getDb();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        const trigger: WorkflowTrigger = {
            ...data,
            id,
            createdAt: now,
            updatedAt: now
        };

        await db.collection(this.COLLECTION).insertOne(trigger);
        return id;
    }

    static async update(id: string, updates: Partial<WorkflowTrigger>): Promise<boolean> {
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

    static async delete(id: string): Promise<boolean> {
        const db = await getDb();
        const result = await db.collection(this.COLLECTION).deleteOne({ id });
        return result.deletedCount > 0;
    }
}
