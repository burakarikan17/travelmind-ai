export async function getExchangeRate(from, to) {
  if (!from || !to || from === to) return 1

  const url = `https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`
  const response = await fetch(url)

  if (!response.ok) throw new Error('EXCHANGE_RATE_FETCH_FAILED')

  const data = await response.json()
  return data.rates?.[to] ?? null
}