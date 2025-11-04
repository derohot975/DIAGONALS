// UI/Navigation handlers - pure functions for modal toggles and screen navigation
// These handlers are stateless and only manipulate UI state

import { User } from '@shared/schema';

type Screen = 'auth' | 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'voting' | 'historicEvents' | 'pagella';

interface UIHandlerDependencies {
  setCurrentScreen: (screen: Screen) => void;
  setShowAddUserModal: (show: boolean) => void;
  setShowCreateEventModal: (show: boolean) => void;
  setShowChangeAdminPinModal: (show: boolean) => void;
  setEditingUser: (user: User | null) => void;
  setShowEditUserModal: (show: boolean) => void;
}

export const showAddUserModal = (deps: UIHandlerDependencies) => {
  deps.setShowAddUserModal(true);
};

export const showCreateEventModal = (deps: UIHandlerDependencies) => {
  deps.setShowCreateEventModal(true);
};

export const showAdminEvents = (deps: UIHandlerDependencies) => {
  deps.setCurrentScreen('adminEvents');
};

export const showHistoricEvents = (deps: UIHandlerDependencies) => {
  deps.setCurrentScreen('historicEvents');
};

export const showChangeAdminPin = (deps: UIHandlerDependencies) => {
  deps.setShowChangeAdminPinModal(true);
};

export const showEditUserModal = (deps: UIHandlerDependencies, user: User) => {
  deps.setEditingUser(user);
  deps.setShowEditUserModal(true);
};
