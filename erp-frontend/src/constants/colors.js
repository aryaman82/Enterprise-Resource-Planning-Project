// Color constants for consistent styling across the application
export const colors = {
  // Background colors
  background: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    tertiary: 'bg-gray-100',
    hover: {
      gray: 'hover:bg-gray-50',
      blue: 'hover:bg-blue-50',
      red: 'hover:bg-red-50',
    },
  },

  // Text colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
    muted: 'text-gray-400',
    white: 'text-white',
    blue: {
      base: 'text-blue-600',
      hover: 'hover:text-blue-700',
      light: 'text-blue-800',
    },
    red: {
      base: 'text-red-600',
      hover: 'hover:text-red-900',
      light: 'text-red-800',
      required: 'text-red-500',
    },
    green: {
      base: 'text-green-600',
      light: 'text-green-800',
    },
    yellow: {
      light: 'text-yellow-800',
    },
    orange: {
      light: 'text-orange-800',
    },
    purple: {
      light: 'text-purple-800',
    },
  },

  // Border colors
  border: {
    base: 'border-gray-200',
    input: 'border-gray-300',
    focus: 'border-blue-500',
    blue: 'border-blue-600',
  },

  // Button colors
  button: {
    primary: {
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      text: 'text-white',
      focus: 'focus:ring-blue-500',
    },
    secondary: {
      bg: 'bg-gray-100',
      hover: 'hover:bg-gray-200',
      text: 'text-gray-700',
    },
    danger: {
      bg: 'bg-red-600',
      hover: 'hover:bg-red-700',
      text: 'text-white',
    },
    ghost: {
      text: 'text-gray-400',
      hover: 'hover:text-gray-500',
    },
  },

  // Status badge colors
  status: {
    received: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
    processing: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
    },
    inProduction: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
    },
    readyForDispatch: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
    },
    dispatched: {
      bg: 'bg-green-100',
      text: 'text-green-800',
    },
    default: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
    },
  },

  // Input colors
  input: {
    border: 'border-gray-300',
    focus: {
      ring: 'focus:ring-2 focus:ring-blue-500',
      border: 'focus:border-blue-500',
    },
    placeholder: 'placeholder-gray-500',
  },

  // Modal/Overlay colors
  overlay: {
    backdrop: 'bg-gray-500 bg-opacity-75',
  },

  // Table colors
  table: {
    header: {
      bg: 'bg-gray-50',
      text: 'text-gray-500',
    },
    row: {
      hover: 'hover:bg-gray-50',
      divider: 'divide-gray-200',
    },
  },
};

