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
    <div className="h-screen flex flex-col">
      {children}
    </div>
  );
}

export default AppShell;
