/**
 * TrustVault Administrator & Security Audit - TypeScript Type Definitions
 */

import type { UserRole, AccountStatus } from "./trustvault";

export interface PendingUserApproval {
  id: number | string;
  email: string;
  fullName?: string;
  userCode: string;
  role: string;
  status: AccountStatus;
  registeredAt?: string;
}

export interface SystemAuditLog {
  id: number | string;
  action: string;
  userEmail: string;
  userCode?: string;
  role: string;
  details: string;
  severity: "INFO" | "WARNING" | "DANGER" | "SUCCESS";
  timestamp: string;
}

export interface OwnerDocumentHistory {
  ownerEmail: string;
  uploads: Array<{
    id: number | string;
    name: string;
    category: string;
    uploadedAt: string;
    downloads: number;
  }>;
  deletions: Array<{
    id: number | string;
    name: string;
    category: string;
    deletedAt: string;
    deletedBy: string;
  }>;
  grantedPermissions: Array<{
    id: number | string;
    document: string;
    viewer: string;
    access: string;
    expires: string;
  }>;
}

export interface SecurityEnclaveMetrics {
  totalUsers: number;
  activeDocuments: number;
  pendingApprovals: number;
  activePermissions: number;
  totalAuditEvents: number;
}
