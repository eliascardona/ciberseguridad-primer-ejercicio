import { z } from 'zod';
import { zod_string, zod_uuid } from '../shared/types';

/*
  API RESPONSES
*/

export const SavedMessageResponseDtoSchema = z.object({
  id: zod_uuid,
  message: zod_string,
});
export type SavedMessageResponseDto = z.infer<
  typeof SavedMessageResponseDtoSchema
>;

export const VerifiedMessageResponseDtoSchema = z.object({
  id: zod_uuid,
  message: zod_string,
});
export type VerifiedMessageResponseDto = z.infer<
  typeof VerifiedMessageResponseDtoSchema
>;

/*
  SCHEMAS AND TYPES FOR ACTIONS
*/
export const MessagingActionResponseEnum = z.enum([
  'MESSAGE_SAVED',
  'MESSAGE_VERIFIED',
]);
export type MessagingActionResponse = z.infer<
  typeof MessagingActionResponseEnum
>;

/*
  POLYMORPHIC SERVER ACTION'S RESULT TYPE
  TO AID THE SERVER RESULT HANDLING
*/

const ShoppingActionResultBaseSchema = z.object({
  type: MessagingActionResponseEnum,
});

export const MessageSavedResultSchema = ShoppingActionResultBaseSchema.extend({
  type: z.literal(MessagingActionResponseEnum.enum.MESSAGE_SAVED),
  id: zod_uuid,
  message: zod_string,
});
export type MessageSavedResult = z.infer<typeof MessageSavedResultSchema>;

export const MesaagingActionResultSchema = z.discriminatedUnion('type', [
  MessageSavedResultSchema,
]);

export type MesaagingActionResult = z.infer<typeof MesaagingActionResultSchema>;
