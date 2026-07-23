export type GalleryItem = {
  id: string;
  title: string;
  type: 'image' | 'pdf' | 'xlsx';
  fileName: string;
  source: number | string;
};

export const galleryItems: GalleryItem[] = [
   {
    id: 'bulk-policy-request-template',
    title: 'Bulk Policy Request Template',
    type: 'xlsx',
    fileName: 'Bulk_Policy_Request_Template.xlsx',
    source: 'https://api.ooktravel.in/uploads/gallery/Bulk_Policy_Request_Template.xlsx',
  },
  {
    id: 'join-us',
    title: 'Join Us',
    type: 'image',
    fileName: 'join-us.jpeg',
    source: 'https://api.ooktravel.in/uploads/gallery/join-us.jpeg',
  },
  {
    id: 'onepager-1',
    title: 'Bus Operators One Pager',
    type: 'image',
    fileName: 'onepager-1.jpeg',
    source: 'https://api.ooktravel.in/uploads/gallery/onepager-1.jpeg',
  },
  {
    id: 'onepager-2',
    title: 'Domestic Travel Insurance One Pager',
    type: 'image',
    fileName: 'onepager-2.png',
    source: 'https://api.ooktravel.in/uploads/gallery/onepager-2.png',
  },
  {
    id: 'travel-insurance-onepager',
    title: 'Travel Insurance One Pager',
    type: 'pdf',
    fileName: 'travel-insurance-onepager.pdf',
    source: 'https://policyplanner.com/assets/brochures/travel-insurance-onepager.pdf',
  },
 
];
