import { User, WineEvent, Wine } from '@shared/schema';
import { AppState, AppStateActions } from '@/hooks/useAppState';
import AddUserModal from './modals/AddUserModal';
import EditUserModal from './modals/EditUserModal';
import CreateEventModal from './modals/CreateEventModal';
import EditEventModal from './modals/EditEventModal';
import WineRegistrationModal from './modals/WineRegistrationModal';
import AdminPinModal from './AdminPinModal';
import ChangeAdminPinModal from './modals/ChangeAdminPinModal';
import GlobalWineSearchOverlay from './search/GlobalWineSearchOverlay';
import InstallPrompt from './InstallPrompt';

interface AppModalsProps {
  appState: AppState & AppStateActions;
  currentUser: User | null;
  currentScreen: string;
  enableAppShell: boolean;
  onAddUser: (name: string, isAdmin: boolean) => void;
  onUpdateUser: (id: number, name: string, isAdmin: boolean) => void;
  onCreateEvent: (name: string, date: string, mode: string) => void;
  onUpdateEvent: (id: number, name: string, date: string, mode: string) => void;
  onRegisterWine: (wineData: {
    type: string; name: string; producer: string; grape: string;
    year: number; origin: string; price: number; alcohol?: number; eventId: number;
  }) => void;
  onAdminPinSuccess: () => void;
  onAdminPinClose: () => void;
  onChangeAdminPin: (newPin: string) => void;
}

export default function AppModals({
  appState, currentUser, currentScreen, enableAppShell,
  onAddUser, onUpdateUser, onCreateEvent, onUpdateEvent,
  onRegisterWine, onAdminPinSuccess, onAdminPinClose, onChangeAdminPin
}: AppModalsProps) {
  return (
    <>
      <AddUserModal
        isOpen={appState.showAddUserModal}
        onClose={() => appState.setShowAddUserModal(false)}
        onAddUser={onAddUser}
      />

      <EditUserModal
        isOpen={appState.showEditUserModal}
        onClose={() => { appState.setShowEditUserModal(false); appState.setEditingUser(null); }}
        user={appState.editingUser}
        onUpdateUser={onUpdateUser}
      />

      <CreateEventModal
        isOpen={appState.showCreateEventModal}
        onClose={() => appState.setShowCreateEventModal(false)}
        onCreateEvent={onCreateEvent}
      />

      <EditEventModal
        isOpen={appState.showEditEventModal}
        onClose={() => { appState.setShowEditEventModal(false); appState.setEditingEvent(null); }}
        onUpdateEvent={onUpdateEvent}
        event={appState.editingEvent}
      />

      <WineRegistrationModal
        isOpen={appState.showWineRegistrationModal}
        onClose={() => { appState.setShowWineRegistrationModal(false); appState.setEditingWine(null); }}
        currentUser={currentUser}
        onRegisterWine={onRegisterWine}
        wine={appState.editingWine}
        eventId={appState.selectedEventId}
      />

      {enableAppShell && (
        <>
          <AdminPinModal
            isOpen={appState.showAdminPinModal}
            onClose={onAdminPinClose}
            onSuccess={onAdminPinSuccess}
          />
          <ChangeAdminPinModal
            isOpen={appState.showChangeAdminPinModal}
            onClose={() => appState.setShowChangeAdminPinModal(false)}
            onSuccess={onChangeAdminPin}
          />
        </>
      )}

      {currentScreen === 'home' && !currentUser && <InstallPrompt />}

      <GlobalWineSearchOverlay />
    </>
  );
}
