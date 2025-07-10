# Access Control System for React Native

This access control system has been adapted from the web version to work with React Native using `expo-secure-store` for persistent storage.

## Key Changes from Web Version

1. **Storage**: Replaced `localStorage` with `expo-secure-store` for secure data persistence
2. **HTTP Client**: Replaced `axios` with native `fetch` API for better React Native compatibility
3. **Async Operations**: All storage operations are now async due to `expo-secure-store` requirements

## Core Components

### 1. Storage Layer (`lib/accessControlStorage.ts`)

- Uses `expo-secure-store` instead of `localStorage`
- All functions are now async
- Secure storage for access control data

### 2. Store (`store/accessControlStore.ts`)

- Zustand store for in-memory access control state
- No changes needed from web version

### 3. Manager Hook (`hooks/use-access-control-manager.ts`)

- Updated to handle async storage operations
- Added loading state for initialization
- All CRUD operations are now async

### 4. API Hook (`hooks/use-access-control.ts`)

- Uses `@tanstack/react-query` for API calls
- Fetches fresh access control data from your backend

### 5. Combined Hook (`hooks/use-auth-access-control.ts`)

- **NEW**: Combines local storage and API data
- Automatically syncs API data to secure storage
- Provides both local (immediate) and remote (fresh) data

## Usage

### Basic Setup

1. **In your main app component**:

```tsx
import { useAuthAccessControl } from "@/hooks/use-auth-access-control";

export default function App() {
  const { user, appRole, orgRole, orgId, isLoading, error } =
    useAuthAccessControl();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Your app logic here
}
```

### Access Control Management

```tsx
import { useAccessControlManager } from "@/hooks/use-access-control-manager";

export function OrganizationSwitcher() {
  const { switchOrganization, accessControlData } = useAccessControlManager();

  const handleSwitch = async (orgId: string, appRole: string, orgRole: string) => {
    try {
      await switchOrganization(orgId, appRole, orgRole);
      // Organization switched successfully
    } catch (error) {
      // Handle error
    }
  };

  return (
    // Your UI
  );
}
```

### Direct Data Access

```tsx
import { useAccessControlStore } from "@/store/accessControlStore";

export function SomeComponent() {
  const { accessControlData } = useAccessControlStore();

  // Access current user info
  const currentUser = accessControlData.user;
  const userRole = accessControlData.appRole;

  return (
    // Your component
  );
}
```

## API Integration

The system expects your backend to provide endpoints:

1. **GET** `/custom-claims` - Returns user's access control data
2. **POST** `/custom-claims` - Creates custom claims
3. **PUT** `/auth/accounts/:userId` - Updates user account
4. **DELETE** `/auth/accounts/:userId` - Deletes user account

All endpoints should accept Firebase auth tokens in the Authorization header:

```
Authorization: Bearer <firebase-auth-token>
```

## Security

- All sensitive data is stored in `expo-secure-store`
- Access tokens are managed by Firebase Auth
- Data is encrypted at rest on the device

## Migration Notes

If you're migrating from the web version:

1. Update all storage function calls to be async
2. Add error handling for storage operations
3. Use the combined hook for easier data management
4. Remove any `window` or `localStorage` references

## Example Component

See `components/AccessControlExample.tsx` for a complete example of how to use the access control system in your React Native components.
