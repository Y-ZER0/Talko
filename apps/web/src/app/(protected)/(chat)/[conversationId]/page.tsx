"use client";

import { use } from "react";
import { MessageTimeline } from "@/features/messages/ui/MessageTimeline";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = use(params);

  return <MessageTimeline conversationId={conversationId} />;
}
