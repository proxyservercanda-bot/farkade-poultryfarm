import { z } from 'zod';

export const ALLOWED_VILLAGES = [
  'गेवराई सेमी',
  'बाभुळगाव',
  'आळंद',
  'सिल्लोड',
  'भराडी',
  'वरखेडी',
  'भायगाव',
  'निल्लोड',
  'केर्हाळा',
  'कायगाव',
] as const;

export type VillageType = (typeof ALLOWED_VILLAGES)[number];

export const orderFormSchema = z.object({
  customerName: z.string().trim().min(2, { message: 'कृपया तुमचे पूर्ण नाव टाका.' }),
  mobileNumber: z.string().trim().regex(/^[6-9]\d{9}$/, { message: 'कृपया वैध १० अंकी मोबाईल नंबर टाका.' }),
  village: z.enum(ALLOWED_VILLAGES, {
    errorMap: () => ({ message: 'कृपया यादीतून तुमचे गाव निवडा.' }),
  }),
  fullAddress: z.string().trim().min(5, { message: 'कृपया तुमचा घर/दुकानाचा पूर्ण पत्ता टाका.' }),
  quantity: z.number().int().min(1).max(2000),
  paymentMethod: z.enum(['ONLINE', 'COD']),
  utrNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.paymentMethod === 'ONLINE') {
      return !!data.utrNumber && data.utrNumber.length >= 6;
    }
    return true;
  },
  {
    message: 'ऑनलाईन पेमेंटसाठी UTR नंबर टाकणे आवश्यक आहे.',
    path: ['utrNumber'],
  }
);

export function calculateOrderPrice(quantity: number) {
  const unitPrice = 17;
  const validQty = Math.max(0, Math.min(quantity || 0, 2000));
  const subtotal = validQty * unitPrice;
  const discountPercent = validQty >= 1000 ? 15 : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalAmount = subtotal - discountAmount;

  return {
    quantity: validQty,
    unitPrice,
    subtotal,
    discountPercent,
    discountAmount,
    finalAmount,
    deliveryCharge: 0,
  };
}
