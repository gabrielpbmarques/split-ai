import { z } from 'zod';

export const twilioInboundMessageSchema = z.object({
  WaId: z.string().min(1),
  ProfileName: z.string().optional(),
  Body: z.string().optional(),
  MessageSid: z.string().optional(),
  From: z.string().optional(),
});

export type TwilioInboundMessage = z.infer<typeof twilioInboundMessageSchema>;
