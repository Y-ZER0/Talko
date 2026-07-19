"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseMutateFunction } from "@tanstack/react-query";
import type { CreateConversationRequest } from "../../services/conversation.service";
import type { CreateConversationResponseDto } from "@repo/shared";
import { FormField } from "./FormField";
import { FormActions } from "./FormActions";
import { UserSearchSelect } from "./UserSearchSelect";

const directMessageSchema = z.object({
  participantId: z.string().min(1, "User is required").trim(),
});

type DirectMessageFormData = z.infer<typeof directMessageSchema>;

export function DirectMessageForm({
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
  const methods = useForm<DirectMessageFormData>({
    resolver: zodResolver(directMessageSchema),
    defaultValues: { participantId: "" },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const onSubmit = (data: DirectMessageFormData) => {
    if (isPending) return;
    mutate(
      { type: "direct", participantId: data.participantId },
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
        <FormField label="To" htmlFor="participant-id" error={errors.participantId}>
          <UserSearchSelect
            value={methods.watch("participantId")}
            onSelect={(user) => {
              if (user) {
                setValue("participantId", user.id, { shouldValidate: true });
              } else {
                setValue("participantId", "", { shouldValidate: true });
              }
            }}
            error={errors.participantId}
          />
        </FormField>

        {error && <p className="text-danger text-sm mb-4">{error.message}</p>}

        <FormActions onCancel={onClose} isPending={isPending} />
      </form>
    </FormProvider>
  );
}
