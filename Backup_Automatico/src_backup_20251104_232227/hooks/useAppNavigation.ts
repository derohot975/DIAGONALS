import { useCallback } from 'react';
import { User, WineEvent } from '@shared/schema';
import { Screen } from './useAppRouter';
import { AppStateActions } from './useAppState';
import * as uiHandlers from '../handlers/uiHandlers';
import * as eventHandlers from '../handlers/eventHandlers';

export interface AppNavigation {
  handleShowAdmin: () => void;
  handleShowHistoricEvents: () => void;
  handleShowPagella: (eventId: number) => void;
  handleShowAddUserModal: () => void;
  handleShowCreateEventModal: () => void;
  handleShowAdminEvents: () => void;
  handleShowChangeAdminPin: () => void;
  handleShowEventDetails: (eventId: number) => void;
  handleShowEventResults: (eventId: number) => void;
  handleShowWineRegistration: (eventId: number) => void;
  handleShowResults: (eventId: number) => void;
  handleShowEditUserModal: (user: User) => void;
  handleEditEvent: (event: WineEvent) => void;
  requireAdminPin: (action: string, callback: () => void) => void;
}

export function useAppNavigation(
  setCurrentScreen: (screen: Screen) => void,
  appState: AppStateActions
): AppNavigation {
  
  // Admin PIN protection functions
  const requireAdminPin = useCallback((action: string, callback: () => void) => {
    appState.setPendingAdminAction(action);
    appState.setShowAdminPinModal(true);
    // Store the callback temporarily for execution after PIN validation
    (window as any).pendingAdminCallback = callback;
  }, [appState]);

  // Protected admin actions
  const handleShowAdmin = useCallback(() => {
    requireAdminPin('admin-access', () => setCurrentScreen('admin'));
  }, [requireAdminPin, setCurrentScreen]);

  const handleShowHistoricEvents = useCallback(() => {
    uiHandlers.showHistoricEvents({
      setCurrentScreen,
      setShowAddUserModal: appState.setShowAddUserModal,
      setShowCreateEventModal: appState.setShowCreateEventModal,
      setShowChangeAdminPinModal: appState.setShowChangeAdminPinModal,
      setEditingUser: appState.setEditingUser,
      setShowEditUserModal: appState.setShowEditUserModal
    });
  }, [setCurrentScreen, appState]);

  const handleShowPagella = useCallback((eventId: number) => {
    eventHandlers.showPagella({
      setSelectedEventId: appState.setSelectedEventId,
      setCurrentScreen,
      setEditingWine: appState.setEditingWine,
      setShowWineRegistrationModal: appState.setShowWineRegistrationModal
    }, eventId);
  }, [setCurrentScreen, appState]);

  const handleShowAddUserModal = useCallback(() => {
    uiHandlers.showAddUserModal({
      setCurrentScreen,
      setShowAddUserModal: appState.setShowAddUserModal,
      setShowCreateEventModal: appState.setShowCreateEventModal,
      setShowChangeAdminPinModal: appState.setShowChangeAdminPinModal,
      setEditingUser: appState.setEditingUser,
      setShowEditUserModal: appState.setShowEditUserModal
    });
  }, [setCurrentScreen, appState]);

  const handleShowCreateEventModal = useCallback(() => {
    uiHandlers.showCreateEventModal({
      setCurrentScreen,
      setShowAddUserModal: appState.setShowAddUserModal,
      setShowCreateEventModal: appState.setShowCreateEventModal,
      setShowChangeAdminPinModal: appState.setShowChangeAdminPinModal,
      setEditingUser: appState.setEditingUser,
      setShowEditUserModal: appState.setShowEditUserModal
    });
  }, [setCurrentScreen, appState]);

  const handleShowAdminEvents = useCallback(() => {
    uiHandlers.showAdminEvents({
      setCurrentScreen,
      setShowAddUserModal: appState.setShowAddUserModal,
      setShowCreateEventModal: appState.setShowCreateEventModal,
      setShowChangeAdminPinModal: appState.setShowChangeAdminPinModal,
      setEditingUser: appState.setEditingUser,
      setShowEditUserModal: appState.setShowEditUserModal
    });
  }, [setCurrentScreen, appState]);

  const handleShowChangeAdminPin = useCallback(() => {
    uiHandlers.showChangeAdminPin({
      setCurrentScreen,
      setShowAddUserModal: appState.setShowAddUserModal,
      setShowCreateEventModal: appState.setShowCreateEventModal,
      setShowChangeAdminPinModal: appState.setShowChangeAdminPinModal,
      setEditingUser: appState.setEditingUser,
      setShowEditUserModal: appState.setShowEditUserModal
    });
  }, [setCurrentScreen, appState]);

  const handleShowEventDetails = useCallback((eventId: number) => {
    eventHandlers.showEventDetails({
      setSelectedEventId: appState.setSelectedEventId,
      setCurrentScreen,
      setEditingWine: appState.setEditingWine,
      setShowWineRegistrationModal: appState.setShowWineRegistrationModal
    }, eventId);
  }, [setCurrentScreen, appState]);

  const handleShowEventResults = useCallback((eventId: number) => {
    eventHandlers.showEventResults({
      setSelectedEventId: appState.setSelectedEventId,
      setCurrentScreen,
      setEditingWine: appState.setEditingWine,
      setShowWineRegistrationModal: appState.setShowWineRegistrationModal
    }, eventId);
  }, [setCurrentScreen, appState]);

  const handleShowWineRegistration = useCallback((eventId: number) => {
    eventHandlers.showWineRegistration({
      setSelectedEventId: appState.setSelectedEventId,
      setCurrentScreen,
      setEditingWine: appState.setEditingWine,
      setShowWineRegistrationModal: appState.setShowWineRegistrationModal
    }, eventId);
  }, [setCurrentScreen, appState]);

  const handleShowResults = useCallback((eventId: number) => {
    eventHandlers.showResults({
      setSelectedEventId: appState.setSelectedEventId,
      setCurrentScreen,
      setEditingWine: appState.setEditingWine,
      setShowWineRegistrationModal: appState.setShowWineRegistrationModal
    }, eventId);
  }, [setCurrentScreen, appState]);

  const handleShowEditUserModal = useCallback((user: User) => {
    uiHandlers.showEditUserModal({
      setCurrentScreen,
      setShowAddUserModal: appState.setShowAddUserModal,
      setShowCreateEventModal: appState.setShowCreateEventModal,
      setShowChangeAdminPinModal: appState.setShowChangeAdminPinModal,
      setEditingUser: appState.setEditingUser,
      setShowEditUserModal: appState.setShowEditUserModal
    }, user);
  }, [setCurrentScreen, appState]);

  const handleEditEvent = useCallback((event: WineEvent) => {
    appState.setEditingEvent(event);
    appState.setShowEditEventModal(true);
  }, [appState]);

  return {
    handleShowAdmin,
    handleShowHistoricEvents,
    handleShowPagella,
    handleShowAddUserModal,
    handleShowCreateEventModal,
    handleShowAdminEvents,
    handleShowChangeAdminPin,
    handleShowEventDetails,
    handleShowEventResults,
    handleShowWineRegistration,
    handleShowResults,
    handleShowEditUserModal,
    handleEditEvent,
    requireAdminPin,
  };
}
