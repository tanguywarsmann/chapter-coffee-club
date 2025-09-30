// SSR only helpers around sharp
export async function resizeBufferSSR(buf: Uint8Array, width: number) {
  if (!import.meta.env.SSR) throw new Error('resizeBufferSSR must run on SSR only');
  const sharp = (await import('sharp')).default;
  return await sharp(Buffer.from(buf)).resize(width).toBuffer();
}
