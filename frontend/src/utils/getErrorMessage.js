const FALLBACK = 'कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।'

export default function getErrorMessage(error, fallback = FALLBACK) {
  if (!error?.isAxiosError) return error?.message || fallback

  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'सर्वर से जवाब आने में देर हो रही है। कृपया दोबारा कोशिश करें।'
    }
    return 'सर्वर से संपर्क नहीं हो पाया। इंटरनेट जांचें।'
  }

  const data = error.response.data

  if (typeof data?.message === 'string' && data.message) return data.message

  const detail = data?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0]
    const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : ''
    return field ? `${field}: ${first.msg}` : first.msg || fallback
  }

  return fallback
}
