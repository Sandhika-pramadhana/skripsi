'use client';
import dynamic from "next/dynamic";

// Dynamically import the OfficeList component with no server-side rendering
const DaftarKirimanNoSSR = dynamic(() => import("@/features/daftar-kiriman"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const DaftarKirimanPage = () => <DaftarKirimanNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
DaftarKirimanPage.displayName = "DaftarKirimanPage";

// Export the named component as the default export
export default DaftarKirimanPage;