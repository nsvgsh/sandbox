export function formatAssetLabel(raw: string): string {
  let text = String(raw)
  // Insert thousands separators for integer part of any number, preserve decimals
  text = text.replace(/\d[\d\s]*(?:\.\d+)?/g, (m) => {
    const cleaned = m.replace(/\s+/g, '')
    const parts = cleaned.split('.')
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.length > 1 ? intPart + '.' + parts[1] : intPart
  })
  // Ensure single space between number and trailing asset name
  text = text.replace(/(\d(?:,\d{3})*(?:\.\d+)?)[\s]*(?=[A-Za-z])/g, '$1 ')
  return text
}


