import { db } from '../firebase.service';
import {
    doc,
    getDoc,
    setDoc,
    query,
    where,
    collection,
    getDocs,
    updateDoc,
} from 'firebase/firestore';

export type DeploymentStatus = 'pending' | 'deploying' | 'deployed' | 'failed';

export interface EmpireBuilder {
    twitterId: string;
    name: string;
    symbol: string;
    imageUrl: string;
    hostSlug: string;
    fid: string;
    createdAt: number;
    updatedAt: number;
    // Deployment tracking fields
    tokenAddress?: string;
    empireAddress?: string;
    deploymentStatus?: DeploymentStatus;
    deploymentTxHash?: string;
}

export type EmpireBuilderInput = Omit<EmpireBuilder, 'twitterId' | 'createdAt' | 'updatedAt' | 'tokenAddress' | 'empireAddress' | 'deploymentStatus' | 'deploymentTxHash'>;

const EMPIRE_BUILDERS_COLLECTION = 'empire_builders';

/**
 * Create or update an EmpireBuilder document
 * Uses twitterId as the document ID
 */
export async function createEmpireBuilder(
    twitterId: string,
    data: EmpireBuilderInput
): Promise<EmpireBuilder> {
    try {
        const docRef = doc(db, EMPIRE_BUILDERS_COLLECTION, twitterId);
        const existingDoc = await getDoc(docRef);

        const now = Date.now();
        const empireBuilderDoc: EmpireBuilder = {
            twitterId,
            name: data.name,
            symbol: data.symbol,
            imageUrl: data.imageUrl,
            hostSlug: data.hostSlug,
            fid: data.fid,
            createdAt: existingDoc.exists() ? existingDoc.data().createdAt : now,
            updatedAt: now,
        };

        await setDoc(docRef, empireBuilderDoc);

        return empireBuilderDoc;
    } catch (error) {
        console.error('Error creating EmpireBuilder:', error);
        throw new Error('Failed to create EmpireBuilder');
    }
}

/**
 * Get an EmpireBuilder document by twitterId
 */
export async function getEmpireBuilder(
    twitterId: string
): Promise<EmpireBuilder | null> {
    try {
        const docRef = doc(db, EMPIRE_BUILDERS_COLLECTION, twitterId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return docSnap.data() as EmpireBuilder;
    } catch (error) {
        console.error('Error getting EmpireBuilder:', error);
        throw new Error('Failed to get EmpireBuilder');
    }
}

/**
 * Get an EmpireBuilder by hostSlug (twitter username)
 */
export async function getEmpireBuilderByHostSlug(
    hostSlug: string
): Promise<EmpireBuilder | null> {
    try {
        const q = query(
            collection(db, EMPIRE_BUILDERS_COLLECTION),
            where('hostSlug', '==', hostSlug)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        return querySnapshot.docs[0].data() as EmpireBuilder;
    } catch (error) {
        console.error('Error getting EmpireBuilder by hostSlug:', error);
        throw new Error('Failed to get EmpireBuilder by hostSlug');
    }
}

/**
 * Update deployment status for an EmpireBuilder
 */
export async function updateDeploymentStatus(
    twitterId: string,
    status: DeploymentStatus,
    txHash?: string
): Promise<void> {
    try {
        const docRef = doc(db, EMPIRE_BUILDERS_COLLECTION, twitterId);
        const updateData: Partial<EmpireBuilder> = {
            deploymentStatus: status,
            updatedAt: Date.now(),
        };
        
        if (txHash) {
            updateData.deploymentTxHash = txHash;
        }
        
        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating deployment status:', error);
        throw new Error('Failed to update deployment status');
    }
}

/**
 * Update EmpireBuilder with deployed token and empire addresses
 */
export async function updateEmpireBuilderDeployment(
    twitterId: string,
    tokenAddress: `0x${string}` | undefined,
    empireAddress: string,
    txHash: string
): Promise<void> {
    try {
        const docRef = doc(db, EMPIRE_BUILDERS_COLLECTION, twitterId);
        await updateDoc(docRef, {
            tokenAddress,
            empireAddress,
            deploymentTxHash: txHash,
            deploymentStatus: 'deployed' as DeploymentStatus,
            updatedAt: Date.now(),
        });
    } catch (error) {
        console.error('Error updating EmpireBuilder deployment:', error);
        throw new Error('Failed to update EmpireBuilder deployment');
    }
}
