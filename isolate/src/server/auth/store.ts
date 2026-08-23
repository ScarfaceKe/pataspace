import type { AccountStatus, ProductionAccountType, PublicRegistrationRoleId } from '@/domain/auth';
import type { UserRoleId } from '@/domain/types';
import { query, transaction } from '@/server/database/client';


export interface StoredSession {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
}

export interface PasswordResetRecord {
  tokenHash: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

export interface StoredAuthUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: UserRoleId;
  status: AccountStatus;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  sessions: StoredSession[];
  passwordResets: PasswordResetRecord[];
  county?: string;
  profilePhoto?: string;
  accountType?: ProductionAccountType;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
}

export interface AuthStoreData {
  users: StoredAuthUser[];
}

type UserRow = {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  role_id: UserRoleId;
  status: AccountStatus;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  failed_login_attempts: number;
  locked_until: Date | null;
  last_login_at: Date | null;
  email_verified_at: Date | null;
  county_name: string | null;
  profile_photo_url: string | null;
  account_type_id: ProductionAccountType | null;
};

type SessionRow = { id: string; user_id: string; token_hash: string; created_at: Date; expires_at: Date; revoked_at: Date | null };
type ResetRow = { token_hash: string; user_id: string; created_at: Date; expires_at: Date; used_at: Date | null };

function iso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

export function accountTypeForRole(role: UserRoleId): ProductionAccountType {
  if (role === 'customer') return 'customer-tenant';
  if (role === 'property-owner') return 'property-owner';
  if (role === 'property-manager') return 'property-manager';
  if (role === 'leasing-agent') return 'leasing-agent';
  return 'administrator';
}

export async function readAuthStore(): Promise<AuthStoreData> {
  const [usersResult, sessionsResult, resetsResult] = await Promise.all([
    query<UserRow>(`select u.*, p.county_name, p.profile_photo_url, p.account_type_id
      from users u left join user_profiles p on p.user_id = u.id
      where u.deleted_at is null order by u.created_at asc`),
    query<SessionRow>('select * from sessions order by created_at asc'),
    query<ResetRow>('select * from password_resets order by created_at asc')
  ]);
  const sessionsByUser = new Map<string, StoredSession[]>();
  for (const row of sessionsResult.rows) {
    const item: StoredSession = { id: row.id, userId: row.user_id, tokenHash: row.token_hash, createdAt: row.created_at.toISOString(), expiresAt: row.expires_at.toISOString(), revokedAt: iso(row.revoked_at) };
    sessionsByUser.set(row.user_id, [...(sessionsByUser.get(row.user_id) ?? []), item]);
  }
  const resetsByUser = new Map<string, PasswordResetRecord[]>();
  for (const row of resetsResult.rows) {
    const item: PasswordResetRecord = { tokenHash: row.token_hash, userId: row.user_id, createdAt: row.created_at.toISOString(), expiresAt: row.expires_at.toISOString(), usedAt: iso(row.used_at) };
    resetsByUser.set(row.user_id, [...(resetsByUser.get(row.user_id) ?? []), item]);
  }
  return {
    users: usersResult.rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      phoneNumber: row.phone_number,
      email: row.email,
      role: row.role_id,
      status: row.status,
      passwordHash: row.password_hash,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      failedLoginAttempts: row.failed_login_attempts,
      lockedUntil: iso(row.locked_until),
      sessions: sessionsByUser.get(row.id) ?? [],
      passwordResets: resetsByUser.get(row.id) ?? [],
      county: row.county_name ?? undefined,
      profilePhoto: row.profile_photo_url ?? undefined,
      accountType: row.account_type_id ?? accountTypeForRole(row.role_id),
      lastLoginAt: iso(row.last_login_at),
      emailVerifiedAt: iso(row.email_verified_at)
    }))
  };
}

export async function writeAuthStore(data: AuthStoreData): Promise<void> {
  await transaction(async (client) => {
    for (const user of data.users) {
      await client.query(
        `insert into users (id, full_name, phone_number, email, role_id, status, password_hash, created_at, updated_at, failed_login_attempts, locked_until, last_login_at, email_verified_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         on conflict (id) do update set full_name=excluded.full_name, phone_number=excluded.phone_number, email=excluded.email, role_id=excluded.role_id, status=excluded.status, password_hash=excluded.password_hash, updated_at=excluded.updated_at, failed_login_attempts=excluded.failed_login_attempts, locked_until=excluded.locked_until, last_login_at=excluded.last_login_at, email_verified_at=excluded.email_verified_at`,
        [user.id, user.fullName, user.phoneNumber, user.email, user.role, user.status, user.passwordHash, user.createdAt, user.updatedAt, user.failedLoginAttempts, user.lockedUntil ?? null, user.lastLoginAt ?? null, user.emailVerifiedAt ?? null]
      );
      await client.query(
        `insert into user_profiles (user_id, county_name, profile_photo_url, account_type_id, created_at, updated_at)
         values ($1,$2,$3,$4,now(),now())
         on conflict (user_id) do update set county_name=excluded.county_name, profile_photo_url=excluded.profile_photo_url, account_type_id=excluded.account_type_id, updated_at=now()`,
        [user.id, user.county ?? null, user.profilePhoto ?? null, user.accountType ?? accountTypeForRole(user.role)]
      );
      for (const session of user.sessions) {
        await client.query(
          `insert into sessions (id, user_id, token_hash, created_at, expires_at, revoked_at)
           values ($1,$2,$3,$4,$5,$6)
           on conflict (id) do update set token_hash=excluded.token_hash, expires_at=excluded.expires_at, revoked_at=excluded.revoked_at`,
          [session.id, user.id, session.tokenHash, session.createdAt, session.expiresAt, session.revokedAt ?? null]
        );
      }
      for (const reset of user.passwordResets) {
        await client.query(
          `insert into password_resets (user_id, token_hash, created_at, expires_at, used_at)
           values ($1,$2,$3,$4,$5)
           on conflict do nothing`,
          [user.id, reset.tokenHash, reset.createdAt, reset.expiresAt, reset.usedAt ?? null]
        );
      }
    }
  });
}

export function findUserByEmail(data: AuthStoreData, email: string): StoredAuthUser | undefined {
  return data.users.find((user) => user.email === email);
}

export function publicRoleToStoredRole(role: PublicRegistrationRoleId): UserRoleId {
  return role;
}
