// Function to format time from 24-hour to 12-hour format
export const formatTime = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour12 = parseInt(hours) % 12 || 12;
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes} ${ampm}`;
};

// Function to generate consistent colors based on shift code
export const getShiftColors = (shiftCode) => {
  if (!shiftCode) {
    return {
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200'
    };
  }

  // Define specific colors for each shift code
  const code = shiftCode.toUpperCase();
  
  switch (code) {
    case 'G':
      return {
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      };
    case 'D':
      return {
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      };
    case 'N':
      return {
        bgColor: 'bg-gray-700',
        textColor: 'text-gray-100',
        borderColor: 'border-gray-800'
      };
    case 'A':
      return {
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      };
    case 'B':
      return {
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-200'
      };
    case 'C':
      return {
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
      };
    case 'M':
      return {
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
      };
    case 'OFF':
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-200'
      };
    default:
      // Fallback colors for any other shift codes
      const fallbackColors = [
        {
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-800',
          borderColor: 'border-indigo-200'
        },
        {
          bgColor: 'bg-teal-50',
          textColor: 'text-teal-800',
          borderColor: 'border-teal-200'
        },
        {
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200'
        },
        {
          bgColor: 'bg-pink-50',
          textColor: 'text-pink-800',
          borderColor: 'border-pink-200'
        },
        {
          bgColor: 'bg-cyan-50',
          textColor: 'text-cyan-800',
          borderColor: 'border-cyan-200'
        }
      ];

      // Use hash function for any other shift codes not explicitly defined
      let hash = 0;
      for (let i = 0; i < shiftCode.length; i++) {
        const char = shiftCode.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const colorIndex = Math.abs(hash) % fallbackColors.length;
      return fallbackColors[colorIndex];
  }
};
