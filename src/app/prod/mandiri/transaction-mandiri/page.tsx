'use client'
import dynamic from "next/dynamic";

// Dynamically import the LogApisMandiri component with no server-side rendering
const TransactionMandiriNoSSR = dynamic(() => import("@/features/page/mandiri/prod/transaction-mandiri"), {
  ssr: false,
});

// Assign the component to a variable with a name
// eslint-disable-next-line react/no-children-prop
const TransactionMandiriPage = () => <TransactionMandiriNoSSR children={undefined} />;

// Optionally, add a displayName for debugging purposes
TransactionMandiriPage.displayName = "TransactionMandiriPage";

// Export the named component as the default export
export default TransactionMandiriPage;