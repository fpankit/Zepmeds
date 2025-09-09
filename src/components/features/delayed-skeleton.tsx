
"use client";

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DelayedSkeletonProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
  delay?: number;
}

export function DelayedSkeleton({ isLoading, children, skeleton, delay = 100 }: DelayedSkeletonProps) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowSkeleton(true);
      }, delay);
    } else {
      setShowSkeleton(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLoading, delay]);

  if (!isLoading) {
    return <>{children}</>;
  }

  if (showSkeleton) {
    return <>{skeleton}</>;
  }

  return null;
}
