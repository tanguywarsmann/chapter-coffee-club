import React from "react";

export type LogoVreadPngProps = React.ImgHTMLAttributes<HTMLImageElement> & { size?: number };

export default function LogoVreadPng({ size = 32, className = "", ...rest }: LogoVreadPngProps) {
  const src = "/branding/vread-logo-512.png"; // PNG existant (≥512px), supposé avec fond transparent
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="VREAD logo"
      className={className}
      loading="eager"
      decoding="async"
      style={{ imageRendering: "auto" }}
      {...rest}
    />
  );
}
