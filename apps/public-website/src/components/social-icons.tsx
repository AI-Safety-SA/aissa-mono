import type { ComponentType, SVGProps } from "react";

export type SocialIcon =
  | { kind: "image"; src: string }
  | { kind: "inline"; Icon: ComponentType<SVGProps<SVGSVGElement>> };

export function LumaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 133 134" fill="none" {...props}>
      <path
        d="M133 67C96.282 67 66.5 36.994 66.5 0c0 36.994-29.782 67-66.5 67 36.718 0 66.5 30.006 66.5 67 0-36.994 29.782-67 66.5-67"
        fill="currentColor"
      />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1200 1227" fill="none" {...props}>
      <path
        d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894L144.011 79.694h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
        fill="currentColor"
      />
    </svg>
  );
}
