export const toastConfig = {
  position: 'bottom-right' as const,
  toastOptions: {
    success: {
      style: {
        background: '#1A1A1A',
        color: '#22C55E', // text-green-500
        border: '1px solid #242424',
        borderLeft: '4px solid #22C55E',
      },
      iconTheme: {
        primary: '#22C55E',
        secondary: '#1A1A1A',
      },
    },
    error: {
      style: {
        background: '#1A1A1A',
        color: '#A855F7', // text-purple-500
        border: '1px solid #242424',
        borderLeft: '4px solid #A855F7',
      },
      iconTheme: {
        primary: '#A855F7',
        secondary: '#1A1A1A',
      },
    },
    duration: 3000,
  },
}; 