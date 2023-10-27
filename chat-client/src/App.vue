<script setup lang="ts">
import { io, Socket } from "socket.io-client";
import { onBeforeMount, ref } from "vue";

type MessageType = {
  name: string;
  text: string;
};

const socket: Socket = io("http://localhost:3001");
const messages = ref<MessageType[]>([]);
const messageText = ref<string>("");
const joined = ref<boolean>(false);
const name = ref<string>("");
const typingDisplay = ref<string>("");

let timeout: ReturnType<typeof setTimeout> | null = null;

const clearTypingTimeout = () => {
  if (timeout) {
    clearTimeout(timeout);
  }
};

onBeforeMount(() => {
  socket.emit("findAllMessages", {}, (response: MessageType[]) => {
    messages.value = response;
  });

  socket.on("message", (message: MessageType) => {
    messages.value.push(message);
  });

  socket.on(
    "typing",
    ({ name, isTyping }: { name: string; isTyping: boolean }) => {
      typingDisplay.value = isTyping ? `${name} is typing...` : "";
    }
  );
});

const join = () => {
  socket.emit("join", { name: name.value }, () => {
    joined.value = true;
  });
};

const sendMessage = () => {
  socket.emit("createMessage", { text: messageText.value }, () => {
    messageText.value = "";
  });
};

const emitTyping = () => {
  clearTypingTimeout();
  socket.emit("typing", { isTyping: true });
  timeout = setTimeout(() => {
    socket.emit("typing", { isTyping: false });
  }, 2000);
};
</script>

<template>
  <div class="chat">
    <div v-if="!joined">
      <form @submit.prevent="join">
        <label>What's your name? </label>
        <input v-model="name" />
        <button type="submit">Send</button>
      </form>
    </div>
    <div class="chat-container" v-else>
      <div class="messages-container">
        <div v-for="message in messages">
          [{{ message.name }}]: {{ message.text }}
        </div>
      </div>

      <div v-if="typingDisplay">{{ typingDisplay }}</div>

      <hr />

      <div class="message-input">
        <form @submit.prevent="sendMessage">
          <label>Message: </label>
          <input v-model="messageText" @input="emitTyping" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("./assets/base.css");

.chat {
  padding: 20px;
  height: 100vh;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
}
</style>
