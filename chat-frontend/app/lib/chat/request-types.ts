import { z } from 'zod';
import { zod_string, zod_uuid } from '../shared/types';

/*
  SCHEMAS AND TYPES FOR ACTIONS
*/
export const MessagingActionEnum = z.enum([
  'REQUEST_MESSAGE_SAVING',
  'REQUEST_MESSAGE_VERIFICATION',
]);
export type MessagingAction = z.infer<typeof MessagingActionEnum>;

/*
  SAVE MESSAGE COMMAND
*/
const SaveMessageCommandSchema = z.object({
  message: zod_string,
});
export type SaveMessageCommand = z.infer<typeof SaveMessageCommandSchema>;

/*
  VALIDATE MESSAGE COMMAND
*/
const VerifyMessageCommandSchema = z.object({
  chatMessageId: zod_uuid,
});
export type VerifyMessageCommand = z.infer<typeof VerifyMessageCommandSchema>;

/*
  POLYMORPHIC REQUEST SCHEMA
*/
const MessagingRequestBaseSchema = z.object({
  intent: MessagingActionEnum,
});

export const SaveMessageRequestSchema = MessagingRequestBaseSchema.extend({
  intent: z.literal(MessagingActionEnum.enum.REQUEST_MESSAGE_SAVING),
  body: SaveMessageCommandSchema,
});
export type SaveMessageRequestBody = z.infer<typeof SaveMessageRequestSchema>;

export const VerifyMessageRequestSchema = MessagingRequestBaseSchema.extend({
  intent: z.literal(MessagingActionEnum.enum.REQUEST_MESSAGE_VERIFICATION),
  body: VerifyMessageCommandSchema,
});
export type VerifyMessageRequestBody = z.infer<
  typeof VerifyMessageRequestSchema
>;

export const MessagingRequestBodySchema = z.discriminatedUnion('intent', [
  SaveMessageRequestSchema,
  VerifyMessageRequestSchema,
]);
export type MessagingRequestBody = z.infer<typeof MessagingRequestBodySchema>;
