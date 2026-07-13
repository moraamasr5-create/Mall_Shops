export default function HomePage() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 720 }}>
      <h1>Mall Shops</h1>
      <p>Multi-tenant multi-module Business Operating Platform.</p>
      <p>
        Vertical Slice 1 API is available under <code>/api/v1</code>.
      </p>
      <ul>
        <li>
          <code>POST /api/v1/tenants</code> — create tenant + OWNER membership + salon
          activation
        </li>
        <li>
          <code>GET /api/v1/tenants</code> — list tenants for identity
        </li>
        <li>
          <code>GET /api/v1/tenants/:id/members</code> — list members
        </li>
        <li>
          <code>GET /api/v1/tenants/:id/modules</code> — list TenantModule activations
        </li>
        <li>
          <code>GET|POST /api/v1/salon/services</code> — Salon reference module path
        </li>
      </ul>
      <p>
        Auth: <code>Authorization: Bearer &lt;supabase-jwt&gt;</code>
        <br />
        Tenant: <code>X-Tenant-Id: &lt;tenant-id&gt;</code>
      </p>
    </main>
  );
}
