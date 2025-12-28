
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				serif: ['Lora', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
				display: ['Playfair Display', 'Georgia', 'serif'],
				body: ['Lato', 'Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Unified brand palette
				brand: {
					50: 'hsl(30, 35%, 98%)',
					100: 'hsl(35, 30%, 92%)',
					200: 'hsl(35, 30%, 88%)',
					300: 'hsl(35, 30%, 82%)',
					400: 'hsl(25, 30%, 70%)',
					500: 'hsl(25, 40%, 50%)',
					600: 'hsl(25, 40%, 40%)',
					700: 'hsl(25, 40%, 30%)',
					800: 'hsl(25, 40%, 20%)',
					900: 'hsl(25, 40%, 12%)',
				},
				// Legacy aliases for backwards compatibility
				coffee: {
					lightest: 'hsl(30, 35%, 98%)',
					light: 'hsl(35, 30%, 88%)',
					medium: 'hsl(25, 30%, 70%)',
					dark: 'hsl(25, 40%, 40%)',
					darker: 'hsl(25, 40%, 30%)',
					darkest: 'hsl(25, 40%, 20%)',
				},
				reed: {
					primary: 'hsl(25, 40%, 50%)',
					secondary: 'hsl(35, 30%, 82%)',
					light: 'hsl(35, 30%, 92%)',
					dark: 'hsl(25, 40%, 30%)',
					darker: 'hsl(25, 40%, 20%)'
				},
				logo: {
					background: 'hsl(25, 40%, 50%)',
					text: 'hsl(35, 30%, 92%)',
					accent: 'hsl(35, 30%, 82%)'
				},
				// New landing page colors
				cream: 'hsl(40, 40%, 97%)',
				beige: 'hsl(35, 35%, 90%)',
				copper: {
					DEFAULT: 'hsl(25, 55%, 45%)',
					light: 'hsl(25, 50%, 55%)',
				},
				gold: 'hsl(40, 70%, 50%)'
			},
			fontSize: {
				'display': ['clamp(3rem, 5vw + 1rem, 4.5rem)', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
				'hero': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.01em' }],
				'h1': ['clamp(2rem, 3vw + 0.5rem, 3rem)', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0' }],
				'h2': ['clamp(1.5rem, 2vw + 0.5rem, 2.25rem)', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0' }],
				'h3': ['clamp(1.25rem, 1.5vw + 0.5rem, 1.875rem)', { lineHeight: '1.4', fontWeight: '600' }],
				'h4': ['clamp(1.125rem, 0.5vw + 0.875rem, 1.5rem)', { lineHeight: '1.4', fontWeight: '500' }],
				'body-lg': ['clamp(1.125rem, 0.5vw + 0.875rem, 1.25rem)', { lineHeight: '1.6' }],
				'body': ['clamp(1rem, 0.25vw + 0.875rem, 1.125rem)', { lineHeight: '1.6', fontWeight: '400' }],
				'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
				'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.02em' }],
			},
			boxShadow: {
				'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				'sm': '0 2px 8px 0 rgb(174 104 65 / 0.08)',
				'md': '0 4px 16px 0 rgb(174 104 65 / 0.12)',
				'lg': '0 8px 24px 0 rgb(174 104 65 / 0.16)',
				'xl': '0 12px 32px 0 rgb(174 104 65 / 0.20)',
				'2xl': '0 20px 48px 0 rgb(174 104 65 / 0.24)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'4xl': '2rem',
				'5xl': '2.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'progress': {
					'0%': { width: '0%' },
					'100%': { width: 'var(--progress-width)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'progress': 'progress 1s ease-out forwards',
				'shimmer': 'shimmer 2s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography")
	],
} satisfies Config;
