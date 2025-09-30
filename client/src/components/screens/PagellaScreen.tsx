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

export default function PagellaScreen({ event, currentUser, onGoBack, onGoHome }: PagellaScreenProps) {
  if (!event) return null;

  const { canEdit } = usePagellaPermissions(currentUser);
  const { content, loading, saveStatus, handleContentChange } = usePagellaLogic({
    event,
    currentUser,
    canEdit
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
      <PagellaEditor 
        content={content} 
        canEdit={canEdit} 
        onContentChange={handleContentChange} 
      />
      <BottomNavBar onGoBack={onGoBack} onGoHome={onGoHome} layout="center" />
    </div>
  );
}