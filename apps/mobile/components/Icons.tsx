import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

// 🏠 Modern Minimalist Home Icon
export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = '#1A1A1A', focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.182L12 3L21 10.182V20A1 1 0 0120 21H15V14H9V21H4A1 1 0 013 20V10.182Z"
      stroke={color}
      strokeWidth={focused ? 2.3 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? `${color}15` : 'none'}
    />
  </Svg>
);

// 🔄 Modern Revolving Tontine / Vault Icon
export const TontineIcon: React.FC<IconProps> = ({ size = 24, color = '#1A1A1A', focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12A9 9 0 006 5.3L3 8M3 3V8H8"
      stroke={color}
      strokeWidth={focused ? 2.3 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 12A9 9 0 0018 18.7L21 16M21 21V16H16"
      stroke={color}
      strokeWidth={focused ? 2.3 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="2.5" fill={color} />
  </Svg>
);

// 👤 Modern Sleek User Profile Icon
export const UserIcon: React.FC<IconProps> = ({ size = 24, color = '#1A1A1A', focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21"
      stroke={color}
      strokeWidth={focused ? 2.3 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth={focused ? 2.3 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? `${color}20` : 'none'}
    />
  </Svg>
);

// 🛡️ Modern Shield Check Icon (KYC)
export const ShieldCheckIcon: React.FC<IconProps> = ({ size = 24, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 🔔 Notification Bell Icon
export const BellIcon: React.FC<IconProps> = ({ size = 24, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21S18 15 18 8Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21A2 2 0 0110.27 21"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 🚪 Sleek LogOut Icon
export const LogOutIcon: React.FC<IconProps> = ({ size = 24, color = '#DC2626' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5A2 2 0 013 19V5A2 2 0 015 3H9"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 17L21 12L16 7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 12H9"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 💰 Wallet / Savings Icon
export const WalletIcon: React.FC<IconProps> = ({ size = 24, color = '#04252D' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="3"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 12H18"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </Svg>
);

// 💳 Credit Card Icon
export const CreditCardIcon: React.FC<IconProps> = ({ size = 24, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="3"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 10H22"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

// 💬 WhatsApp Icon
export const WhatsAppIcon: React.FC<IconProps> = ({ size = 24, color = '#25D366' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
      fill={color}
    />
    <Path
      d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.975-1.39A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.63 0-3.15-.436-4.47-1.192l-.32-.185-2.955.825.84-2.885-.205-.327A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"
      fill={color}
    />
  </Svg>
);

// 📱 Mobile Phone Icon
export const SmartphoneIcon: React.FC<IconProps> = ({ size = 24, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="5"
      y="2"
      width="14"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 18H12.01"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </Svg>
);

// ➕ Plus Icon
export const PlusIcon: React.FC<IconProps> = ({ size = 20, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 🤝 Handshake / Join Icon
export const JoinIcon: React.FC<IconProps> = ({ size = 20, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 16L8 13L13 8L16 11M16 11L19 8L16 5M16 11L13 14M8 13L5 16M8 13L11 10"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 16L15 19L10 14"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 📅 Calendar Icon (Natt Classique)
export const CalendarIcon: React.FC<IconProps> = ({ size = 22, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="4" stroke={color} strokeWidth={1.8} />
    <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// ⚡ Bolt / Fast Icon (Tekk Tegui)
export const BoltIcon: React.FC<IconProps> = ({ size = 22, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ✨ Sparkles / Event Icon (Natt Événementiel)
export const SparklesIcon: React.FC<IconProps> = ({ size = 22, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ↙️ Arrow Down Left (Payout / Incoming Money)
export const ArrowDownLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 7L7 17M7 17H17M7 17V7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ↗️ Arrow Up Right (Contribution / Outgoing Money)
export const ArrowUpRightIcon: React.FC<IconProps> = ({ size = 20, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 17L17 7M17 7H7M17 7V17"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 📄 Receipt / Reçu Icon
export const ReceiptIcon: React.FC<IconProps> = ({ size = 20, color = '#1A1A1A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 2V22L7 20L10 22L13 20L16 22L19 20L22 22V2H4Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 7H16M8 11H16M8 15H13"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ⚙️ Settings / Engrenage Icon
export const SettingsIcon: React.FC<IconProps> = ({ size = 22, color = '#0F172A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15A1.65 1.65 0 0020 12a1.65 1.65 0 00-.6-3l.1-.9a2 2 0 00-2-2l-.9.1A1.65 1.65 0 0015 4.6l-.9-.1a2 2 0 00-2-2h-2a2 2 0 00-2 2l-.9.1A1.65 1.65 0 006 4.6l-.9-.1a2 2 0 00-2 2l.1.9A1.65 1.65 0 004 12a1.65 1.65 0 00.6 3l-.1.9a2 2 0 002 2l.9-.1A1.65 1.65 0 009 19.4l.9.1a2 2 0 002 2h2a2 2 0 002-2l.9-.1a1.65 1.65 0 001.6-1.4l.9.1a2 2 0 002-2l-.1-.9z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
