<template>
  <div>
    <v-alert type="error" v-show="error">{{ chatError }}</v-alert>
    <v-card>
      <v-list class="chat-box" v-chat-scroll="{ smooth: true }">
        <v-list-item
          v-bind:key="idx"
          v-for="(message, idx) in messages"
          v-bind:class="checkMsg(message.request)"
          class="message "
        >
          {{ message.text }}
        </v-list-item>
      </v-list>

      <v-card-title class="justify-center" v-show="messages.length === 0">
        New messages will appear here!
      </v-card-title>
      <div v-show="messages.length > 0">
        <v-card-title
          v-show="loading === true && error === true"
          class="justify-center"
        >
          <v-progress-circular indeterminate />
        </v-card-title>
        <v-card-title
          v-show="loading === true && error === false"
          class="justify-center"
        >
          <v-progress-circular indeterminate />
        </v-card-title>
        <v-card-title
          v-show="error === true"
          class="material-icons justify-center"
        >
          <v-btn icon @click="clear">
            <v-icon> mdi-refresh </v-icon>
          </v-btn>
        </v-card-title>
      </div>
    </v-card>
    <v-form
      lazy-validation
      ref="form"
      @submit.prevent="getData"
      v-model="request.valid"
    >
      <v-text-field
        v-model="request.text"
        :rules="request.rule"
        required
        label="Сообщение"
        placeholder="Введите текст сообщения"
        autocomplete="false"
      >
      </v-text-field>
      <v-btn
        v-bind:disabled="loading || request.text == ''"
        type="submit"
        block
      >
        Отправить
      </v-btn>
    </v-form>
    <v-btn block @click="clearStorage"> Очистить </v-btn>
  </div>
</template>

<script>
import axios from "axios";
import OpenAI from "openai-api";
export default {
  props: {
    roomId: undefined,
  },
  name: "GPT",
  data: () => ({
    loading: false,
    error: false,
    request: {
      text: "",
      valid: false,
      rule: [(v) => !!v || "Необходимо заполнить это поле"],
    },
    messages: [],
    chatError: undefined,
  }),
  mounted() {
    if (localStorage.getItem("messages")) {
      try {
        this.messages = JSON.parse(localStorage.getItem("messages"));
      } catch (error) {
        this.chatError = error;
        localStorage.removeItem("messages");
      }
    }
  },
  methods: {
    clearStorage() {
      this.messages = [];
      localStorage.clear();
    },
    clear() {
      this.loading = false;
      this.error = false;
      this.chatError = undefined;
    },
    checkMsg(request) {
      if (request) {
        return "accent message-right";
      } else {
        return "accent2 drawer message-left";
      }
    },
    async getData() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.error = false;
        var request = this.request.text;
        var scope = this;
        if (request === "" || request === null || request.value === 0) {
          this.chatError = "Please enter text in text box below";
        } else {
          this.request.text = "";
          this.messages.push({ text: request, request: true });
          //OpenAI
          const openaiKey =
            "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";
          // const openai = new OpenAI(openaiKey);
          console.log(openaiKey);
          axios
            .post(
              "https://api.openai.com/v1/engines/text-davinci-002/completions",
              {
                prompt: request,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${openaiKey}`,
                },
              }
            )
            // openai
            //   .complete({
            //     engine: "curie:ft-tango-2021-08-21-23-57-42",
            //     prompt: request,
            //     maxTokens: 64,
            //     temperature: 0,
            //     topP: 1,
            //     presencePenalty: 0,
            //     frequencyPenalty: 0,
            //     bestOf: 1,
            //     n: 1,
            //     stop: ["input:"],
            //   })
            .then(function(response) {
              console.log(response);
              scope.messages.push({
                text: response.data.choices[0].text,
                request: false,
              });
              localStorage.setItem("messages", JSON.stringify(scope.messages));
            })
            .catch(async function(error) {
              await axios
                .post(
                  atob("aHR0cHM6Ly9wZWxldmluLmdwdC5kb2Jyby5haS9nZW5lcmF0ZS8="),
                  {
                    prompt: request,
                    length: 80,
                  }
                )
                .then(function(response) {
                  const replies = response.data.replies;
                  scope.messages.push({
                    text: replies[Math.floor(Math.random() * replies.length)],
                    request: false,
                  });
                  console.log(response);
                  localStorage.setItem(
                    "messages",
                    JSON.stringify(scope.messages)
                  );
                })
                .catch(function(error) {
                  scope.chatError = error;
                  scope.error = true;
                });
            })
            .finally(function(response) {
              scope.loading = false;
            });
        }
      } else {
        //   console.log('error validating')
      }
    },
  },
};
</script>

<style>
.chat-box {
  max-height: 70vh !important;
  overflow-y: auto;
}
.message {
  border: 1px solid black;
  border-radius: 10px;
  padding: 10px;
  width: 60%;
  margin: 5px;
  font-size: 14px;
  /* background-color: ; */
  overflow-y: auto;
  word-wrap: anywhere;
}
.message-right {
  position: relative;
  margin-left: 30%;
  float: right;
}
</style>
