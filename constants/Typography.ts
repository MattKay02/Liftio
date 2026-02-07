export const Typography = {
  fontFamily: {
    primary: 'System',
    mono: 'monospace',
  },

  fontSize: {
    display: 28,
    title: 20,
    bodyLg: 16,
    body: 14,
    caption: 12,
  },

  fontWeight: {
    regular: '400' as const,
    semibold: '600' as const,
  },

  lineHeight: {
    display: 34,
    title: 28,
    bodyLg: 24,
    body: 20,
    caption: 16,
  },
} as const;
