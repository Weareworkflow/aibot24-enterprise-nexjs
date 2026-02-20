
import {
    collection,
    DocumentData,
    Firestore,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import {
    AIAgent,
    BitrixInstallation,
    AppConfig
} from './types';

// Collection Names
export const COLLECTIONS = {
    AGENTS: 'agents',
    INSTALLATIONS: 'installations',
    CONFIG_APP: 'config-app'
} as const;

// Typed Converter Helper
const createConverter = <T extends DocumentData>() => ({
    toFirestore: (data: T) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as T,
});

// Helper to get typed collections
export const getCollections = (db: Firestore) => ({
    agents: collection(db, COLLECTIONS.AGENTS).withConverter(createConverter<AIAgent>()),
    installations: collection(db, COLLECTIONS.INSTALLATIONS).withConverter(createConverter<BitrixInstallation>()),
    appConfig: collection(db, COLLECTIONS.CONFIG_APP).withConverter(createConverter<AppConfig>()),
});
