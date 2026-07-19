export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
  errorId?: string;
};

export type ApiSuccess<T> = {
  data: T;
  meta: { requestId: string };
};

export type ApiFailure = {
  error: ApiErrorBody;
  meta: { requestId: string };
};

export class PortalApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: unknown;
  readonly requestId: string | null;
  readonly errorId: string | null;

  constructor(
    message: string,
    opts: {
      code: string;
      status: number;
      details?: unknown;
      requestId?: string | null;
      errorId?: string | null;
    }
  ) {
    super(message);
    this.name = "PortalApiError";
    this.code = opts.code;
    this.status = opts.status;
    this.details = opts.details ?? {};
    this.requestId = opts.requestId ?? null;
    this.errorId = opts.errorId ?? null;
  }
}

export type AuthSessionPayload = {
  identity: { id: string; email: string | null };
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
};

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type CreateTenantResult = {
  tenant: TenantRow;
  membership: { id: string; role: string; tenantId: string };
  tenantModules: Array<{ moduleKey: string; enabled: boolean }>;
};

export type TenantListItem = {
  tenant: TenantRow;
  role: string;
  membershipId: string;
};

export type TenantModuleRow = {
  moduleKey: string;
  enabled: boolean;
  module?: { moduleKey: string; displayName?: string } | null;
};

export type SalonService = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  currency: string;
  active: boolean;
};

export type SalonEmployee = {
  id: string;
  tenantId: string;
  name: string;
  title: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
};

export type SalonCustomer = {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
};

export type SalonVisitServiceLine = {
  id: string;
  tenantId: string;
  visitId: string;
  serviceId: string;
  name: string;
  priceCents: number;
  currency: string;
  durationMin: number;
  sortOrder: number;
};

export type SalonVisit = {
  id: string;
  tenantId: string;
  status: "open" | "closed" | "cancelled";
  customerId: string;
  employeeId: string | null;
  notes: string | null;
  openedAt: string;
  closedAt: string | null;
  services: SalonVisitServiceLine[];
};
