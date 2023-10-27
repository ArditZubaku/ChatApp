import { Injectable } from '@nestjs/common';
import { CreateMessageDTO } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  // Dictionary
  clientToUser = {};
  messages: Message[] = [
    {
      name: 'Test',
      text: 'Test Message',
    },
  ];
  create(createMessageDTO: CreateMessageDTO, clientID: string) {
    const message: Message = {
      name: this.clientToUser[clientID],
      text: createMessageDTO.text,
    };
    this.messages.push(message);
    return message;
  }

  findAll() {
    return this.messages;
  }

  identify(name: string, clientID: string) {
    this.clientToUser[clientID] = name;

    return Object.values(this.clientToUser);
  }

  getClientName(clientID: string) {
    return this.clientToUser[clientID];
  }
}
