# ADR-003: Domain-Driven Design Adoption

## Status
**APPROVED**

## Context

Mall Shops supports multiple business domains (Salon, Restaurant, Clinic, Gym) with different business logic. As complexity grows, we need a structure that:
- Makes business logic explicit and testable
- Isolates domain knowledge from infrastructure concerns
- Allows teams to understand and modify business logic independently
- Scales with domain complexity without architectural redesign

Traditional layered architecture (controllers → services → database) conflates business logic with technical concerns and doesn't scale well for multiple domains.

## Decision

We adopt **Domain-Driven Design (DDD)** principles for module organization. Each module follows a four-layer structure:

### Module Structure (DDD Layers)

```
modules/<domain>/
├── domain/                    # Business logic (independent of infrastructure)
│   ├── entities/             # Core business entities
│   ├── value-objects/        # Immutable objects with business meaning
│   ├── aggregates/           # Root aggregates for transactions
│   ├── domain-services/      # Business logic spanning multiple entities
│   └── repositories/         # Interfaces for data access
├── application/              # Use cases and orchestration
│   ├── use-cases/           # Application services (one per use case)
│   ├── dto/                 # Data transfer objects for I/O
│   └── services/            # Application-level orchestration
├── infrastructure/           # Technical implementation details
│   ├── repositories/        # Prisma-based repository implementations
│   ├── mappers/             # Transform between domain and persistence models
│   └── external/            # Third-party service adapters
└── presentation/             # API layer
    ├── controllers/         # HTTP request handlers
    ├── routes/              # Route definitions
    ├── middleware/          # Express middleware
    └── validators/          # Input validation schemas
```

### Layer Responsibilities

#### Domain Layer (Independent)
- **Purpose**: Pure business logic with no dependencies on infrastructure
- **What Lives Here**:
  - Entity definitions (Employee, Service, Appointment)
  - Value Objects (Duration, Price, TimeSlot)
  - Aggregate Roots (Appointment with related Employee and Service)
  - Domain Services (availability checking, scheduling logic)
  - Repository Interfaces (how to fetch/persist data, defined as interfaces)
- **Can Depend On**: Nothing except other domain concepts
- **How to Test**: Unit tests without database, mocks, or frameworks

#### Application Layer
- **Purpose**: Orchestrate domain logic into use cases
- **What Lives Here**:
  - Use Cases / Application Services (CreateAppointment, CancelAppointment)
  - DTOs for input/output
  - Transaction coordination
  - Permission checking
- **Can Depend On**: Domain layer only
- **How to Test**: Unit tests with mocked repositories

#### Infrastructure Layer
- **Purpose**: Implement technical details (database, external services)
- **What Lives Here**:
  - Prisma repository implementations
  - Mappers (transform domain entities ↔ database models)
  - External service adapters
  - Database queries
- **Can Depend On**: Domain layer (implements interfaces)
- **How to Test**: Integration tests with real database

#### Presentation Layer
- **Purpose**: Handle HTTP requests/responses
- **What Lives Here**:
  - Express controllers
  - Route definitions
  - Zod validation schemas
  - Request/response transformers
- **Can Depend On**: Application and Domain layers
- **How to Test**: Integration tests with HTTP client

### Example: Create Appointment Use Case

**Domain Layer** - Business logic:
```typescript
// domain/entities/appointment.ts
class Appointment {
  constructor(
    employee: Employee,
    service: Service,
    startTime: TimeSlot,
    customer: Customer
  ) {
    // Validate business rules: employee must offer service, time must be available
    if (!employee.offerService(service)) {
      throw new ServiceNotOfferedError()
    }
    if (!employee.isAvailable(startTime)) {
      throw new TimeSlotNotAvailableError()
    }
  }
}

// domain/domain-services/availability-checker.ts
class AvailabilityChecker {
  checkEmployeeAvailability(
    employee: Employee,
    timeSlot: TimeSlot
  ): boolean {
    // Business logic for checking availability
  }
}
```

**Application Layer** - Use case:
```typescript
// application/use-cases/create-appointment.ts
class CreateAppointmentUseCase {
  constructor(
    private appointmentRepo: IAppointmentRepository,
    private employeeRepo: IEmployeeRepository,
    private serviceRepo: IServiceRepository,
    private permissionService: PermissionService
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<AppointmentDTO> {
    // Check permissions
    if (!await this.permissionService.canCreate(command.userId)) {
      throw new UnauthorizedError()
    }

    // Load domain entities
    const employee = await this.employeeRepo.findById(command.employeeId)
    const service = await this.serviceRepo.findById(command.serviceId)

    // Create domain entity (triggers business logic validation)
    const appointment = new Appointment(
      employee,
      service,
      TimeSlot.from(command.startTime, command.duration),
      new Customer(command.customerId)
    )

    // Persist
    await this.appointmentRepo.save(appointment)

    return AppointmentMapper.toDTO(appointment)
  }
}
```

