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
  }, 1000);
};
</script>

<template>
  <div class="chat">
    <div v-if="!joined">
      <form @submit.prevent="join" class="join-form">
        <label for="name-input">What's your name?</label>
        <input id="name-input" v-model="name" class="name-input" />
        <button type="submit" class="btn-submit">Join</button>
      </form>
    </div>
    <div class="chat-container" v-else>
      <section class="messages-container">
        <article
          v-for="message in messages"
          :key="message.name"
          class="message"
        >
          <span class="message-author">{{ message.name }}</span
          >: <span class="message-text">{{ message.text }}</span>
        </article>
      </section>

      <div class="typing-display" v-if="typingDisplay">{{ typingDisplay }}</div>

      <hr class="separator" />

      <div class="message-input">
        <form @submit.prevent="sendMessage" class="message-form">
          <label for="message-input">Message:</label>
          <input
            id="message-input"
            v-model="messageText"
            @input="emitTyping"
            class="message-input-field"
          />
          <button type="submit" class="btn-submit">Send</button>
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

.join-form,
.message-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-submit {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.name-input,
.message-input-field {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
}

.message {
  margin-bottom: 10px;
}

.message-author {
  font-weight: bold;
}

.typing-display {
  font-style: italic;
}

.separator {
  margin: 10px 0;
}
</style>
