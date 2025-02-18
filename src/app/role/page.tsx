import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const RolesNoSSR = dynamic(() => import("@/features/role"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const RolesPage = () => <RolesNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
RolesPage.displayName = "RolesPage";

// Export the named component as the default export
export default RolesPage;