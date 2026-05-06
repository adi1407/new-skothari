/** Client-only share targets — keep out of server bundles */

export function shareToTwitter(title: string, url: string): void {
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    "_blank",
    "width=600,height=400"
  );
}

export function shareToFacebook(url: string): void {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    "_blank",
    "width=600,height=400"
  );
}

export function shareToWhatsApp(title: string, url: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`, "_blank");
}

export async function nativeShare(title: string, url: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch {
      /* cancelled */
    }
  }
}
