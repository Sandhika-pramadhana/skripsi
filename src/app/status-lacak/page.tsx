'use client';
import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const StatusLacakNoSSR = dynamic(() => import("@/features/status-lacak"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const StatusLacakPage = () => <StatusLacakNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
StatusLacakPage.displayName = "StatusLacakPage";

// Export the named component as the default export
export default StatusLacakPage;