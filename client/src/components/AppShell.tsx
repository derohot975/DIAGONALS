import { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell - Layout wrapper principale dell'applicazione
 * Componente puramente presentazionale che fornisce la struttura base
 */
function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollable-area">
        {children}
      </main>
    </div>
  );
}

export default AppShell;
