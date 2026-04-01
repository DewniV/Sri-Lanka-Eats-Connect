'use client';
import { usePathname } from 'next/navigation';
import { ChatWidget } from './ChatWidget';

// Pages where the chatbot should NOT appear
const HIDDEN_PATHS = ['/login', '/register'];

export function ChatWidgetWrapper() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.includes(pathname)) return null;
  return <ChatWidget />;
}
