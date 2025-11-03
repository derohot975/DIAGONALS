# 🔄 DIAGONALE — API e Architettura Dati

## 🗄️ **ARCHITETTURA DEI DATI**

### **Database Schema (PostgreSQL + Drizzle ORM)**

| **Tabella** | **Campi Principali** | **Relazioni** | **Constraints** |
|-------------|---------------------|---------------|-----------------|
| **users** | id, name, pin, isAdmin, createdAt | - | UNIQUE(name), UNIQUE(pin) |
| **wine_events** | id, name, date, mode, status, votingStatus, createdBy | → users.id | FK createdBy |
| **wines** | id, eventId, userId, type, name, producer, grape, year, origin, price, alcohol | → wine_events.id, → users.id | FK eventId, FK userId |
| **votes** | id, eventId, wineId, userId, score, createdAt | → wine_events.id, → wines.id, → users.id | FK eventId, FK wineId, FK userId |
| **event_reports** | id, eventId, reportData (JSON), generatedAt, generatedBy | → wine_events.id, → users.id | FK eventId, FK generatedBy |

### **Tipi TypeScript Condivisi (`/shared/schema.ts`)**

#### **Entità Base**
```typescript
// Core entities
export type User = typeof users.$inferSelect;
export type WineEvent = typeof wineEvents.$inferSelect;
export type Wine = typeof wines.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type EventReport = typeof eventReports.$inferSelect;

// Insert schemas con validazione Zod
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWineEvent = z.infer<typeof insertWineEventSchema>;
export type InsertWine = z.infer<typeof insertWineSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertEventReport = z.infer<typeof insertEventReportSchema>;
```

#### **Tipi Estesi per Frontend**
```typescript
// Extended types for results
export interface WineResult extends Wine {
  averageScore: number;
  totalVotes: number;
  lodeCount: number;
  contributor: string;
}

export interface WineResultDetailed extends WineResult {
  votes: {
    userId: number;
    userName: string;
    score: number;
  }[];
  position: number;
}

export interface EventReportData {
  eventInfo: WineEvent;
  userRankings: UserRanking[];
  wineResults: WineResultDetailed[];
  summary: {
    totalParticipants: number;
    totalWines: number;
    totalVotes: number;
    averageScore: number;
  };
}

export interface UserRanking {
  userId: number;
  userName: string;
  totalScore: number;
  averageScore: number;
  votesGiven: number;
  position: number;
}
```

---

## 🔌 **API ENDPOINTS COMPLETI**

### **Authentication Routes (`/server/routes/auth.ts`)**

| **Endpoint** | **Method** | **Payload** | **Response** | **Validazione** |
|-------------|------------|-------------|--------------|-----------------|
| `/api/auth/login` | POST | `{name: string, pin: string}` | `User` | PIN 4 cifre, user exists |
| `/api/auth/register` | POST | `{name: string, pin: string, isAdmin?: boolean}` | `User` | PIN 4 cifre, unique name/pin |

### **Users Routes (`/server/routes/users.ts`)**

| **Endpoint** | **Method** | **Payload** | **Response** | **Validazione** |
|-------------|------------|-------------|--------------|-----------------|
| `/api/users` | GET | - | `User[]` | - |
| `/api/users` | POST | `{name: string, isAdmin: boolean}` | `User` | Unique name, auto-generate PIN |
| `/api/users/:id` | PUT | `{name: string, isAdmin: boolean}` | `User` | User exists, unique name |
| `/api/users/:id` | DELETE | - | `{success: boolean}` | User exists, not referenced |

### **Events Routes (`/server/routes/events.ts`)**

| **Endpoint** | **Method** | **Payload** | **Response** | **Validazione** |
|-------------|------------|-------------|--------------|-----------------|
| `/api/events` | GET | - | `WineEvent[]` | - |
| `/api/events` | POST | `{name: string, date: string, mode: string, createdBy: number}` | `WineEvent` | All fields required |
| `/api/events/:id` | PUT | `{name: string, date: string, mode: string}` | `WineEvent` | Event exists |
| `/api/events/:id` | DELETE | - | `{success: boolean}` | Event exists, admin permission |
| `/api/events/:id/results` | GET | - | `WineResultDetailed[]` | Event exists, voting completed |
| `/api/events/:id/voting-status` | PATCH | `{votingStatus: string}` | `WineEvent` | Valid status transition |

