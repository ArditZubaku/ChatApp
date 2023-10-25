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
  create(createMessageDTO: CreateMessageDTO) {
    // TODO: Improve this
    this.messages.push(createMessageDTO);
    return createMessageDTO;
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
