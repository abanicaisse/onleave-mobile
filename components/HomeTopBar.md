# HomeTopBar Component

A reusable, type-safe organization selector component for the top of your React Native app.

## Features

- **Type-safe**: Full TypeScript support with strict typing
- **Reusable**: Works with any organization data structure
- **Accessible**: Built-in accessibility features for screen readers
- **Customizable**: Dynamic className propagation and flexible styling
- **Loading states**: Support for loading and disabled states
- **User avatar**: Integrated user profile display
- **Responsive**: Handles long organization names gracefully

## Basic Usage

```tsx
import { HomeTopBar } from "@/components/HomeTopBar";

const organizations = [
  { id: "1", name: "onLeave Inc." },
  { id: "2", name: "Nicaisse Engineering" },
];

const user = {
  initials: "AN",
  fullName: "Alex Nicaisse",
  email: "alex@example.com",
};

<HomeTopBar
  organizations={organizations}
  selectedOrg={organizations[0]}
  onOrgChange={(org) => setSelectedOrg(org)}
  user={user}
/>;
```

## Props

### Required Props

| Prop            | Type                          | Description                         |
| --------------- | ----------------------------- | ----------------------------------- |
| `organizations` | `Organization[]`              | Array of available organizations    |
| `selectedOrg`   | `Organization`                | Currently selected organization     |
| `onOrgChange`   | `(org: Organization) => void` | Callback when organization changes  |
| `user`          | `User`                        | User information for avatar display |

### Optional Props

| Prop                 | Type         | Default     | Description                          |
| -------------------- | ------------ | ----------- | ------------------------------------ |
| `className`          | `string`     | `""`        | Additional CSS classes for container |
| `containerClassName` | `string`     | `""`        | CSS classes for inner container      |
| `dropdownClassName`  | `string`     | `""`        | CSS classes for dropdown menu        |
| `style`              | `ViewStyle`  | `undefined` | Inline styles for container          |
| `showUserInfo`       | `boolean`    | `false`     | Show user email below organization   |
| `onUserPress`        | `() => void` | `undefined` | Callback when user avatar is pressed |
| `isLoading`          | `boolean`    | `false`     | Show loading state                   |
| `disabled`           | `boolean`    | `false`     | Disable interaction                  |

## Types

### Organization

```tsx
interface Organization {
  id: string;
  name: string;
  plan?: string; // Optional plan display
  photoURL?: string; // Optional organization logo
}
```

### User

```tsx
interface User {
  initials: string; // User initials for avatar
  avatarUrl?: string; // Optional avatar image URL
  fullName?: string; // Optional full name
  email?: string; // Optional email address
}
```

## Advanced Usage

### With Access Control Integration

Use the `ConnectedHomeTopBar` for automatic integration with your access control system:

```tsx
import { ConnectedHomeTopBar } from "@/components/ConnectedHomeTopBar";

<ConnectedHomeTopBar
  showUserInfo={true}
  onUserPress={() => router.push("/profile")}
  className="shadow-lg"
/>;
```

### Custom Styling

```tsx
<HomeTopBar
  organizations={organizations}
  selectedOrg={selectedOrg}
  onOrgChange={handleOrgChange}
  user={user}
  className="bg-gradient-to-r from-blue-500 to-purple-600"
  containerClassName="px-6 py-4"
  dropdownClassName="max-h-64 overflow-scroll"
  style={{ borderBottomWidth: 2, borderBottomColor: "#e5e5e5" }}
/>
```

### With Loading State

```tsx
<HomeTopBar
  organizations={organizations}
  selectedOrg={selectedOrg}
  onOrgChange={handleOrgChange}
  user={user}
  isLoading={isLoadingOrganizations}
  disabled={!isAuthenticated}
/>
```

## Accessibility

The component includes built-in accessibility features:

- Screen reader announcements for organization switching
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management

## Styling

The component uses Tailwind CSS classes but can be styled with:

1. **className props**: Add custom classes
2. **style prop**: Inline styles for the container
3. **Global CSS**: Override default styles

### Default Classes

- Container: `bg-white pt-4 px-4 pb-3 border-b border-gray-200`
- Dropdown: `mt-3 bg-white p-2 rounded-lg shadow-lg border border-gray-100`
- Avatar: `h-10 w-10 bg-blue-100 items-center justify-center rounded-full`

## Integration Examples

### With React Navigation

```tsx
import { useNavigation } from "@react-navigation/native";

const navigation = useNavigation();

<HomeTopBar
  organizations={organizations}
  selectedOrg={selectedOrg}
  onOrgChange={handleOrgChange}
  user={user}
  onUserPress={() => navigation.navigate("Profile")}
/>;
```

### With State Management

```tsx
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectOrganization } from "@/store/organizationSlice";

const dispatch = useAppDispatch();
const { organizations, selectedOrg } = useAppSelector(
  (state) => state.organization
);

<HomeTopBar
  organizations={organizations}
  selectedOrg={selectedOrg}
  onOrgChange={(org) => dispatch(selectOrganization(org))}
  user={user}
/>;
```

## Migration Notes

If migrating from the original inline organization selector:

1. Replace the entire organization selector View with `<HomeTopBar />`
2. Remove local state for `orgSelectorVisible`
3. Remove dropdown-related styles from StyleSheet
4. Update prop names to match the component interface

## Performance

- Uses React.useState for local dropdown state
- Memoized to prevent unnecessary re-renders
- Efficient organization filtering and selection
- Optimized touch handling
