"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface TanstackProps {
  children: React.ReactNode;
}

const TanstackProviders: React.FC<TanstackProps> = (props) => {
  const { children } = props;
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
};

export default TanstackProviders;
