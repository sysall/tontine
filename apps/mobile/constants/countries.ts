export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  placeholder?: string;
  maxLength?: number;
}

export const DEFAULT_COUNTRY: Country = {
  name: 'Sénégal',
  code: 'SN',
  dialCode: '+221',
  flag: '🇸🇳',
  placeholder: '77 123 45 67',
  maxLength: 9,
};

export const COUNTRIES: Country[] = [
  // West & Central Africa (Priority region)
  DEFAULT_COUNTRY,
  { name: 'Côte d’Ivoire', code: 'CI', dialCode: '+225', flag: '🇨🇮', placeholder: '07 01 23 45 67', maxLength: 10 },
  { name: 'Mali', code: 'ML', dialCode: '+223', flag: '🇲🇱', placeholder: '70 12 34 56', maxLength: 8 },
  { name: 'Guinée', code: 'GN', dialCode: '+224', flag: '🇬🇳', placeholder: '620 12 34 56', maxLength: 9 },
  { name: 'Mauritanie', code: 'MR', dialCode: '+222', flag: '🇲🇷', placeholder: '36 12 34 56', maxLength: 8 },
  { name: 'Gambie', code: 'GM', dialCode: '+220', flag: '🇬🇲', placeholder: '701 2345', maxLength: 7 },
  { name: 'Burkina Faso', code: 'BF', dialCode: '+226', flag: '🇧🇫', placeholder: '70 12 34 56', maxLength: 8 },
  { name: 'Bénin', code: 'BJ', dialCode: '+229', flag: '🇧🇯', placeholder: '97 12 34 56', maxLength: 8 },
  { name: 'Togo', code: 'TG', dialCode: '+228', flag: '🇹🇬', placeholder: '90 12 34 56', maxLength: 8 },
  { name: 'Niger', code: 'NE', dialCode: '+227', flag: '🇳🇪', placeholder: '90 12 34 56', maxLength: 8 },
  { name: 'Cameroun', code: 'CM', dialCode: '+237', flag: '🇨🇲', placeholder: '6 91 23 45 67', maxLength: 9 },
  { name: 'Gabon', code: 'GA', dialCode: '+241', flag: '🇬🇦', placeholder: '06 12 34 56', maxLength: 8 },
  { name: 'Congo (Brazzaville)', code: 'CG', dialCode: '+242', flag: '🇨🇬', placeholder: '06 123 4567', maxLength: 9 },
  { name: 'RD Congo (Kinshasa)', code: 'CD', dialCode: '+243', flag: '🇨🇩', placeholder: '81 123 4567', maxLength: 9 },
  { name: 'Tchad', code: 'TD', dialCode: '+235', flag: '🇹🇩', placeholder: '66 12 34 56', maxLength: 8 },
  { name: 'Guinée-Bissau', code: 'GW', dialCode: '+245', flag: '🇬🇼', placeholder: '955 12 34', maxLength: 7 },
  { name: 'Cap-Vert', code: 'CV', dialCode: '+238', flag: '🇨🇻', placeholder: '991 12 34', maxLength: 7 },
  { name: 'Sierra Leone', code: 'SL', dialCode: '+232', flag: '🇸🇱', placeholder: '76 123 456', maxLength: 8 },
  { name: 'Liberia', code: 'LR', dialCode: '+231', flag: '🇱🇷', placeholder: '77 123 4567', maxLength: 8 },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭', placeholder: '24 123 4567', maxLength: 9 },
  { name: 'Nigéria', code: 'NG', dialCode: '+234', flag: '🇳🇬', placeholder: '802 123 4567', maxLength: 10 },
  { name: 'Guinée équatoriale', code: 'GQ', dialCode: '+240', flag: '🇬🇶', placeholder: '222 12 34 56', maxLength: 9 },
  { name: 'Centrafrique', code: 'CF', dialCode: '+236', flag: '🇨🇫', placeholder: '70 12 34 56', maxLength: 8 },

  // North Africa
  { name: 'Maroc', code: 'MA', dialCode: '+212', flag: '🇲🇦', placeholder: '6 12 34 56 78', maxLength: 9 },
  { name: 'Algérie', code: 'DZ', dialCode: '+213', flag: '🇩🇿', placeholder: '551 23 45 67', maxLength: 9 },
  { name: 'Tunisie', code: 'TN', dialCode: '+216', flag: '🇹🇳', placeholder: '20 123 456', maxLength: 8 },
  { name: 'Égypte', code: 'EG', dialCode: '+20', flag: '🇪🇬', placeholder: '10 1234 5678', maxLength: 10 },

  // East & Southern Africa
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼', placeholder: '788 123 456', maxLength: 9 },
  { name: 'Burundi', code: 'BI', dialCode: '+257', flag: '🇧🇮', placeholder: '79 123 456', maxLength: 8 },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', placeholder: '712 345 678', maxLength: 9 },
  { name: 'Tanzanie', code: 'TZ', dialCode: '+255', flag: '🇹🇿', placeholder: '712 345 678', maxLength: 9 },
  { name: 'Ouganda', code: 'UG', dialCode: '+256', flag: '🇺🇬', placeholder: '772 123 456', maxLength: 9 },
  { name: 'Éthiopie', code: 'ET', dialCode: '+251', flag: '🇪🇹', placeholder: '91 123 4567', maxLength: 9 },
  { name: 'Madagascar', code: 'MG', dialCode: '+261', flag: '🇲🇬', placeholder: '32 12 345 67', maxLength: 9 },
  { name: 'Maurice', code: 'MU', dialCode: '+230', flag: '🇲🇺', placeholder: '5251 2345', maxLength: 8 },
  { name: 'Comores', code: 'KM', dialCode: '+269', flag: '🇰🇲', placeholder: '321 23 45', maxLength: 7 },
  { name: 'Djibouti', code: 'DJ', dialCode: '+253', flag: '🇩🇯', placeholder: '77 12 34 56', maxLength: 8 },
  { name: 'Afrique du Sud', code: 'ZA', dialCode: '+27', flag: '🇿🇦', placeholder: '71 123 4567', maxLength: 9 },
  { name: 'Angola', code: 'AO', dialCode: '+244', flag: '🇦🇴', placeholder: '923 123 456', maxLength: 9 },
  { name: 'Mozambique', code: 'MZ', dialCode: '+258', flag: '🇲🇿', placeholder: '84 123 4567', maxLength: 9 },

  // Europe & Major Diaspora
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78', maxLength: 9 },
  { name: 'Belgique', code: 'BE', dialCode: '+32', flag: '🇧🇪', placeholder: '470 12 34 56', maxLength: 9 },
  { name: 'Espagne', code: 'ES', dialCode: '+34', flag: '🇪🇸', placeholder: '612 345 678', maxLength: 9 },
  { name: 'Italie', code: 'IT', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789', maxLength: 10 },
  { name: 'Allemagne', code: 'DE', dialCode: '+49', flag: '🇩🇪', placeholder: '151 23456789', maxLength: 11 },
  { name: 'Royaume-Uni', code: 'GB', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456', maxLength: 10 },
  { name: 'Suisse', code: 'CH', dialCode: '+41', flag: '🇨🇭', placeholder: '78 123 45 67', maxLength: 9 },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹', placeholder: '912 345 678', maxLength: 9 },
  { name: 'Pays-Bas', code: 'NL', dialCode: '+31', flag: '🇳🇱', placeholder: '6 12345678', maxLength: 9 },
  { name: 'Luxembourg', code: 'LU', dialCode: '+352', flag: '🇱🇺', placeholder: '621 123 456', maxLength: 9 },
  { name: 'Suède', code: 'SE', dialCode: '+46', flag: '🇸🇪', placeholder: '70 123 45 67', maxLength: 9 },
  { name: 'Norvège', code: 'NO', dialCode: '+47', flag: '🇳🇴', placeholder: '412 34 567', maxLength: 8 },
  { name: 'Danemark', code: 'DK', dialCode: '+45', flag: '🇩🇰', placeholder: '20 12 34 56', maxLength: 8 },
  { name: 'Turquie', code: 'TR', dialCode: '+90', flag: '🇹🇷', placeholder: '501 234 5678', maxLength: 10 },

  // Americas
  { name: 'États-Unis', code: 'US', dialCode: '+1', flag: '🇺🇸', placeholder: '202 555 0123', maxLength: 10 },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', placeholder: '416 555 0123', maxLength: 10 },
  { name: 'Brésil', code: 'BR', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234 5678', maxLength: 11 },
  { name: 'Haïti', code: 'HT', dialCode: '+509', flag: '🇭🇹', placeholder: '34 12 3456', maxLength: 8 },

  // Middle East & Asia
  { name: 'Émirats Arabes Unis', code: 'AE', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567', maxLength: 9 },
  { name: 'Arabie Saoudite', code: 'SA', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567', maxLength: 9 },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦', placeholder: '3312 3456', maxLength: 8 },
  { name: 'Chine', code: 'CN', dialCode: '+86', flag: '🇨🇳', placeholder: '138 0013 8000', maxLength: 11 },
  { name: 'Inde', code: 'IN', dialCode: '+91', flag: '🇮🇳', placeholder: '98765 43210', maxLength: 10 },
  { name: 'Japon', code: 'JP', dialCode: '+81', flag: '🇯🇵', placeholder: '90 1234 5678', maxLength: 10 },
  { name: 'Australie', code: 'AU', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678', maxLength: 9 },
];
