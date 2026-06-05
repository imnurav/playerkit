/**
 * Safely copies text to the clipboard.
 * Works in secure contexts (HTTPS/localhost) using the modern navigator.clipboard API,
 * and falls back to a temporary textarea element in insecure contexts (HTTP on network IPs).
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (
    navigator.clipboard &&
    typeof window !== "undefined" &&
    window.isSecureContext
  ) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for non-secure contexts (HTTP on network IP)
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise<void>((resolve, reject) => {
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          resolve();
        } else {
          reject(new Error("Failed to copy text"));
        }
      } catch (err) {
        reject(err);
      } finally {
        textArea.remove();
      }
    });
  }
}
