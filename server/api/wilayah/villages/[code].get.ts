// server/api/wilayah/villages/[code].get.ts
export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  
  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'District code is required'
    })
  }
  
  try {
    const data = await $fetch(`https://wilayah.id/api/villages/${code}.json`)
    return data
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch villages data'
    })
  }
})