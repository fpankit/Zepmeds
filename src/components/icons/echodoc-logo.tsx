import type { SVGProps } from 'react';

export function EchoDocLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M28 6H4V26H28V6Z"
        fill="#F0F4F9"
        stroke="#CBD5E1"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M28 6L16 16L4 6"
        stroke="#CBD5E1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 16H9V20H13V16Z"
        fill="#EF4444"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16 13L20 9"
        stroke="#475569"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 16H19V20H23V16Z"
        fill="#3B82F6"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
