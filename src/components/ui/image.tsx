import { forwardRef, type ImgHTMLAttributes, useEffect, useState } from 'react'
import './image.css'

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x300?text=Image+Not+Available";

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  originWidth?: number
  originHeight?: number
  focalPointX?: number
  focalPointY?: number
}


export const Image = forwardRef<HTMLImageElement, ImageProps>(({ src, ...props }, ref) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src)

  useEffect(() => {
    // If src prop changes, update the imgSrc state
    setImgSrc((prev) => {
      if (prev !== src) {
        return src
      }
      return prev
    })
  }, [src])

  if (!src) {
    return <div data-empty-image ref={ref as any} {...props} />
  }

  return <img
    ref={ref}
    src={imgSrc || FALLBACK_IMAGE_URL}
    onError={() => setImgSrc(FALLBACK_IMAGE_URL)}
    {...props}
  />
})
Image.displayName = 'Image'
