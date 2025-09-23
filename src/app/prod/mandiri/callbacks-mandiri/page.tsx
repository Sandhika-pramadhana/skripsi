'use client'
import dynamic from "next/dynamic";

// Dynamically import the CallbacksMandiri component with no server-side rendering
const CallbacksMandiriNoSSR = dynamic(() => import("@/features/page/mandiri/prod/callbacks-mandiri"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const CallbacksMandiriPage = () => <CallbacksMandiriNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
CallbacksMandiriPage.displayName = "CallbacksMandiriPage";

// Export the named component as the default export
export default CallbacksMandiriPage;