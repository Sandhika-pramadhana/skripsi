declare namespace JSX {
    interface IntrinsicElements {
      "tableau-viz": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        width?: string | number;
        height?: string | number;
        hideTabs?: boolean;
        toolbar?: string;
      };
    };
  };

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tableau: any;
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const tableau = window.tableau;