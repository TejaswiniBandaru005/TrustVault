/**
 * TrustVault Authentication & User Identity - TypeScript Type Definitions
 */

import type { UserRole, AccountStatus } from "./trustvault";

export type RoleParam = "admin" | "owner" | "viewer";

export interface UserIdentity {
  id?: number;
  email: string;
  fullName?: string;
  name?: string;
  userCode: string;
  role: UserRole;
  status: AccountStatus;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: string;
}

export interface OtpRequestPayload {
  email: string;
  password?: string;
  role?: string;
}

export interface OtpResponse {
  requiresOtp?: boolean | string;
  otp?: string;
  emailSent?: string;
  message?: string;
  userCode?: string;
  status?: AccountStatus;
  role?: UserRole;
  fullName?: string;
}

export interface OtpVerificationPayload {
  email: string;
  otp: string;
  role?: string;
}

export interface RegistrationPayload {
  fullName: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
}

export interface RegistrationResponse {
  message: string;
  email: string;
  userCode: string;
  role: string;
  fullName: string;
  status: AccountStatus;
}

export interface RoleResponsibilityItem {
  title: string;
  description: string;
}

export interface RoleDetailInfo {
  roleName: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  icon: any;
  tagline: string;
  summary: string;
  responsibilities: RoleResponsibilityItem[];
  guidelines: string[];
}
