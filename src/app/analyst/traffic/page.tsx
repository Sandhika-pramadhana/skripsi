import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const TrafficMyTselcNoSSR = dynamic(() => import("@/features/analyst/traffic"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const TrafficMyTselcPage = () => <TrafficMyTselcNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
TrafficMyTselcPage.displayName = "TrafficMyTselcPage";

// Export the named component as the default export
export default TrafficMyTselcPage;