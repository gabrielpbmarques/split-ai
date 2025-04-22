import { config } from 'src/config';

export const AIInstructionsByAgent = {
  register_chat: config.registerChatInstructions,
  whatsapp_register: config.whatsappRegisterInstructions,
  message_data_parser: config.messageDataParser,
};
