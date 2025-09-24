'use client'
import dynamic from "next/dynamic";

// Dynamically import the Callbacks component with no server-side rendering
const CallbacksSandboxNoSSR = dynamic(() => import("@/features/page/tsel/sandbox/callbacks-tsel"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const CallbacksSandboxPage = () => <CallbacksSandboxNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
CallbacksSandboxPage.displayName = "CallbacksSandboxPage";

// Export the named component as the default export
export default CallbacksSandboxPage;