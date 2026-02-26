import { NextRequest, NextResponse } from 'next/server';
import { TriggersService } from '@/lib/triggers-service';
import axios from 'axios';

const WORKFLOW_API_URL = process.env.WORKFLOW_API_URL || 'http://aibot24-workflow.workflow.svc.cluster.local';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event, data, domain } = body;

        if (!event || !data || !domain) {
            // Some Bitrix webhooks might have different structures, but we'll assume standard ones for now
            // or just ignore if not valid for our logic
            return NextResponse.json({ status: 'ignored' });
        }

        console.log(`[Bitrix Webhook] Received event ${event} from ${domain}`);

        // 1. Find active triggers for this event and domain
        const triggers = await TriggersService.listActiveByEvent(domain, event);

        for (const trigger of triggers) {
            // 2. Evaluate filters
            let matches = true;
            for (const filter of trigger.filtros) {
                const itemValue = data.FIELDS?.[filter.campo] || data[filter.campo];

                if (filter.operador === '==') {
                    if (itemValue != filter.valor) matches = false;
                } else if (filter.operador === '!=') {
                    if (itemValue == filter.valor) matches = false;
                }
                // Add more operators as needed
            }

            if (matches) {
                console.log(`[Bitrix Webhook] Trigger '${trigger.nombre}' matched! Starting workflow...`);

                // 3. Call Workflow Worker to schedule the notification
                try {
                    const userId = data.ID || data.FIELDS?.ID || 'default_user';
                    const chatId = `chat${userId}`; // Simplified chat identification for now

                    await axios.post(`${WORKFLOW_API_URL}/reminders`, {
                        tenant_id: domain,
                        chat_id: chatId,
                        template_key: trigger.plantillaKey,
                        variables: {
                            ...data.FIELDS,
                            name: data.FIELDS?.NAME || data.NAME || 'Cliente'
                        },
                        scheduled_for: new Date(Date.now() + trigger.delaySegundos * 1000).toISOString(),
                        user_id: userId
                    });
                } catch (workflowError: any) {
                    console.error(`[Bitrix Webhook] Error calling workflow for trigger ${trigger.id}:`, workflowError.message);
                }
            }
        }

        return NextResponse.json({ status: 'processed' });
    } catch (error: any) {
        console.error('[Bitrix Webhook] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
