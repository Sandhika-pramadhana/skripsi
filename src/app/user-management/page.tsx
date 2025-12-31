'use client'
import dynamic from "next/dynamic";

// Dynamically import the UserManagement component with no server-side rendering
const UserManagementNoSSR = dynamic(() => import("@/features/page/user-management"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const UserManagementPage = () => <UserManagementNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
UserManagementPage.displayName = "UserManagementPage";

// Export the named component as the default export
export default UserManagementPage;