
export default defineEventHandler( async (event) => {
const {code} = event.context.params
//caso code não seja um numero retorna erro

if (!Number(code)) {
    throw createError({
      statusCode: 400
    })
  }
return {code}
}
)