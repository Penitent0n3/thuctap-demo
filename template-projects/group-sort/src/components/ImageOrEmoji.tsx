import { isEmoji } from "../utils";

interface ImageOrEmojiProps {
  imagePath: string;
  alt: string;
  size?: "large" | "medium" | "small" | "tiny";
}

export const ImageOrEmoji: React.FC<ImageOrEmojiProps> = ({
  imagePath,
  alt,
  size = "large",
}) => {
  if (isEmoji(imagePath)) {
    const sizeClass =
      size === "large"
        ? "text-7xl"
        : size === "medium"
          ? "text-6xl"
          : size === "small"
            ? "text-5xl"
            : "text-4xl";
    return (
      <span className={`${sizeClass} pointer-events-none select-none`}>
        {imagePath}
      </span>
    );
  }
  const sizeClass =
    size === "large" ? "w-24 h-24" : size === "medium" ? "w-24 h-24" : size === "small" ? "w-20 h-20" : "w-16 h-16";
  return (
    <img src={imagePath} alt={alt} className={`${sizeClass} object-contain`} />
  );
};
