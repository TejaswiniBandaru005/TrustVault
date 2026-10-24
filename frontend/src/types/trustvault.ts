/**
 * TrustVault Zero-Trust Document Enclave - TypeScript Type Definitions
 */

export type UserRole = "ADMIN" | "OWNER" | "VIEWER";
export type AccountStatus = "ACTIVE" | "APPROVED" | "PENDING_APPROVAL" | "REVOKED";

export interface TrustVaultUser {
  id?: number;
  userCode: string;
  email: string;
  name?: string;
  role: UserRole;
  status: AccountStatus;
  department?: string;
  createdAt?: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  isPreview?: boolean;
  isPendingApproval?: boolean;
}

export type SecurityClearance = "CONFIDENTIAL" | "SECRET" | "TOP_SECRET" | "RESTRICTED" | "INTERNAL";

export interface VaultDocument {
  id: number;
  title: string;
  description?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  sha256Hash: string;
  clearanceLevel?: SecurityClearance;
  ownerId: number;
  ownerCode?: string;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  accessStatus?: "GRANTED" | "PENDING" | "REVOKED" | "NONE";
}

export type PermissionStatus = "PENDING" | "GRANTED" | "REVOKED";

export interface AccessPermission {
  id: number;
  documentId: number;
  documentTitle?: string;
  userId: number;
  userEmail: string;
  userCode: string;
  status: PermissionStatus;
  requestedAt: string;
  grantedAt?: string;
  expiresAt?: string;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  targetResource: string;
  userEmail: string;
  role: string;
  timestamp: string;
  status: "SUCCESS" | "FAILURE" | "BLOCKED" | "INFO";
  details?: string;
}

export type ThemePaletteId = "cobalt" | "emerald" | "violet" | "amber" | "crimson" | "cyan";

export interface ThemePalette {
  id: ThemePaletteId;
  name: string;
  tagline: string;
  primary: string;
  primaryHover: string;
  accentSoft: string;
  gradient: string;
  glow: string;
  dotColor: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
