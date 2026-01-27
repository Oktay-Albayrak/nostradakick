"use client";

import { useRouter } from 'next/navigation';

interface Props {
  className?: string;
}

export default function ReturnButton({ className }: Props) {
  const router = useRouter();

  return (
    <button className={`globalReturnButton ${className || ""}`} type="button" onClick={() => router.back()}>
      ← Retour
    </button>
  );
}