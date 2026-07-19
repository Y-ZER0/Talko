import { ImageAttachmentCard } from "@/features/media/ui/ImageAttachmentCard";
import { FileAttachmentRow } from "@/features/media/ui/FileAttachmentRow";
import { VoiceNoteBubble } from "@/features/media/ui/VoiceNoteBubble";
import { MessageMediaType } from "@repo/shared";
import type { MessageDto } from "@repo/shared";

export function AttachmentsRenderer({
  attachments,
  isOwn,
}: {
  attachments: MessageDto["attachments"];
  isOwn: boolean;
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {attachments.map((att) => {
        switch (att.mediaType) {
          case MessageMediaType.IMAGE:
          case MessageMediaType.VIDEO:
            return <ImageAttachmentCard key={att.id} attachment={att} />;
          case MessageMediaType.AUDIO:
            return <VoiceNoteBubble key={att.id} attachment={att} isOwn={isOwn} />;
          case MessageMediaType.DOCUMENT:
          default:
            return <FileAttachmentRow key={att.id} attachment={att} />;
        }
      })}
    </div>
  );
}
