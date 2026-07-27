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
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    if (!src) {
      setDisplayed(null);
      setFailed(null);
      return;
    }
    if (src === failed) {
      setDisplayed(null);
      return;
    }
    if (src === displayed) return;
    if (kind === "image") {
      const image = new Image();
      image.onload = () => { setFailed(null); setDisplayed(src); };
      image.onerror = () => { setFailed(src); setDisplayed(null); };
      image.src = src;
      return () => { image.onload = null; image.onerror = null; };
    }
    const video = document.createElement("video");
    video.muted = true;
    video.oncanplay = () => { setFailed(null); setDisplayed(src); };
    video.onerror = () => { setFailed(src); setDisplayed(null); };
    video.src = src;
    video.load();
    return () => { video.oncanplay = null; video.onerror = null; video.src = ""; };
  }, [src, kind, displayed, failed]);
  return {
    src: displayed,
    clear: () => {
      setFailed(src);
      setDisplayed(null);
    },
  };
}
