import { z } from "zod";

export const AIAgentSchema = z.object({
    id: z.string(),
    tenantId: z.string(),
    name: z.string().min(2),
    type: z.enum(['text']),
    role: z.string(),
    company: z.string(),
    color: z.string(),
    systemPrompt: z.string(),
    isActive: z.boolean(),
    bitrixBotId: z.number(),
    bitrixBotCode: z.string(),
    avatar: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const BitrixInstallationSchema = z.object({
    id: z.string(),
    memberId: z.string(),
    domain: z.string(),
    status: z.enum(['active', 'suspended']),
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    clientSecret: z.string().optional(),
    clientId: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});