**Infrastructure Layer** - Data access:
```typescript
// infrastructure/repositories/appointment-repository.ts
class AppointmentRepository implements IAppointmentRepository {
  async save(appointment: Appointment): Promise<void> {
    const dbModel = AppointmentMapper.toPersistence(appointment)
    await prisma.appointment.create({ data: dbModel })
  }

  async findById(id: string): Promise<Appointment> {
    const dbModel = await prisma.appointment.findUniqueOrThrow({ where: { id } })
    return AppointmentMapper.toDomain(dbModel)
  }
}
```

**Presentation Layer** - HTTP:
```typescript
// presentation/controllers/appointment-controller.ts
export const createAppointment = async (
  req: Request,
  res: Response
) => {
  const validated = CreateAppointmentValidator.parse(req.body)
  
  const useCase = container.get(CreateAppointmentUseCase)
  const result = await useCase.execute({
    userId: req.user.id,
    ...validated
  })

  res.status(201).json(result)
}
```

## Rationale

### Why DDD?

1. **Clear Separation**: Business logic isolated from technical details
2. **Testability**: Domain layer tested without database/framework
3. **Scalability**: Grows cleanly with business complexity
4. **Team Alignment**: Domain language matches business requirements
5. **Maintainability**: Easy to understand where to make changes
6. **Multiple Domains**: Clear pattern to repeat for Salon, Restaurant, etc.

### Why Layers?

- **Domain**: Pure business logic, framework-independent, easily testable
- **Application**: Orchestrates domain to solve use cases
- **Infrastructure**: Technical plumbing (database, APIs, etc.)
- **Presentation**: HTTP concerns isolated from business logic

### Why Interfaces for Repositories?

- Domain layer doesn't know about Prisma
- Repository implementations can be swapped (testing with mocks, production with Prisma)
- Forces explicit data access boundaries

### Why Mappers?

- Domain entities can have different structure than database models
- Prevents domain model from being coupled to database schema
- Protects business logic from schema changes

## Consequences

### Positive
- Business logic is clearly visible and testable
- Multiple domains can evolve independently
- Framework changes don't affect business logic
- Easier to onboard new developers to specific domains
- Natural place for every piece of code
- Can test domain logic without Prisma/database
- Easy to implement new use cases following the pattern

### Negative
- More files/structure for small modules (extra complexity)
- Requires discipline to maintain layer separation
- Mappers add boilerplate (necessary trade-off)
- Learning curve for team unfamiliar with DDD
- More code lines per feature (but more organized)

### Mitigation
- Start with simple domains (Salon) to establish pattern
- Code review to enforce layer separation
- Document pattern with examples
- Use TypeScript to help enforce boundaries
- Create code generation templates for new use cases

## Implementation Guidelines

### Creating a New Use Case

1. **Identify Business Rules**: What must be true?
2. **Define Domain Entities**: What are the core concepts?
3. **Create Value Objects**: What are immutable values?
4. **Write Domain Service**: Logic spanning entities
5. **Write Use Case**: Orchestrate entities and services
6. **Implement Repository**: Data access for entities
7. **Create Controller**: Expose as HTTP endpoint
8. **Add Validation**: Zod schema for inputs

### Avoiding Anti-Patterns

❌ **Wrong**: Business logic in controller
```typescript
const createAppointment = (req: Request) => {
  // Check availability here
  // Create appointment here
  // Save to database here
}
```

✅ **Right**: Controller is thin, delegates to use case
```typescript
const createAppointment = (req: Request) => {
  const useCase = container.get(CreateAppointmentUseCase)
  return useCase.execute(req.body)
}
```

❌ **Wrong**: Domain entity knows about Prisma
```typescript
class Appointment {
  async save() {
    return prisma.appointment.create(...)
  }
}
```

✅ **Right**: Repository handles persistence
```typescript
class Appointment {
  // Pure business logic
}

class AppointmentRepository implements IAppointmentRepository {
  async save(appointment: Appointment) { ... }
}
```

## Related Decisions
- ADR-001: Technology Stack Selection
- ADR-004: Modular Architecture Pattern
- ADR-005: Testing Strategy (when created)

## References
- [Domain-Driven Design by Eric Evans](https://domainlanguage.com/ddd)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Layered Architectures](https://www.baeldung.com/cs/layered-architecture)

## Migration Path

**Phase 0 (Current)**: Establish DDD structure for Salon module
**Phase 1**: Implement Authentication & Tenant management with DDD
**Phase 2**: Add Restaurant module following same DDD pattern
**Phase 3**: Evaluate DDD adoption effectiveness and adjust
