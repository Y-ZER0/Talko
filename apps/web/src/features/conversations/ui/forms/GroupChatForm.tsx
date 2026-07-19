"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseMutateFunction } from "@tanstack/react-query";
import type { CreateConversationRequest } from "../../services/conversation.service";
import type { CreateConversationResponseDto } from "@repo/shared";
import { FormField, inputClass } from "./FormField";
import { FormActions } from "./FormActions";

const groupChatSchema = z.object({
  groupName: z
    .string()
    .min(1, "Group name is required")
    .max(50, "Group name must be 50 characters or less")
    .trim(),
  participantIds: z.string().min(1, "At least one participant is required").trim(),
});

type GroupChatFormData = z.infer<typeof groupChatSchema>;

export function GroupChatForm({
  onCreated,
  onClose,
  mutate,
  isPending,
  error,
}: {
  onCreated: (id: string) => void;
  onClose: () => void;
  mutate: UseMutateFunction<CreateConversationResponseDto, Error, CreateConversationRequest>;
  isPending: boolean;
  error: Error | null;
}) {
  const methods = useForm<GroupChatFormData>({
    resolver: zodResolver(groupChatSchema),
    defaultValues: { groupName: "", participantIds: "" },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmit = (data: GroupChatFormData) => {
    if (isPending) return;
    const ids = data.participantIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) return;

    mutate(
      { type: "group", participantIds: ids, groupName: data.groupName },
      {
        onSuccess: (result) => {
          onCreated(result.id);
          onClose();
          methods.reset();
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Group Name" htmlFor="group-name" error={errors.groupName}>
          <input
            id="group-name"
            type="text"
            placeholder="Enter group name..."
            {...register("groupName")}
            className={inputClass}
          />
        </FormField>

        <FormField
          label="Participant IDs (comma-separated)"
          htmlFor="participant-ids"
          error={errors.participantIds}
        >
          <input
            id="participant-ids"
            type="text"
            placeholder="user-id-1, user-id-2..."
            {...register("participantIds")}
            className={inputClass}
          />
        </FormField>

        {error && <p className="text-danger text-sm mb-4">{error.message}</p>}

        <FormActions onCancel={onClose} isPending={isPending} />
      </form>
    </FormProvider>
  );
}
