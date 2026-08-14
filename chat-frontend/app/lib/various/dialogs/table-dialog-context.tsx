import { createContext, useContext, useState, type ReactNode } from 'react';

type TableDialogState = {
  isOpen: boolean;
  action: string | null;
  singleInstance: any | null;
  multipleInstances: any[];
};

type TableDialogContextType = {
  submissionManagementModalState: TableDialogState;
  openSingleModal: (action: string, task: any) => void;
  openBulkModal: (action: string, tasks: any[]) => void;
  closeAssignationModal: () => void;
};

const TableDialogContext = createContext<TableDialogContextType | null>(null);

export function TableDialogProvider({ children }: { children: ReactNode }) {
  const [submissionManagementModalState, setTableDialogState] =
    useState<TableDialogState>({
      isOpen: false,
      action: null,
      singleInstance: null,
      multipleInstances: [],
    });

  const openSingleModal = (action: string, task: any) => {
    setTableDialogState({
      isOpen: true,
      action,
      singleInstance: task,
      multipleInstances: [],
    });
  };

  const openBulkModal = (action: string, tasks: any[]) => {
    setTableDialogState({
      isOpen: true,
      action,
      singleInstance: null,
      multipleInstances: tasks,
    });
  };

  const closeAssignationModal = () => {
    setTableDialogState({
      isOpen: false,
      action: null,
      singleInstance: null,
      multipleInstances: [],
    });
  };

  return (
    <TableDialogContext.Provider
      value={{
        submissionManagementModalState,
        openSingleModal,
        openBulkModal,
        closeAssignationModal,
      }}>
      {children}
    </TableDialogContext.Provider>
  );
}

export function useTableDialog() {
  const context = useContext(TableDialogContext);
  if (!context) {
    throw new Error('useTableDialog must be used within TableDialogProvider');
  }
  return context;
}
