import { ArrowLeft, Home } from '@/components/icons';
import { WineEvent, User } from '@shared/schema';
import { usePagellaPermissions } from './pagella/hooks/usePagellaPermissions';
import { usePagellaLogic } from './pagella/hooks/usePagellaLogic';
import PagellaHeader from './pagella/components/PagellaHeader';
import PagellaEditor from './pagella/components/PagellaEditor';
import BottomNavBar from '../navigation/BottomNavBar';

interface PagellaScreenProps {
  event: WineEvent | null;
  currentUser: User | null;
  onGoBack: () => void;
  onGoHome: () => void;
}

interface PagellaScreenContentProps {
  event: WineEvent;
  currentUser: User | null;
  onGoBack: () => void;
  onGoHome: () => void;
}

function PagellaScreenContent({
  event,
  currentUser,
  onGoBack,
  onGoHome,
}: PagellaScreenContentProps) {
  const { canEdit } = usePagellaPermissions(currentUser);
  const { content, loading, saveStatus, handleContentChange } = usePagellaLogic({
    event,
    currentUser,
    canEdit,
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/70">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50 mx-auto mb-2"></div>
          <p>Caricamento pagella…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <PagellaHeader canEdit={canEdit} saveStatus={saveStatus} />
      <PagellaEditor content={content} canEdit={canEdit} onContentChange={handleContentChange} />
      <BottomNavBar
        layout="center"
        centerButtons={[
          ...(onGoBack
            ? [
                {
                  id: 'back',
                  icon: <ArrowLeft className="w-6 h-6" />,
                  onClick: onGoBack,
                  title: 'Indietro',
                  variant: 'glass' as const,
                },
              ]
            : []),
          ...(onGoHome
            ? [
                {
                  id: 'home',
                  icon: <Home className="w-6 h-6" />,
                  onClick: onGoHome,
                  title: 'Home',
                  variant: 'glass' as const,
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}

export default function PagellaScreen({
  event,
  currentUser,
  onGoBack,
  onGoHome,
}: PagellaScreenProps) {
  if (!event) return null;

  return (
    <PagellaScreenContent
      event={event}
      currentUser={currentUser}
      onGoBack={onGoBack}
      onGoHome={onGoHome}
    />
  );
}
