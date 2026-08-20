import Image from "next/image"

import type { WritingStoryImage } from "@/types/writing"

interface WritingStoryImageProps {
  image: WritingStoryImage
}

/**
 * Render một trong 3 tấm ảnh minh hoạ của đề Viết.
 * Slot chưa có asset thu hoạch (`src === null`) render placeholder được đánh dấu rõ
 * (Class D — media TODO), không lén thay bằng ảnh bịa.
 */
export function WritingStoryImage({ image }: WritingStoryImageProps): React.ReactElement {
  if (!image.src) {
    return (
      <div
        role="img"
        aria-label={image.alt}
        className="relative aspect-[4/3] w-full rounded-xl border-2 border-dashed border-amber-300/60 bg-amber-100/70 flex items-center justify-center"
      >
        <div className="text-center px-3 py-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-amber-800">
            TODO — media: {image.slot}
          </span>
          <span className="block mt-1 text-[11px] text-amber-700/80">{image.alt}</span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={640}
      height={480}
      className="w-full rounded-xl object-cover shadow-md"
    />
  )
}