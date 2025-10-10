# Downtime Tracking Module - Complete Documentation

## Overview

The Downtime Tracking module is a fully functional, production-ready feature that manages equipment downtime incidents. It follows best practices for React, TypeScript, and modern web application architecture.

## Architecture

### Directory Structure

```
src/features/downtime/
├── components/           # React components
│   ├── DowntimeSearchFilter.tsx
│   ├── DowntimeSummaryCard.tsx
│   ├── DowntimeTabHeader.tsx
│   ├── DowntimeTable.tsx
│   ├── EditIncidentModal.tsx
│   ├── LogDowntimeModal.tsx
│   └── ResolvedIncidentsModal.tsx
├── hooks/               # Custom React hooks
│   └── useDowntimeService.ts
├── pages/               # Page components
│   └── DowntimeTrackingPage.tsx
├── services/            # API service layer
│   └── downtimeService.ts
├── utils/               # Utility functions
│   └── downtimeUtils.ts
├── zod/                 # Validation schemas
│   └── downtimeSchemas.ts
├── mockData.ts          # Mock data for development
└── types.ts             # TypeScript type definitions
```

## Key Features

### 1. Complete CRUD Operations
- ✅ Create new downtime incidents
- ✅ Read/View all active incidents
- ✅ Update existing incidents
- ✅ Delete incidents
- ✅ Resolve incidents
- ✅ View resolved incidents history

### 2. Form Validation
- Uses Zod schemas for robust validation
- Client-side validation with helpful error messages
- Type-safe form data handling

### 3. State Management
- React Query for server state management
- Automatic cache invalidation
- Optimistic updates (can be enabled)
- Loading and error states

### 4. Search & Filtering
- Live search across multiple fields
- Filter by asset, priority, and status
- Real-time filtering with no backend calls

### 5. Data Display
- Sortable, paginated tables
- Summary cards with key metrics
- Badge indicators for priority and status

## Technology Stack

- **React 18+**: Modern React with hooks
- **TypeScript**: Full type safety
- **React Query (TanStack Query)**: Server state management
- **Zod**: Runtime validation and type inference
- **Semi Design**: UI components (customizable)

## Component Details

### Main Page: DowntimeTrackingPage

The main entry point that orchestrates all components.

**Features:**
- Fetches data using custom hooks
- Manages modal states
- Handles incident selection
- Shows loading states

### Modals

#### LogDowntimeModal
- Form to create new downtime incidents
- Zod validation
- Asset selection dropdown
- Priority levels
- Date/time picker for start time
- Description textarea

#### EditIncidentModal
- Edit existing incidents
- Change priority, status
- Add end time when resolving
- Add resolution notes
- Validates required fields based on status

#### ResolvedIncidentsModal
- View all resolved incidents
- Search functionality
- Displays resolution details
- Shows downtime duration

### Custom Hooks

#### useGetDowntimeIncidents()
Fetches all active downtime incidents.

```typescript
const { data, isLoading, error } = useGetDowntimeIncidents();
```

#### useGetResolvedIncidents()
Fetches all resolved incidents.

```typescript
const { data, isLoading } = useGetResolvedIncidents();
```

#### useGetDowntimeSummary()
Fetches summary statistics.

```typescript
const { data: summary } = useGetDowntimeSummary();
```

#### useCreateDowntimeIncident(onSuccess?)
Creates a new incident.

```typescript
const createMutation = useCreateDowntimeIncident(() => {
  console.log("Incident created!");
});

createMutation.mutate({
  assetId: "CBT-001",
  priority: "High",
  description: "Motor overheating",
  startTime: new Date().toISOString(),
});
```

#### useUpdateDowntimeIncident(onSuccess?)
Updates an existing incident.

```typescript
const updateMutation = useUpdateDowntimeIncident();
updateMutation.mutate({
  id: "1",
  assetId: "CBT-001",
  priority: "Critical",
  status: "In Progress",
  // ... other fields
});
```

#### useDeleteDowntimeIncident(onSuccess?)
Deletes an incident.

```typescript
const deleteMutation = useDeleteDowntimeIncident();
deleteMutation.mutate("incident-id");
```

## Data Flow

1. **User Action** → Component Event Handler
2. **Event Handler** → Calls custom hook mutation
3. **Hook** → Validates data with Zod schema
4. **Service Layer** → Makes API call (currently mock)
5. **React Query** → Updates cache
6. **Component** → Re-renders with new data

## Connecting to Real Backend

### Step 1: Update Service Layer

Replace mock implementations in `services/downtimeService.ts`:

```typescript
import { createFetchWithTimeout } from "@/utils/apiHelpers";
import { API_URL } from "@/config";

const fetchWithTimeout = createFetchWithTimeout();

export const fetchDowntimeIncidents = async (): Promise<DowntimeIncident[]> => {
  return fetchWithTimeout<DowntimeIncident[]>(
    `${API_URL}/api/downtime/incidents`,
    { method: "GET" }
  );
};

export const createDowntimeIncident = async (
  input: CreateDowntimeInput
): Promise<DowntimeIncident> => {
  return fetchWithTimeout<DowntimeIncident>(
    `${API_URL}/api/downtime/incidents`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
};

export const updateDowntimeIncident = async (
  input: EditDowntimeInput
): Promise<DowntimeIncident> => {
  return fetchWithTimeout<DowntimeIncident>(
    `${API_URL}/api/downtime/incidents/${input.id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
};

