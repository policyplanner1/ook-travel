export type GalleryItem = {
  id: string;
  title: string;
  type: 'image' | 'pdf';
  fileName: string;
  source: number | string;
};

export const galleryItems: GalleryItem[] = [
  {
    id: 'join-us',
    title: 'Join Us',
    type: 'image',
    fileName: 'join-us.jpeg',
    source: require('../../assets/images/join-us.jpeg'),
  },
  {
    id: 'onepager-1',
    title: 'Bus Operators One Pager',
    type: 'image',
    fileName: 'onepager-1.jpeg',
    source: require('../../assets/images/onepager-1.jpeg'),
  },
  {
    id: 'onepager-2',
    title: 'Domestic Travel Insurance One Pager',
    type: 'image',
    fileName: 'onepager-2.png',
    source: require('../../assets/images/onepager-2.png'),
  },
  {
    id: 'travel-insurance-onepager',
    title: 'Travel Insurance One Pager',
    type: 'pdf',
    fileName: 'travel-insurance-onepager.pdf',
    source: 'https://policyplanner.com/assets/brochures/travel-insurance-onepager.pdf',
  },
  // {
  //   id: 'bharat-bhraman-brochure',
  //   title: 'Bharat Bhraman Brochure',
  //   type: 'pdf',
  //   fileName: 'Bharat_Bhraman_Brochure.pdf',
  //   source: 'https://policyplanner.com/assets/brochures/Bharat_Bhraman_Brochure.pdf',
  // },
];
