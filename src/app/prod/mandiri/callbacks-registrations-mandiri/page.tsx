'use client'
import dynamic from "next/dynamic";

// Dynamically import the CallbacksMandiri component with no server-side rendering
const CallbacksRegistrationsMandiriNoSSR = dynamic(() => import("@/features/page/mandiri/prod/callbacks-registrations"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const CallbacksRegistrationsMandiriPage = () => <CallbacksRegistrationsMandiriNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
CallbacksRegistrationsMandiriPage.displayName = "CallbacksRegistrationsMandiriPage";

// Export the named component as the default export
export default CallbacksRegistrationsMandiriPage;