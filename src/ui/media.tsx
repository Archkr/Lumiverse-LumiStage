import { useEffect, useState } from "preact/hooks";
import { Icon } from "./icons";

export function Media(props: {
  src: string | null;
  kind: "image" | "video";
  label: string;
  class?: string;
  contain?: boolean;
}) {
  if (!props.src) {
    return <div class={`ls-media-fallback ${props.class ?? ""}`}><Icon name="image" size={22} /><span>Media unavailable</span></div>;
  }
  if (props.kind === "video") {
    return <video class={props.class} data-fit={props.contain ? "contain" : "cover"} src={props.src} muted loop playsInline autoPlay aria-label={props.label} />;
  }
  return <img class={props.class} data-fit={props.contain ? "contain" : "cover"} src={props.src} alt={props.label} loading="lazy" draggable={false} />;
}

export function useStableMedia(src: string | null, kind: "image" | "video") {
  const [displayed, setDisplayed] = useState<string | null>(src);
  useEffect(() => {
    if (!src || src === displayed) return;
    if (kind === "image") {
      const image = new Image();
      image.onload = () => setDisplayed(src);
      image.src = src;
      return () => { image.onload = null; };
    }
    const video = document.createElement("video");
    video.muted = true;
    video.oncanplay = () => setDisplayed(src);
    video.src = src;
    video.load();
    return () => { video.oncanplay = null; video.src = ""; };
  }, [src, kind, displayed]);
  return displayed;
}