### **Wines Routes (`/server/routes/wines.ts`)**

| **Endpoint** | **Method** | **Payload** | **Response** | **Validazione** |
|-------------|------------|-------------|--------------|-----------------|
| `/api/wines` | GET | `?eventId=number` | `Wine[]` | Optional eventId filter |
| `/api/wines` | POST | `WineData + {eventId: number, userId: number}` | `Wine` | All fields required except alcohol |
| `/api/wines/:id` | PUT | `WineData` | `Wine` | Wine exists, owner permission |

### **Votes Routes (`/server/routes/votes.ts`)**

| **Endpoint** | **Method** | **Payload** | **Response** | **Validazione** |
|-------------|------------|-------------|--------------|-----------------|
| `/api/votes` | GET | `?eventId=number` | `Vote[]` | Optional eventId filter |
| `/api/votes` | POST | `{eventId: number, wineId: number, userId: number, score: number}` | `Vote` | Score 1-10, voting active |

### **Reports Routes (`/server/routes/reports.ts`)**

| **Endpoint** | **Method** | **Payload** | **Response** | **Validazione** |
|-------------|------------|-------------|--------------|-----------------|
| `/api/events/:id/complete` | POST | `{userId: number}` | `EventReportData` | Voting complete, admin permission |
| `/api/events/:id/report` | GET | - | `EventReportData` | Report exists |
| `/api/events/:id/pagella` | GET | - | `PagellaData` | Event exists |
| `/api/events/:id/pagella` | PUT | `{content: string, userId: number}` | `PagellaData` | Edit permissions |

### **Health Routes (`/server/routes/health.ts`)**

| **Endpoint** | **Method** | **Payload** | **Response** | **Validazione** |
|-------------|------------|-------------|--------------|-----------------|
| `/api/health` | GET | - | `{status: string, database: object, timestamp: string, uptime: number}` | - |

---

## 🔄 **MATRIX PAGINA/MODALE ↔ ENDPOINT API**

| **Componente** | **GET Endpoints** | **POST Endpoints** | **PUT Endpoints** | **PATCH Endpoints** | **DELETE Endpoints** |
|---------------|-------------------|-------------------|-------------------|---------------------|---------------------|
| **AuthScreen** | - | `/api/auth/login`, `/api/auth/register` | - | - | - |
| **EventListScreen** | `/api/events`, `/api/users`, `/api/wines`, `/api/votes` | - | - | - | - |
| **AdminScreen** | `/api/users` | - | `/api/users/:id` | - | `/api/users/:id` |
| **SimpleVotingScreen** | `/api/wines?eventId=X` | `/api/votes` | - | - | - |
| **EventDetailsScreen** | `/api/wines?eventId=X`, `/api/votes?eventId=X` | `/api/wines` | - | - | - |
| **EventResultsScreen** | `/api/events/:id/results` | - | - | - | - |
| **AdminEventManagementScreen** | `/api/events/:id/report` | `/api/events/:id/complete` | - | `/api/events/:id/voting-status` | `/api/events/:id` |
| **PagellaScreen** | `/api/events/:id/pagella` | - | `/api/events/:id/pagella` | - | - |
| **AddUserModal** | - | `/api/users` | - | - | - |
| **EditUserModal** | - | - | `/api/users/:id` | - | - |
| **CreateEventModal** | - | `/api/events` | - | - | - |
| **EditEventModal** | - | - | `/api/events/:id` | - | - |
| **WineRegistrationModal** | - | `/api/wines` | `/api/wines/:id` | - | - |

---

## 🗄️ **MATRIX COMPONENTE ↔ ENTITÀ DATABASE**

| **Componente** | **users** | **wine_events** | **wines** | **votes** | **event_reports** |
|---------------|-----------|-----------------|-----------|-----------|-------------------|
| **AuthScreen** | ✅ Login/Register | - | - | - | - |
| **EventListScreen** | ✅ Display | ✅ List/Filter | ✅ User wines | ✅ Vote status | - |
| **AdminScreen** | ✅ CRUD | - | - | - | - |
| **SimpleVotingScreen** | ✅ Current user | ✅ Event info | ✅ Wine list | ✅ Submit votes | - |
| **EventDetailsScreen** | ✅ Participants | ✅ Event info | ✅ Event wines | ✅ Vote progress | - |
| **EventResultsScreen** | ✅ Contributors | ✅ Event info | ✅ Results | ✅ Final scores | - |
| **AdminEventManagementScreen** | ✅ Admin check | ✅ Manage | ✅ Count | ✅ Completion | ✅ Generate |
| **PagellaScreen** | ✅ Permissions | ✅ Event context | - | - | ✅ Pagella data |

