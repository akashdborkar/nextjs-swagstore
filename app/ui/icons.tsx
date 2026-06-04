import { ReactNode } from 'react';

type P = { className?: string }

function Svg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24} height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function Minus({ className }: P) {
  return <Svg className={className}><path d="M5 12h14" /></Svg>;
}

export function Plus({ className }: P) {
  return <Svg className={className}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>;
}

export function RefreshCw({ className }: P) {
  return (
    <Svg className={className}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Svg>
  );
}

export function Trash2({ className }: P) {
  return (
    <Svg className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </Svg>
  );
}

export function ShoppingBag({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Svg>
  );
}

export function ArrowLeft({ className }: P) {
  return (
    <Svg className={className}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Svg>
  );
}

export function ArrowRight({ className }: P) {
  return (
    <Svg className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Svg>
  );
}

export function Loader2({ className }: P) {
  return <Svg className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></Svg>;
}

export function FileQuestion({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9.1 13.5a3 3 0 1 1 4 2.8c-.7.3-1.1.9-1.1 1.7" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </Svg>
  );
}
