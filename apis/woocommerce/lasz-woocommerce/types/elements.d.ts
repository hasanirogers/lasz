import * as React from "react";
import BusinessCalendly from "../elements/business-calendly/business-calendly";

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'business-calendly': {
        url?: string;
        height?: string;
        minWidth?: string;
        mode?: 'edit' | 'save';
      } & React.HTMLAttributes<BusinessCalendly>;
    }
  }
}
