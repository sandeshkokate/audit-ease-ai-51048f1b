import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | AuditEase AI`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
