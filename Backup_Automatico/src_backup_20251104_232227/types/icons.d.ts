// Dichiarazioni TypeScript per unplugin-icons
declare module '~icons/*' {
  import { FunctionComponent, SVGProps } from 'react';
  const component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default component;
}

// Supporto per import diretti delle collezioni
declare module '~icons/tabler/*' {
  import { FunctionComponent, SVGProps } from 'react';
  const component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default component;
}

declare module '~icons/lucide/*' {
  import { FunctionComponent, SVGProps } from 'react';
  const component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default component;
}

declare module '~icons/custom/*' {
  import { FunctionComponent, SVGProps } from 'react';
  const component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default component;
}
