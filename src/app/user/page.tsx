import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const UsersNoSSR = dynamic(() => import("@/features/user"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const UsersPage = () => <UsersNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
UsersPage.displayName = "UsersPage";

// Export the named component as the default export
export default UsersPage;