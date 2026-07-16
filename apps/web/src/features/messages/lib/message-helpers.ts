import type { MessageDto } from "@repo/shared";

export function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (messageDate.getTime() === today.getTime()) {
    return "TODAY";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.getTime() === yesterday.getTime()) {
    return "YESTERDAY";
  }

  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export function shouldShowDateSeparator(
  current: MessageDto,
  previous: MessageDto | undefined,
): boolean {
  if (!previous) return true;

  const currentDate = new Date(current.createdAt);
  const previousDate = new Date(previous.createdAt);

  return (
    currentDate.getFullYear() !== previousDate.getFullYear() ||
    currentDate.getMonth() !== previousDate.getMonth() ||
    currentDate.getDate() !== previousDate.getDate()
  );
}

export function shouldShowSenderName(
  current: MessageDto,
  previous: MessageDto | undefined,
  isOwn: boolean,
): boolean {
  if (isOwn) return false;
  if (!previous) return true;
  if (previous.senderId !== current.senderId) return true;

  const currentDate = new Date(current.createdAt);
  const previousDate = new Date(previous.createdAt);
  const timeDiff = currentDate.getTime() - previousDate.getTime();
  const fiveMinutes = 5 * 60 * 1000;

  return timeDiff > fiveMinutes;
}
