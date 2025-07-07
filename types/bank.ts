export interface Bank {
  kode_bank: string
  bank_id?: string
  nama_bank: string
  url_image?: string
  id?: number
  isActive?: boolean
  urutan?: number
}

export const banks: Bank[] = [
  {
    kode_bank: '008',
    bank_id: 'mandiri',
    nama_bank: 'BANK MANDIRI',
    url_image: 'https://api-mitra.linkqu.id/app/assets/008-6E25554009454B2C39C31A7DA1EA342E.png',
  },
  {
    kode_bank: '002',
    bank_id: 'bri',
    nama_bank: 'BANK BRI',
    url_image: 'https://api-mitra.linkqu.id/app/assets/002-1C775E5BCC0365D54B137C4B45D13619.png',
  },
  {
    kode_bank: '009',
    bank_id: 'bni',
    nama_bank: 'BANK BNI',
    url_image: 'https://api-mitra.linkqu.id/app/assets/009-B2B4E02C58AEFC11FBC88173F9B4DEF5.png',
  },
  {
    kode_bank: '014',
    nama_bank: 'BANK BCA',
    url_image: 'https://api-mitra.linkqu.id/app/assets/014-D8C6EBB4ADD1B0081587E6C0288E5793.png',
  },
  {
    kode_bank: '451',
    nama_bank: 'BANK BSI',
    url_image: 'https://api-mitra.linkqu.id/app/assets/451-116ECBFA3A8AF9A7CDF4E4518B4FE9F6.png',
  },
  {
    kode_bank: '011',
    nama_bank: 'BANK DANAMON',
    url_image: 'https://api-mitra.linkqu.id/app/assets/011-8263D8A10B42FF5F73CD7306F34DE7DC.png',
  },
  {
    kode_bank: '013',
    nama_bank: 'BANK PERMATA',
    id: 7,
    isActive: true,
    urutan: 8,
    url_image: 'https://api-mitra.linkqu.id/app/assets/013-F4309A2083E8BEF191E739494AE6DCA6.png',
  },
  {
    kode_bank: '016',
    nama_bank: 'MAYBANK INDONESIA',
    id: 9,
    isActive: true,
    urutan: 9,
    url_image: 'https://api-mitra.linkqu.id/app/assets/016-369DF0EB4D5FD6C501BB0B8521A897AF.png',
  },
  // ... potong sebagian untuk ringkas
];
