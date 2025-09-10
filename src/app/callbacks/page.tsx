'use client'
import dynamic from "next/dynamic";

// Dynamically import the Callbacks component with no server-side rendering
const CallbacksNoSSR = dynamic(() => import("@/features/page/callbacks"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const CallbacksPage = () => <CallbacksNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
CallbacksPage.displayName = "CallbacksPage";

// Export the named component as the default export
export default CallbacksPage;