// server/api/wilayah/provinces.get.ts
export default defineEventHandler(async (event) => {
  try {
    const data = await $fetch('https://wilayah.id/api/provinces.json')
    return data
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch provinces data'
    })
  }
})
