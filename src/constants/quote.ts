import type { CustomerDetailsFormData, TravelerType } from '@/types/quote';

export const benefits = [
  // {
  //   label: 'New Policy',
  //   icon: 'trip',
  //   source: require('../../assets/images/calendar.png'),
  // },
  {
    label: 'My Business',
    icon: 'medical',
    source: require('../../assets/images/all-policy.png'),
  },
  {
    label: 'My Earnings',
    icon: 'baggage',
    source: require('../../assets/images/commission.png'),
  },
  // {
  //   label: 'New\Lead',
  //   icon: 'support',
  //   source: require('../../assets/images/assist.png'),
  // },
] as const;

export const cities = [
  'Pune',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Hyderabad',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  
];

export const travelerTypes: TravelerType[] = ['Adults'];

export const genderOptions = ['Male', 'Female', 'Other'] as const;

export const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'] as const;

export const customerFieldConfig: Array<{
  key: keyof CustomerDetailsFormData;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'characters';
}> = [
  {
    key: 'panNo',
    label: 'PAN No',
    placeholder: 'Enter PAN number',
    autoCapitalize: 'characters',
  },
  {
    key: 'dob',
    label: 'DOB',
    placeholder: 'DD/MM/YYYY',
    keyboardType: 'number-pad',
  },
  {
    key: 'phone',
    label: 'Phone',
    placeholder: 'Enter phone number',
    keyboardType: 'phone-pad',
  },
  {
    key: 'name',
    label: 'Name',
    placeholder: 'Enter full name',
    autoCapitalize: 'words',
  },
  {
    key: 'email',
    label: 'Email',
    placeholder: 'Enter email address',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  {
    key: 'gender',
    label: 'Gender',
    placeholder: 'Enter gender',
    autoCapitalize: 'words',
  },
  {
    key: 'pinCode',
    label: 'PIN Code',
    placeholder: 'Enter PIN code',
    keyboardType: 'number-pad',
  },
  {
    key: 'state',
    label: 'State',
    placeholder: 'Enter state',
    autoCapitalize: 'words',
  }, 
  {
    key: 'city',
    label: 'City',
    placeholder: 'Enter city',
    autoCapitalize: 'words',
  },
   {
    key: 'streetName',
    label: 'Street Name',
    placeholder: 'Enter street name',
    autoCapitalize: 'words',
  },  
  {
    key: 'maritalStatus',
    label: 'Marital Status',
    placeholder: 'Enter marital status',
    autoCapitalize: 'words',
  },
  {
    key: 'nomineeName',
    label: 'Nominee Name',
    placeholder: 'Enter nominee name',
    autoCapitalize: 'words',
  },
];
