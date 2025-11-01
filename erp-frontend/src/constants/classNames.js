import { colors } from './colors';

// Common className combinations for reuse
export const classNames = {
  // Page layout
  pageContainer: 'w-screen min-h-screen bg-gray-50 overflow-x-hidden',
  pageHeader: 'bg-white border-b border-gray-200',
  pageContent: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  
  // Cards and containers
  card: 'bg-white rounded-lg shadow-sm border border-gray-200',
  cardPadding: 'p-6',
  cardHeader: 'px-6 py-4 border-b border-gray-200',
  
  // Buttons
  button: {
    primary: `${colors.button.primary.bg} ${colors.button.primary.text} rounded-md shadow-sm ${colors.button.primary.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.button.primary.focus} px-4 py-2 border border-transparent`,
    secondary: `${colors.button.secondary.bg} ${colors.button.secondary.text} rounded-md border border-gray-300 ${colors.button.secondary.hover} disabled:opacity-50 px-4 py-2`,
    iconEdit: `${colors.text.blue.base} ${colors.text.blue.hover} p-1 rounded ${colors.background.hover.blue} transition-colors duration-150`,
    iconDelete: `${colors.text.red.base} ${colors.text.red.hover} p-1 rounded ${colors.background.hover.red} transition-colors duration-150`,
    iconClose: `${colors.button.ghost.text} ${colors.button.ghost.hover}`,
  },
  
  // Input fields
  input: `w-full border ${colors.input.border} rounded-md px-3 py-2 ${colors.input.focus.ring} ${colors.input.focus.border} focus:outline-none`,
  inputWithIcon: 'block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
  
  // Labels
  label: `block text-sm font-medium ${colors.text.secondary} mb-1`,
  
  // Modal
  modal: {
    overlay: 'fixed inset-0 z-50 overflow-y-auto',
    backdrop: `fixed inset-0 ${colors.overlay.backdrop} transition-opacity`,
    container: 'flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0',
    dialog: 'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full',
    content: 'bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4',
    header: 'flex items-center justify-between mb-4',
    title: `text-lg leading-6 font-medium ${colors.text.primary}`,
  },
  
  // Tables
  table: {
    container: 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
    wrapper: 'overflow-x-auto',
    base: 'min-w-full divide-y divide-gray-200',
    header: `bg-gray-50`,
    headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    body: `bg-white ${colors.table.row.divider}`,
    row: `${colors.table.row.hover}`,
    cell: 'px-6 py-4 whitespace-nowrap text-sm',
  },
  
  // Tabs
  tab: {
    container: 'bg-white border-b border-gray-200 rounded-t-lg border-l border-r border-t border-gray-200',
    content: 'bg-white rounded-b-lg border-l border-r border-b border-gray-200 p-6',
    nav: 'flex space-x-8',
    button: {
      active: `${colors.text.blue.base} border-b-2 ${colors.border.blue} px-4 py-4 text-sm font-medium transition-all duration-200`,
      inactive: `${colors.text.secondary} hover:text-blue-600 hover:border-b-2 hover:border-blue-600 px-4 py-4 text-sm font-medium transition-all duration-200 border-b-2 border-transparent focus:outline-none whitespace-nowrap bg-transparent hover:bg-transparent`,
    },
  },
  
  // Search
  search: {
    container: 'relative',
    iconContainer: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
    icon: `h-5 w-5 ${colors.text.muted}`,
  },
  
  // Loading states
  loading: {
    container: 'bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center',
    spinner: 'h-8 w-8 animate-spin text-blue-600 mx-auto mb-4',
    text: colors.text.secondary,
  },
  
  // Empty states
  empty: 'px-6 py-8 text-center text-gray-500',
  
  // Spacing utilities
  spacing: {
    section: 'space-y-6',
    flexRow: 'flex items-center space-x-4',
    flexBetween: 'flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4',
    buttonGroup: 'flex items-center space-x-2',
    formActions: 'flex justify-end space-x-3 pt-4',
  },
};

