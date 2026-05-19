import type { ImgHTMLAttributes } from 'react';
import { assetUrl } from '@/lib/app-path';

type AssetImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
};

export default function AssetImage({ src, ...props }: AssetImageProps) {
  if (!src) return null;
  return <img src={assetUrl(src)} {...props} />;
}
