// Partage de fichiers : feuille de partage du téléphone (Drive, mail, WhatsApp…) quand c'est possible,
// sinon téléchargement classique.
export interface OutFile { name: string; blob: Blob }

export async function shareOrDownload(files: OutFile[], title: string): Promise<'partage' | 'telecharge' | 'annule'> {
  const list = files.map((f) => new File([f.blob], f.name, { type: f.blob.type || 'application/octet-stream' }));
  if (navigator.canShare?.({ files: list })) {
    try {
      await navigator.share({ files: list, title });
      return 'partage';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'annule';
      // sinon : on retombe sur le téléchargement
    }
  }
  for (const f of files) {
    const url = URL.createObjectURL(f.blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: f.name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  return 'telecharge';
}

export const stamp = () => new Date().toISOString().slice(0, 10);
