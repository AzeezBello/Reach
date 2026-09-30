import Image from "next/image";

/**
 * A photo that fills its (relatively positioned) parent.
 * Always pass `sizes` so the browser downloads a sensibly sized variant.
 */
export function Photo({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}

/** A framed photo with a fixed aspect ratio. */
export function PhotoFrame({
  src,
  alt,
  sizes,
  priority = false,
  aspect = "aspect-[4/3]",
  className = "",
  children,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  aspect?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-slate-100 ${aspect} ${className}`}
    >
      <Photo src={src} alt={alt} sizes={sizes} priority={priority} />
      {children}
    </div>
  );
}