---

## 🔒 **VALIDAZIONI E SICUREZZA**

### **Zod Schema Validations**
```typescript
// User validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Event validation  
export const insertWineEventSchema = createInsertSchema(wineEvents).omit({
  id: true,
  createdAt: true,
});

// Wine validation
export const insertWineSchema = createInsertSchema(wines).omit({
  id: true,
  createdAt: true,
}).extend({
  alcohol: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === null || val === undefined) return undefined;
    return typeof val === 'number' ? val.toString() : val;
  })
});

// Vote validation
export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
}).extend({
  score: z.number().min(1).max(10) // Score range 1-10
});
```

### **Database Constraints**
- **users.name**: UNIQUE constraint
- **users.pin**: UNIQUE constraint, 4 digits
- **votes.score**: DECIMAL(3,1) - supports .5 increments
- **wines.price**: DECIMAL(10,2) - currency precision
- **Foreign Keys**: Cascading relationships maintained

### **API Security Measures**
- **Input Validation**: Zod schemas per ogni endpoint
- **PIN Security**: 4-digit numeric, localStorage storage
- **Admin Protection**: AdminPinModal per operazioni sensibili
- **Rate Limiting**: Health endpoint limited to 100 req/15min
- **CORS**: Configured per cross-origin requests

---

## 📊 **PERFORMANCE E CACHING**

### **React Query Configuration**
```typescript
// Query cache times per data type
const cacheConfig = {
  users: { staleTime: 10 * 60 * 1000 }, // 10 minutes
  events: { staleTime: 5 * 60 * 1000 },  // 5 minutes  
  wines: { staleTime: 2 * 60 * 1000 },   // 2 minutes
  votes: { staleTime: 30 * 1000 },       // 30 seconds
  results: { staleTime: 60 * 1000 }      // 1 minute
};
```

### **Database Optimizations**
- **Indexes**: Primary keys, foreign keys auto-indexed
- **Query Optimization**: Filtered queries per eventId
- **Connection Pooling**: PostgreSQL connection management
- **Prepared Statements**: Drizzle ORM query preparation

### **API Response Optimization**
- **Selective Loading**: Conditional queries based on screen
- **Batch Operations**: Multiple related data in single requests
- **Compression**: Gzip compression per responses
- **Pagination**: Not implemented (small datasets expected)

---

## 🔄 **DATA FLOW PATTERNS**

### **Create Flow**
```
User Input → Zod Validation → API Call → Database Insert → React Query Invalidation → UI Update
```

### **Read Flow**  
```
Component Mount → React Query → Cache Check → API Call (if needed) → Database Query → Response → UI Render
```

### **Update Flow**
```
User Action → Optimistic Update → API Call → Database Update → Query Invalidation → Fresh Data → UI Sync
```

### **Delete Flow**
```
User Confirmation → API Call → Database Delete → Query Invalidation → UI Removal → Success Feedback
```

---

## 🎯 **BUSINESS LOGIC CONSTRAINTS**

### **Event Lifecycle**
1. **Registration Phase**: Users register wines
2. **Voting Phase**: Users vote on all wines except their own
3. **Completed Phase**: Results calculated and displayed
4. **Report Generation**: Final report with rankings

### **Voting Rules**
- **Score Range**: 1.0 to 10.0 with 0.5 increments
- **Self-Voting**: Users cannot vote on their own wines
- **Completion**: All participants must vote before completion
- **Finality**: Votes cannot be changed after event completion

### **User Permissions**
- **Regular Users**: Register wines, vote, view results
- **Admin Users**: All regular permissions + user management + event management
- **PIN Protection**: Admin operations require PIN confirmation

### **Data Integrity**
- **Unique Constraints**: User names and PINs must be unique
- **Referential Integrity**: Foreign key constraints maintained
- **Calculation Accuracy**: Floating point precision handled with rounding
- **Audit Trail**: Created timestamps for all entities