export const deleteDowntimeIncident = async (id: string): Promise<void> => {
  return fetchWithTimeout<void>(
    `${API_URL}/api/downtime/incidents/${id}`,
    { method: "DELETE" }
  );
};
```

### Step 2: Configure API URL

Update `.env`:

```env
VITE_API_URL=https://your-backend-api.com
```

### Step 3: Backend API Endpoints Required

Your backend should implement these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/downtime/incidents` | Get all active incidents |
| GET | `/api/downtime/incidents/resolved` | Get resolved incidents |
| GET | `/api/downtime/summary` | Get summary statistics |
| POST | `/api/downtime/incidents` | Create new incident |
| PUT | `/api/downtime/incidents/:id` | Update incident |
| DELETE | `/api/downtime/incidents/:id` | Delete incident |

### Step 4: Expected Response Format

```typescript
// GET /api/downtime/incidents
{
  "data": [
    {
      "id": "1",
      "assetName": "Conveyor Belt A1",
      "assetId": "CBT-001",
      "priority": "High",
      "status": "Active",
      "startTime": "2025-10-10T08:30:00Z",
      "endTime": null,
      "description": "Motor overheating",
      "reportedBy": "John Smith"
    }
  ]
}

// Error Response
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Validation Schemas

### CreateDowntimeSchema
Validates new incident creation:
- `assetId`: Required, non-empty string
- `priority`: "Low" | "Medium" | "High" | "Critical"
- `description`: Minimum 10 characters
- `startTime`: Valid ISO datetime
- `endTime`: Optional, must be after startTime

### EditDowntimeSchema
Validates incident updates:
- All CreateDowntime fields
- `id`: Required
- `status`: "Active" | "In Progress" | "Resolved"
- `resolutionNotes`: Required when status is "Resolved"
- `endTime`: Required when status is "Resolved"

## Utility Functions

Located in `utils/downtimeUtils.ts`:

- `calculateDuration(startTime, endTime)`: Calculate duration between dates
- `calculateOngoingDuration(startTime)`: Calculate duration from start to now
- `filterIncidents(incidents, filters)`: Filter incidents by criteria
- `sortIncidentsByPriority(incidents)`: Sort by priority then date
- `formatDate(isoDate)`: Format date for display
- `formatTime(isoDate)`: Format time for display
- `getPriorityVariant(priority)`: Get badge color for priority
- `getStatusVariant(status)`: Get badge color for status
- `isOverdue(incident)`: Check if incident is overdue (>24h)

## Best Practices Implemented

### 1. TypeScript
- Strict typing throughout
- No `any` types
- Proper generic usage
- Type inference from Zod schemas

### 2. React
- Functional components with hooks
- Proper dependency arrays
- Memoization where appropriate
- Error boundaries ready

### 3. State Management
- Server state in React Query
- Local UI state in component state
- Proper cache management
- Automatic refetching

### 4. Code Organization
- Feature-based structure
- Separation of concerns
- Reusable components
- DRY principles

### 5. Performance
- Lazy loading ready
- Optimized re-renders
- Efficient filtering
- Pagination support

## Testing Recommendations

### Unit Tests
- Test utility functions
- Test validation schemas
- Test filter logic

### Integration Tests
- Test component rendering
- Test form submissions
- Test modal interactions

### E2E Tests
- Test complete workflows
- Test error scenarios
- Test data persistence

## Future Enhancements

Potential improvements:

1. **Export Functionality**: Export incidents to CSV/Excel
2. **Charts & Analytics**: Visual representation of downtime trends
3. **Notifications**: Real-time alerts for critical incidents
4. **Comments**: Add comment thread to incidents
5. **Attachments**: Upload photos/documents
6. **Mobile App**: React Native companion app
7. **Offline Support**: PWA with offline capabilities
8. **Audit Log**: Track all changes to incidents

## Troubleshooting

### Issue: Data not loading
- Check API_URL configuration
- Verify backend endpoints are accessible
- Check browser console for errors
- Verify authentication token if required

### Issue: Form validation not working
- Check Zod schema definitions
- Verify error state is properly displayed
- Check console for validation errors

### Issue: Cache not invalidating
- Check query keys match across hooks
- Verify invalidateQueries is called
- Check React Query DevTools

## Summary

The Downtime Tracking module is a complete, production-ready feature with:

✅ Full CRUD operations  
✅ Type-safe with TypeScript  
✅ Validated with Zod schemas  
✅ State managed with React Query  
✅ Mock data for development  
✅ Easy backend integration  
✅ Professional UI/UX  
✅ Scalable architecture  

**Current Status**: 100% functional with mock data. Ready for backend integration by simply updating the service layer.
