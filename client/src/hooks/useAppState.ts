import { useState } from 'react';
import { User, WineEvent, Wine, EventReportData } from '@shared/schema';

export interface AppState {
  // Modal states
  showAddUserModal: boolean;
  showEditUserModal: boolean;
  showCreateEventModal: boolean;
  showEditEventModal: boolean;
  showWineRegistrationModal: boolean;
  showReportModal: boolean;
  showAdminPinModal: boolean;
  showChangeAdminPinModal: boolean;
  
  // Editing states
  editingUser: User | null;
  editingEvent: WineEvent | null;
  editingWine: Wine | null;
  reportData: EventReportData | null;
  
  // Admin PIN protection
  pendingAdminAction: string | null;
  
  // Selected data
  selectedEventId: number | null;
}

export interface AppStateActions {
  setShowAddUserModal: (show: boolean) => void;
  setShowEditUserModal: (show: boolean) => void;
  setShowCreateEventModal: (show: boolean) => void;
  setShowEditEventModal: (show: boolean) => void;
  setShowWineRegistrationModal: (show: boolean) => void;
  setShowReportModal: (show: boolean) => void;
  setShowAdminPinModal: (show: boolean) => void;
  setShowChangeAdminPinModal: (show: boolean) => void;
  
  setEditingUser: (user: User | null) => void;
  setEditingEvent: (event: WineEvent | null) => void;
  setEditingWine: (wine: Wine | null) => void;
  setReportData: (data: EventReportData | null) => void;
  
  setPendingAdminAction: (action: string | null) => void;
  setSelectedEventId: (id: number | null) => void;
}

export function useAppState(): AppState & AppStateActions {
  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showWineRegistrationModal, setShowWineRegistrationModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [showChangeAdminPinModal, setShowChangeAdminPinModal] = useState(false);
  
  // Editing states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingEvent, setEditingEvent] = useState<WineEvent | null>(null);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [reportData, setReportData] = useState<EventReportData | null>(null);
  
  // Admin PIN protection
  const [pendingAdminAction, setPendingAdminAction] = useState<string | null>(null);
  
  // Selected data
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  return {
    // States
    showAddUserModal,
    showEditUserModal,
    showCreateEventModal,
    showEditEventModal,
    showWineRegistrationModal,
    showReportModal,
    showAdminPinModal,
    showChangeAdminPinModal,
    editingUser,
    editingEvent,
    editingWine,
    reportData,
    pendingAdminAction,
    selectedEventId,
    
    // Actions
    setShowAddUserModal,
    setShowEditUserModal,
    setShowCreateEventModal,
    setShowEditEventModal,
    setShowWineRegistrationModal,
    setShowReportModal,
    setShowAdminPinModal,
    setShowChangeAdminPinModal,
    setEditingUser,
    setEditingEvent,
    setEditingWine,
    setReportData,
    setPendingAdminAction,
    setSelectedEventId,
  };
}
