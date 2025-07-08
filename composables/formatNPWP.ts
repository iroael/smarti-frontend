// composables/formatNPWP.ts
export const formatNPWP = (value: string): string => {
  // Hapus semua karakter non-digit
  const digits = value.replace(/\D/g, '').slice(0, 15)

  // Jika tidak ada digit, return empty string
  if (!digits) return ''

  // Format dengan pola XX.XXX.XXX.X-XXX.XXX
  if (digits.length <= 2) {
    return digits
  } else if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`
  } else if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  } else if (digits.length <= 9) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8)}`
  } else if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9)}`
  } else {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12)}`
  }
}

// Fungsi untuk validasi NPWP
export const validateNPWP = (npwpValue: string): string[] => {
  const errors: string[] = []
  
  // Hapus semua karakter non-digit untuk validasi
  const cleanedValue = npwpValue.replace(/\D/g, '')
  
  // Validasi panjang
  if (!cleanedValue) {
    errors.push('Nomor NPWP harus diisi')
    return errors
  }
  
  if (cleanedValue.length < 15) {
    errors.push('Nomor NPWP harus 15 digit')
    return errors
  }
  
  if (cleanedValue.length > 15) {
    errors.push('Nomor NPWP maksimal 15 digit')
    return errors
  }
  
  // Validasi format (harus ada 15 digit angka)
  if (!/^\d{15}$/.test(cleanedValue)) {
    errors.push('Nomor NPWP harus berupa angka')
    return errors
  }
  
  // Validasi jenis wajib pajak (2 digit pertama)
  const jenisWP = cleanedValue.substring(0, 2)
  const validJenisWP = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '31', '32', '33', '34', '35']
  
  if (!validJenisWP.includes(jenisWP)) {
    errors.push('Jenis wajib pajak tidak valid')
  }
  
  // Validasi check digit (digit ke-9)
  const checkDigit = parseInt(cleanedValue.charAt(8))
  const calculatedCheckDigit = calculateCheckDigit(cleanedValue)
  
  if (checkDigit !== calculatedCheckDigit) {
    errors.push('Check digit NPWP tidak valid')
  }
  
  return errors
}

// Fungsi untuk menghitung check digit
const calculateCheckDigit = (npwpNumber: string): number => {
  const weights = [1, 2, 3, 4, 5, 6, 7, 8]
  let sum = 0
  
  // Hitung untuk 8 digit pertama
  for (let i = 0; i < 8; i++) {
    sum += parseInt(npwpNumber.charAt(i)) * weights[i]
  }
  
  const remainder = sum % 11
  
  if (remainder < 2) {
    return remainder
  } else {
    return 11 - remainder
  }
}

// Fungsi untuk mengecek apakah NPWP valid
export const isValidNPWP = (npwpValue: string): boolean => {
  return validateNPWP(npwpValue).length === 0
}

// Fungsi untuk membersihkan NPWP (hanya angka)
export const cleanNPWP = (npwpValue: string): string => {
  return npwpValue.replace(/\D/g, '')
}