# BAS-001 Evidence

**Date (UTC):** 2026-07-16T17:36:30.225Z
**Run ID:** 1784223356496-122787b4
**Base URL:** http://127.0.0.1:3000
**Commit:** 18f1858ad17fc583db60a786cd1ac73d9b86af24
**Owner email:** bas001.owner.1784223356496-122787b4@gmail.com
**Tenant:** BAS-001 Salon 1784223356496-122787b4 (`cmrnsiror000b93s00fvquu55`)
**Isolation:** unique identity + tenant + fresh business data (no reuse)
**Constraints:** Public APIs only · no Service Role · no SQL · no Dashboard
**Overall:** PASS

| Step | HTTP | Summary | requestId | Result |
|------|------|---------|-----------|--------|
| 1 Signup | 201 | email=bas001.owner.1784223356496-122787b4@gmail.com | 7fcce6a6-1c8f-431e-868e-fd655b0f6b4d | PASS |
| 2 Login | 200 | email=bas001.owner.1784223356496-122787b4@gmail.com | e63a6ff0-d350-43a5-a7b5-e9d1cb0967a2 | PASS |
| 3 Create Tenant | 201 | tenantId=cmrnsiror000b93s00fvquu55 | d9a114ba-33e0-4d91-9644-37c93beda50f | PASS |
| 4 Salon auto activation | 200 | salon enabled | b16ffedb-01c7-4b7a-81d7-e3a67cee1e2d | PASS |
| 5a Create Service | 201 | id=cmrnsixle000g93s09q31mwse | a9d90243-f6ad-4ec9-9782-3d3754642386 | PASS |
| 5b GET Service | 200 | id=cmrnsixle000g93s09q31mwse | f060dab3-46a2-4d1f-b129-bb9346af354c | PASS |
| 5c Update Service | 200 | id=cmrnsixle000g93s09q31mwse | 72123e21-5570-4fa7-b42e-72e7efe4b563 | PASS |
| 5d GET Service after update | 200 | id=cmrnsixle000g93s09q31mwse | 8bd86103-7084-400c-a779-82ca7679052c | PASS |
| 6a Create Employee | 201 | id=cmrnsj1y1000h93s0l9ncrub5 | a3d03c49-528a-4e59-a64d-154e36bcd09c | PASS |
| 6b GET Employee | 200 | id=cmrnsj1y1000h93s0l9ncrub5 | 1ec99bbe-3178-4727-8192-58f2d78da8d6 | PASS |
| 6c Update Employee | 200 | id=cmrnsj1y1000h93s0l9ncrub5 | e5090b4a-cfba-4abd-8cf7-a3039fca03b3 | PASS |
| 6d GET Employee after update | 200 | id=cmrnsj1y1000h93s0l9ncrub5 | 00f3bccd-4404-43c0-88c8-ee6e11fcbebb | PASS |
| 7a Create Customer | 201 | id=cmrnsj7vh000i93s02oradpg1 | 742492c4-cc34-4d25-ac22-b85970eb9c6d | PASS |
| 7b GET Customer | 200 | id=cmrnsj7vh000i93s02oradpg1 | ed076721-6b36-4c72-b2d6-5d753ec4138b | PASS |
| 7c Update Customer | 200 | id=cmrnsj7vh000i93s02oradpg1 | bb3f3793-b5d7-4db0-815c-a8e512ad5728 | PASS |
| 7d GET Customer after update | 200 | id=cmrnsj7vh000i93s02oradpg1 | 584ffb7b-8488-4646-858f-821eb06543b8 | PASS |
| 8 Logout | 200 | client discarded access/refresh tokens | n/a | PASS |
| 9 Login again | 200 | email=bas001.owner.1784223356496-122787b4@gmail.com | 742a5a7a-de0f-40aa-81e6-1c2d65130169 | PASS |
| 10 Verify persistence | 200 | service/employee/customer persist after re-login | 05c7b0a0-af05-4388-8d20-5bb616444883 | PASS |
