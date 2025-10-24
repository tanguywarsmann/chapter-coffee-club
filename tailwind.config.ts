
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
				// Reed brand colors - Sienne Brûlée palette
				reed: {
					primary: '#AE6841', // Sienne Brûlée principale
					secondary: '#DFC5A6', // Couleur complémentaire
					light: '#F0E6D8', // Version très claire
					dark: '#8B4A2E', // Version plus foncée
					darker: '#6B3A23' // Version très foncée
				},
				coffee: {
					light: '#E6D7C3',
					medium: '#C8B6A6',
					dark: '#A0522D',
					darker: '#8B4513',
				},
				chocolate: {
					light: '#D2B48C',
					medium: '#A67B5B',
					dark: '#6F4E37',
					darkest: '#3B2F2F'
				},
				logo: {
					background: '#B36A38', // Couleur ajustée pour mieux correspondre au marque-page
					text: '#F0E6C9', // Couleur du texte ajustée pour correspondre au marque-page
					accent: '#D4C6A1'  // Couleur d'accent basée sur la bordure du marque-page
				}
			},
			fontSize: {
				// Système typographique professionnel optimisé
				'hero': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.01em' }],
				'h1': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0' }],
				'h2': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0' }],
				'h3': ['clamp(1.25rem, 2.5vw, 2rem)', { lineHeight: '1.4', fontWeight: '600' }],
				'h4': ['clamp(1.125rem, 2vw, 1.5rem)', { lineHeight: '1.4', fontWeight: '500' }],
				'body': ['clamp(1rem, 1.5vw, 1.125rem)', { lineHeight: '1.6', fontWeight: '400' }],
				'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
				'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.02em' }],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'progress': 'progress 1s ease-out forwards'
			},
			fontFamily: {
				serif: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography")
	],
} satisfies Config;
