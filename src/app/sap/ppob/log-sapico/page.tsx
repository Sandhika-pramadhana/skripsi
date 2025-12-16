'use client'
import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const LogSapicoNoSSR = dynamic(() => import("@/features/page/sap/ppob/log-sapico/index"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const LogSapicoPage = () => <LogSapicoNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
LogSapicoPage.displayName = "LogSapicoPage";

// Export the named component as the default export
export default LogSapicoPage;