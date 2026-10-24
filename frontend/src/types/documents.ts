/**
 * TrustVault Document Enclave & Access Controls - TypeScript Type Definitions
 */

export type DocumentCategory =
  | "Business"
  | "Finance"
  | "Legal"
  | "Technical"
  | "Personal"
  | "Other";

export type DocumentFileType = "PDF" | "Word" | "Excel" | "Text" | "Other";

export type SecurityClearanceLevel =
  | "TOP_SECRET"
  | "SECRET"
  | "CONFIDENTIAL"
  | "RESTRICTED"
  | "INTERNAL";

export interface DocumentRecord {
  id: number | string;
  name: string;
  category: DocumentCategory;
  type?: DocumentFileType;
  size?: string;
  owner: string;
  updated?: string;
  createdAt?: string;
  sha256Hash?: string;
  downloads?: number;
  views?: number;
  deleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export type PermissionLevel = "View only" | "View + Download";

export interface DocumentPermissionRecord {
  id: number | string;
  documentId: number | string;
  document: string;
  viewer: string;
  access: PermissionLevel;
  expires?: string;
  grantedAt?: string;
}

export interface AccessRequestRecord {
  id: number | string;
  documentId: number | string;
  document: string;
  viewer: string;
  requested: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface ActivityHistoryRecord {
  id: number | string;
  type: "upload" | "grant" | "revoke" | "view" | "download" | "delete" | "restore";
  title: string;
  timestamp: string;
  actor?: string;
  target?: string;
  details?: string;
}

export interface DocumentUploadForm {
  name: string;
  category: DocumentCategory;
  type: DocumentFileType;
  file: File | null;
}
