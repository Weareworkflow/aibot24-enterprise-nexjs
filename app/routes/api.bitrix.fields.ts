import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { callBitrixMethod } from "@/lib/bitrix-service";

const ENTITY_MAP: Record<string, string> = {
    leads: "lead",
    contacts: "contact",
    deals: "deal",
    companies: "company",
};

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenantId");
    const entity = url.searchParams.get("entity") || "leads";

    if (!tenantId) {
        return json({ error: "Missing tenantId" }, { status: 400 });
    }

    const bitrixEntity = ENTITY_MAP[entity];
    if (!bitrixEntity) {
        return json({ error: "Invalid entity type" }, { status: 400 });
    }

    try {
        const method = `crm.${bitrixEntity}.userfield.list`;
        const result = await callBitrixMethod(tenantId, method, {
            order: { SORT: "ASC" },
            filter: {}
        });

        if (result.error) {
            throw new Error(result.error_description || result.error);
        }

        // Map to a cleaner format
        const fields = (result.result || []).map((f: any) => ({
            id: f.ID,
            code: f.FIELD_NAME,
            label: f.EDIT_FORM_LABEL?.es || f.LIST_COLUMN_LABEL?.es || f.FIELD_NAME,
            type: f.USER_TYPE_ID,
            mandatory: f.MANDATORY === "Y",
        }));

        return json(fields);
    } catch (error: any) {
        console.error(`[Bitrix Fields GET] Error for ${entity}:`, error);
        return json({ error: error.message }, { status: 500 });
    }
}

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
        const { tenantId, entity, label, type } = body;

        if (!tenantId || !entity || !label || !type) {
            return json({ error: "Missing required fields" }, { status: 400 });
        }

        const bitrixEntity = ENTITY_MAP[entity];
        if (!bitrixEntity) {
            return json({ error: "Invalid entity type" }, { status: 400 });
        }

        // Generate a simple code based on label
        const codeSuffix = label.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "");
        const fieldName = `UF_CRM_${codeSuffix.substring(0, 15)}`;

        const method = `crm.${bitrixEntity}.userfield.add`;
        const result = await callBitrixMethod(tenantId, method, {
            fields: {
                FIELD_NAME: fieldName,
                USER_TYPE_ID: type, // string, double, boolean, datetime, enumeration, etc.
                XML_ID: fieldName,
                SORT: 100,
                MULTIPLE: "N",
                MANDATORY: "N",
                SHOW_FILTER: "Y",
                SHOW_IN_LIST: "Y",
                EDIT_FORM_LABEL: { es: label, en: label },
                LIST_COLUMN_LABEL: { es: label, en: label },
                LIST_FILTER_LABEL: { es: label, en: label },
                ERROR_MESSAGE: { es: "Error en el campo", en: "Field error" },
                HELP_MESSAGE: { es: label, en: label },
            }
        });

        if (result.error) {
            throw new Error(result.error_description || result.error);
        }

        return json({ success: true, id: result.result, fieldName });
    } catch (error: any) {
        console.error("[Bitrix Fields POST] Error:", error);
        return json({ error: error.message }, { status: 500 });
    }
}
