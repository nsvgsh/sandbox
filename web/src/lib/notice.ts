export function showNotice(message: string): void {
  try {
    alert(message)
  } catch {
    // no-op
  }
}


