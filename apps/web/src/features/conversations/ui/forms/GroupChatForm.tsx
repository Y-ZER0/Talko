"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseMutateFunction } from "@tanstack/react-query";
import type { CreateConversationRequest } from "../../services/conversation.service";
import type { CreateConversationResponseDto } from "@repo/shared";
import type { UserSearchResult } from "@/features/users/services/user.service";
import { FormField, inputClass } from "./FormField";
import { FormActions } from "./FormActions";
import { MultiUserSearchSelect } from "./MultiUserSearchSelect";

const groupChatSchema = z.object({
  groupName: z
    .string()
    .min(1, "Group name is required")
    .max(50, "Group name must be 50 characters or less")
    .trim(),
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
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);

  const methods = useForm<GroupChatFormData>({
    resolver: zodResolver(groupChatSchema),
    defaultValues: { groupName: "" },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmit = (data: GroupChatFormData) => {
    if (isPending) return;
    if (selectedUsers.length === 0) return;

    mutate(
      { type: "group", participantIds: selectedUsers.map((u) => u.id), groupName: data.groupName },
      {
        onSuccess: (result) => {
          onCreated(result.id);
          onClose();
          methods.reset();
          setSelectedUsers([]);
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
          label="Members"
          htmlFor="participant-search"
          error={selectedUsers.length === 0 ? { message: "At least one member is required" } : undefined}
        >
          <MultiUserSearchSelect
            selectedUsers={selectedUsers}
            onSelect={setSelectedUsers}
          />
        </FormField>

        {error && <p className="text-danger text-sm mb-4">{error.message}</p>}

        <FormActions onCancel={onClose} isPending={isPending} />
      </form>
    </FormProvider>
  );
}
