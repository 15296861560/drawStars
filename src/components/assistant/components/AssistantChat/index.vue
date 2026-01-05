<template>
  <div class="assistant-chat-container" :style="`width:${props.width}`">
    <slot name="chat-header"></slot>

    <div
      id="chat-list"
      ref="chatListRef"
      v-loading="msgLoading"
      :style="`height:calc(100% - 50px - ${$slots['chat-header'] ? '40px' : '0px'})`"
      class="chat-list"
      @scroll="scrollChatList"
    >
      <msg-card
        v-for="msg in msgList"
        :id="msg.id"
        :key="msg.id"
        :msg-info="msg"
        :user-id="userId"
        :latest-msg-id="latestMsgId"
        @msg-action="msgAction"
        @msg-text-link="msgTextLink"
      >
      </msg-card>
    </div>

    <div
      class="chat-input-container"
      :class="{ 'chat-input-container__focus': isFocusInput }"
      tabindex="-1"
    >
      <div class="chat-input-container__inner">
        <div v-show="chatFiles.length" class="chat-files">
          <div v-for="(item, index) in chatFiles" class="chat-file">
            <el-icon class="close-icon" @click="chatFiles.splice(index, 1)"
              ><CircleCloseFilled
            /></el-icon>
            <img
              class="chat-file__img"
              :src="getAssetsImgFile(`assistant/${getFileType(item)}.png`)"
            />

            <div class="file-info">
              <div class="file-name" :title="item.fileName">
                {{ item.fileName }}
              </div>
              <div v-if="item.isAnalysis" class="file-tip">
                <el-icon class="mr-2 is-loading"><Loading /></el-icon>
                正在解析中
              </div>
              <div v-else-if="item.error" class="file-tip__danger">
                {{ item.error }}
              </div>
              <div v-else class="file-tip">{{ item.size }}</div>
            </div>
          </div>
        </div>

        <div class="chat-inut">
          <input
            v-show="false"
            ref="dialogUploadFileRef"
            type="file"
            multiple
            accept="*"
            @change="uploadFile($event)"
          />

          <el-popover
            popper-class="popover-upload-option"
            :width="131"
            placement="top"
            trigger="hover"
          >
            <ul class="upload-option-ul">
              <!-- <el-tooltip
                popper-class="upload-tooltip"
                effect="blue"
                content="可同时上传100个文件（每个150MB）支持pdf / docx / txt格式"
                placement="right">
                <li class="upload-option-li" @click="triggerUpload('document')">
                  <div class="upload-file__icon"></div>
                  上传文档
                </li>
              </el-tooltip> -->

              <li class="upload-option-li upload-option-li__disabled">
                <div class="upload-file__icon"></div>
                上传文档
              </li>

              <li class="upload-option-li upload-option-li__disabled">
                <div class="upload-pic__icon"></div>
                上传图片
              </li>

              <el-tooltip
                id="src-views-assistant-v2-components-assistantchat-web-id-el2602"
                popper-class="upload-tooltip"
                effect="blue"
                content="单次可上传1个小于15MB的文件，支持mp3 / m4a格式"
                placement="right"
              >
                <li class="upload-option-li" @click="triggerUpload('audio')">
                  <div
                    id="src-views-assistant-v2-components-assistantchat-web-id-d1404"
                    class="upload-audio__icon"
                  ></div>
                  上传音频
                </li>
              </el-tooltip>
            </ul>

            <template #reference>
              <img
                class="btn-upload"
                :src="getAssetsImgFile('assistant/file-upload.png')"
              />
            </template>
          </el-popover>

          <el-divider direction="vertical" class="mr0!" />

          <el-input
            v-model="sendInput"
            class="sent-input"
            placeholder="请输入信息"
            @focus="isFocusInput = true"
            @blur="isFocusInput = false"
            @keyup.enter="sendMsg"
          />

          <!--        <div class="btn-mic" @click="triggerSpeech">-->
          <!--          <el-popover popper-class="popover-soundbyte" :visible="listening" placement="top">-->
          <!--            <img :src="getAssetsImgFile('assistant/soundbyte .png')" />-->

          <!--            <template #reference>-->
          <!--              <el-icon v-loading="sendLoading">-->
          <!--                <img v-if="!listening" class="btn-icon" :src="getAssetsImgFile('assistant/microphone.png')" />-->
          <!--                <img v-else class="btn-icon" :src="getAssetsImgFile('assistant/pause.png')" />-->
          <!--              </el-icon>-->
          <!--            </template>-->
          <!--          </el-popover>-->
          <!--        </div>-->
          <div
            class="btn-send"
            :class="{
              'btn-send__disabled':
                !sendInput && !sendLoading && !chatFiles.length,
              'btn-send__pause': sendLoading,
            }"
            @click="sendLoading ? stopListen() : sendMsg()"
          >
            <img
              v-show="sendLoading"
              class="btn-send__icon"
              :src="getAssetsImgFile('assistant/pause.png')"
            />
            <el-icon v-show="!sendLoading"><Promotion /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  defineAsyncComponent,
  computed,
  reactive,
  ref,
  inject,
  nextTick,
  watch,
  onUnmounted,
  onMounted,
} from "vue";
import { getAssetsImgFile } from "@/utils/tool";
import { ElMessage } from "element-plus";
import { cloneDeep, debounce, throttle } from "lodash-es";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { v4 as uuidv4 } from "uuid";

import { userInfoStore } from "@/stores/user-info";
const userInfo = userInfoStore();

const props = defineProps({
  width: { type: String, default: "45%" },
});

const MsgCard = defineAsyncComponent(() => import("./MsgCard.vue"));

const groupInfo = reactive({
  groupId: "",
  groupName: "",
  type: "",
  flag: "",
});

watch(
  () => groupInfo.groupId,
  (newVal) => {
    if (newVal && sendLoading.value) {
      stopListen();
    }
    if (groupInfo.groupName) {
      initMsgList();
    } else {
      msgList.value = [];
    }
  },
);

const emit = defineEmits(["msg-action", "msg-text-link", "create-group"]);

const sendInput = ref();

const isFocusInput = ref(false);

const chatListRef = ref();
const msgList = ref<Array<any>>([]);

const latestMsgId = computed(() => {
  return msgList.value?.findLast((item) => item.content?.taskId)?.id || "";
});

const userId = computed(() => userInfo.getUserId || "");

const page = reactive({
  pageNo: 1,
  pageSize: 30,
  total: 0,
});
const initMsgList = async () => {
  msgList.value = [];
  page.total = 0;

  setTimeout(() => {
    chatListRef.value.scrollTo({
      top: chatListRef.value.scrollHeight,
      behavior: "smooth",
    });
  }, 300);
};

/**语音开关 */
const voiceStatus = ref(localStorage.getItem("chatVoiceStatus") === "true");

const handleVoiceSwitch = () => {
  voiceStatus.value = !voiceStatus.value;
  localStorage.setItem("chatVoiceStatus", `${voiceStatus.value}`);
  if (!voiceStatus.value) {
    //关闭语音播报功能
    if (finishStatus.value === 1) {
      //正在推送时，就只是暂停
      speechSynthesis.pause();
    } else {
      //如果已经推送结束，清空状态
      if (speechSynthesis.speaking) {
        //但是还在讲话，loading不关
        sendLoading.value = false;
      }
      handleClearSpeech();
    }
  } else {
    //开启语音播报功能
    if (finishStatus.value === 1) {
      //如果在推送时，还有未讲完的语音
      if (speechSynthesis.pending) {
        //继续讲
        speechSynthesis.resume();
      } else {
        //重新生成语音
        handleJointText();
      }
    } else {
      //当推送结束，清空状态
      handleClearSpeech();
    }
  }
};

/**上传文件 */
const dialogUploadFileRef = ref();
const uploadAccept = ref("*");
const uploadType = ref();
const ACCEPT_TYPE = {
  image: ".jpg,.jpeg,.png",
  document: ".doc,.docx,.xls,.xlsx,.pdf",
  audio: ".mp3,.m4a",
};
const triggerUpload = (type: "document" | "image" | "audio") => {
  uploadType.value = type;
  uploadAccept.value = ACCEPT_TYPE[type];
  nextTick(() => {
    dialogUploadFileRef.value?.click();
  });
};

const chatFiles = ref<
  Array<{
    fileName: string;
    filePath?: string;
    error?: string;
    size?: string;
    isAnalysis: boolean;
  }>
>([]);
const uploadFile = async (e: any) => {
  const formData = new FormData();
  const list: Array<{
    fileName: string;
    filePath?: string;
    error?: string;
    size?: string;
    isAnalysis: boolean;
  }> = [];
  Object.values(e.target.files).forEach((file: any) => {
    formData.append("files", file);

    list.push({
      fileName: file.name,
      filePath: "",
      error: "",
      size: `${(file.size / 1024).toFixed(2)}KB`,
      isAnalysis: true,
    });
  });
  chatFiles.value.push(...list);
  formData.append("groupId", groupInfo.groupId);
  formData.append("groupName", groupInfo.groupName);

  const options = {
    method: createRequest("assitant", "chatFileUpload"),
    params: formData,
  };

  const res = await tryCatch(options);

  e.target.value = "";

  if (res.code === 0) {
    res.data?.forEach((item: any) => {
      const file = list.find((f) => f.fileName === item.fileName);
      if (file) {
        file.filePath = item.filePath || "";
        file.error = item.error || "";
        file.isAnalysis = false;
      }
    });

    const successSize = list.filter((item) => !item.error)?.length || 0;
    if (successSize) {
      ElMessage.success(`${successSize}份对话文档处理完成`);
    }

    chatFiles.value = cloneDeep(chatFiles.value);
  }
};

const getFileType = (file: any) => {
  const fileName = file.fileName?.toLocaleLowerCase() || "";
  if (fileName.endsWith("docx") || fileName.endsWith("doc")) {
    return "WORD";
  }
  if (fileName.endsWith("pdf") || fileName.endsWith("ppt")) {
    return "PDF";
  }
  if (fileName.endsWith("xls") || fileName.endsWith("xlsx")) {
    return "EXCEL";
  }
  if (fileName.endsWith("mp3") || fileName.endsWith("m4a")) {
    return "audio-file";
  }
  if (fileName.endsWith("txt")) {
    return "TXT";
  }

  if (file.error) {
    return "Fail";
  }

  return "Fail";
};

/**语音识别 */
const listening = ref(false);
let recognition: any = null;

const isEdge = () => {
  return /Edg\//.test(navigator.userAgent) || /EdgA/i.test(navigator.userAgent);
};

if (isEdge()) {
  recognition = new (window as any).webkitSpeechRecognition();
}
const audioBlob = ref();

let recognitionText = "";
const onResult = debounce((event: { results: any }) => {
  recognitionText = (Object.values(event.results).at(-1) as Array<any>)[0]
    .transcript;
}, 1000);

const initSpeech = () => {
  if (!recognition) {
    // 不支持语音识别则走请求进行语音识别
    let stream: MediaStream | null = null;
    let mediaRecorder: MediaRecorder | null = null;
    const supportedMimeType = "audio/webm;codecs=opus";
    let recordedChunks: Array<any> = [];
    recognition = {
      start: async () => {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        // 录音数据有变化，记录到 recordedChunks
        mediaRecorder.addEventListener(
          "dataavailable",
          function (event: BlobEvent) {
            if (event.data.size) {
              recordedChunks.push(event.data);
            }
          },
        );

        mediaRecorder.addEventListener("stop", () => {
          // 把录音转换成文件，可以下载
          audioBlob.value = new Blob(recordedChunks, {
            type: supportedMimeType,
          });
          // 释放 stream
          stream?.getTracks().forEach((track) => track.stop());
          stream = null;

          const file = new window.File([audioBlob.value], "录音文件.webm", {
            type: supportedMimeType,
          });

          apiSpeechRecognition(file);
        });
      },
      stop: () => {
        mediaRecorder?.stop();
        recordedChunks = [];
      },
    };
    return;
  }

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "zh-CN";
  recognition.addEventListener("result", onResult);
};

const apiSpeechRecognition = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const options = {
    method: createRequest("assitant", "speechRecognition"),
    params: formData,
  };

  const res = await tryCatch(options);
  // if (res?.status === 200) {
  //   const msgItem = convertMsg({
  //     prefixContent: res.response,
  //     role: 1
  //   })
  //   appendMsgItem(msgItem)
  //   userAsk(msgItem)
  // }
  if (res?.code === 0) {
    const msgItem = convertMsg({
      prefixContent: res.data,
      role: 1,
    });
    appendMsgItem(msgItem);
    userAsk(msgItem);
  }
};

initSpeech();

const triggerSpeech = () => {
  if (sendLoading.value) {
    return;
  }

  if (listening.value) {
    recognition?.stop();
    listening.value = false;
    console.log("停止输入。。。");
    if (recognitionText) {
      const msgItem = convertMsg({
        prefixContent: recognitionText,
        role: 1,
      });

      appendMsgItem(msgItem);
      userAsk(msgItem);
      recognitionText = "";
    }
  } else {
    recognition?.start();
    listening.value = true;
    console.log("开启输入。。。");
  }
};

/**发送信息 */
const sendLoading = ref(false);
const sendMsg = () => {
  if ((!sendInput.value && !chatFiles.value?.length) || sendLoading.value) {
    return;
  }
  const msgItem = convertMsg({
    prefixContent: sendInput.value,
    role: 1,
  });

  if (chatFiles.value?.length) {
    if (chatFiles.value.find((item) => item.error)) {
      ElMessage.error("请先移除不支持的文件");
      return;
    }
    if (chatFiles.value.find((item) => item.isAnalysis)) {
      ElMessage.error("请先等待文件解析完成");
      return;
    }
    (msgItem.content as any).files = cloneDeep(chatFiles.value);
    chatFiles.value = [];
  }

  sendInput.value = "";
  appendMsgItem(msgItem);
  userAsk(msgItem);
};

const saveLastMsg = async (isStop = false) => {
  const msgItem = msgList.value.at(-1) || {};
  // isStop && (msgItem.content.stop = finishStatus.value === 1)
  isStop && (msgItem.content.stop = true);
  msgItem.loading = false;

  const options = {
    method: createRequest("assitant", "addList"),
    params: [msgItem],
  };

  const res = await tryCatch(options);
  //先根据语音总开关，如果播报正在讲话时，不关闭状态
  sendLoading.value = voiceStatus.value ? speechSynthesis.speaking : false;
  if (res.code !== 0) {
    msgItem.isFail = true;
    return;
  }
};

const stopListen = async () => {
  chatClient.removeAllListeners();
  chatClient.rebuild(
    `${VITE_CONFIG.VITE_APP_BASE_CONFIG.CHAT_WS_URL}/sys/websocket/chat`,
  );
  initChatListener();
  await saveLastMsg(true);
  handleClearSpeech();
};

const userAsk = async (msgItem: any) => {
  if (groupInfo.groupId && !groupInfo.groupName) {
    groupInfo.groupName = msgItem.content.prefixContent;
    msgItem.groupName = msgItem.content.prefixContent;
    groupInfo.type = msgItem.type;
    groupInfo.flag = msgItem.flag;
    emit("create-group", { ...groupInfo });
  }

  msgItem.saveQuestion = true;
  sendLoading.value = true;

  chatClient.send(msgItem);
  const rotMsgItem = convertMsg({
    prefixContent: "",
    role: 0,
  });
  appendMsgItem(rotMsgItem);
};

const updateLatestMsg = (content: string) => {
  const msgItem = msgList.value.at(-1) || {};
  msgItem.content.prefixContent += content;
  scrollToBottom();
};

const appendMsgItem = (msgItem: any) => {
  if (!msgItem.id) {
    msgItem.id = uuidv4().replace(/-/g, "");
  }

  msgList.value.push(msgItem);

  scrollToBottom();
};

const scrollToBottom = () => {
  nextTick(() => {
    chatListRef.value?.scrollTo({
      top: chatListRef.value?.scrollHeight,
      behavior: "smooth",
    });
  });
};

const convertMsg = (msgObj: any) => {
  const { prefixContent, role, operations } = msgObj;
  const msg = {
    content: {
      prefixContent,
      operations,
    },
    isInit: false,
    role, // 角色：0-机器，1-用户
    userId: userId.value,
    groupId: groupInfo?.groupId,
    groupName: groupInfo?.groupName,
    loading: !prefixContent && !role,
  };

  return msg;
};

/**消息动作 */
const msgAction = (action: { extInfo: any; op: any; taskId: string }) => {
  emit("msg-action", { ...action });
};
const msgTextLink = async (link: string) => {
  emit("msg-text-link", link);
  if (["日志查询"].includes(link)) {
    return;
  }

  const lastMsgItem = msgList.value.at(-1) || {};
  if (lastMsgItem.loading) {
    await stopListen();
  }

  const msgItem = convertMsg({
    prefixContent: link,
    role: 1,
  });
  appendMsgItem(msgItem);

  userAsk(msgItem);
};

const init = async () => {
  msgList.value = [];
};

const msgLoading = ref(false);
const scrollChatList = throttle(async (e: any) => {
  const scrollTop = e.target.scrollTop;
  if (scrollTop !== 0 || msgList.value.length < page.pageSize) {
    return;
  }

  const topId = msgList.value[0]?.id;
  const offset = msgList.value.length;

  // const options = {
  //   method: createRequest("assitant", "getChatHistoryPage"),
  //   params: {
  //     offset,
  //     pageSize: page.pageSize,
  //     type: 1,
  //     userId: userId.value,
  //   },
  //   loading: msgLoading,
  // };

  // const res = await tryCatch(options);
  // if (res.code !== 0 || offset >= res.data?.total) {
  //   return;
  // }
  // msgList.value.unshift(...(res.data?.records?.reverse() || []));

  // page.total = res.data?.total || 0;

  // 将滚动条设置到上次查看的位置
  nextTick(() => {
    const msg = document.getElementById(topId);
    msg?.scrollIntoView();
  });
}, 1000);

/**问答语音播报 */
const jointText = ref("");
const currentText = ref("");
const finishStatus = ref(0);
const speechInterval = ref();
const handleJointText = () => {
  if (currentText.value !== jointText.value) {
    //经过比对，未播报信息创建speechSynthesis
    const text = jointText.value.substring(currentText.value.length);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 3;
    speechSynthesis.speak(utterance);
    utterance.onend = function () {
      //播报结束后，关闭loading
      sendLoading.value = speechSynthesis.speaking;
    };
  }
  currentText.value = jointText.value;
  if (finishStatus.value === 2) {
    //流式推送结束，不再轮巡
    jointText.value = "";
    currentText.value = "";
    clearInterval(speechInterval.value);
    speechInterval.value = null;
  }
  if (finishStatus.value === 1) {
    //轮巡中的话需要定时取截取未播报的信息
    clearInterval(speechInterval.value);
    speechInterval.value = setInterval(() => {
      handleJointText();
    }, 2000);
  }
};
const handleClearSpeech = (restStatus = true) => {
  if (restStatus) {
    jointText.value = "";
    currentText.value = "";
    finishStatus.value = 0;
  }
  clearInterval(speechInterval.value);
  speechInterval.value = null;
  speechSynthesis.pause();
  speechSynthesis.cancel();
};
watch(
  () => finishStatus.value,
  (n) => {
    if (n === 1 && voiceStatus.value) {
      handleClearSpeech(false);
      handleJointText();
    }
  },
);

const clear = () => {
  chatClient.removeAllListeners();
  chatClient.rebuild(
    `${VITE_CONFIG.VITE_APP_BASE_CONFIG.CHAT_WS_URL}/sys/websocket/chat`,
  );
  initChatListener();
  msgList.value = [];
  sendInput.value = "";
  sendLoading.value = false;
  handleClearSpeech();
};

const chatClient = new ChatClient();

const initChatClient = () => {
  chatClient.createInstance(
    `${VITE_CONFIG.VITE_APP_BASE_CONFIG.CHAT_WS_URL}/sys/websocket/chat`,
  );
  initChatListener();
};

const initChatListener = () => {
  chatClient.on(CHAT_EVENT.USER_ASK, (content) => {
    updateLatestMsg(content);
    finishStatus.value = 1;
    jointText.value += content;
  });
  chatClient.on(CHAT_EVENT.OBJECT_ANSWER, (content) => {
    msgList.value.splice(-1);
    appendMsgItem(content);
    saveLastMsg();
  });
  chatClient.on(CHAT_EVENT.USER_ASK_FINISH, async () => {
    finishStatus.value = 2;
    saveLastMsg();
  });
  chatClient.on(CHAT_EVENT.REFRESH, async () => {
    initMsgList();
  });
};
initChatClient();

defineExpose({
  init,
  clear,
  appendMsgItem,
  groupInfo,
  msgList,
  voiceStatus,
  handleVoiceSwitch,
});

onMounted(() => {
  window.addEventListener("beforeunload", () => {
    speechSynthesis.pause();
    speechSynthesis.cancel();
  });
});
</script>

<style scoped lang="less">
.assistant-chat-container {
  position: relative;
  width: 45%;
  padding: 10px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  .chat-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: calc(100% - 50px);
    overflow: auto;
    padding: 0 15px;
  }

  .chat-input-container {
    position: absolute;
    bottom: 10px;
    width: calc(100% - 30px);
    background: linear-gradient(132deg, #9697ff 0%, #6dffd1 54%, #409eff 100%);
    padding: 1px; /* 边框厚度 */
    border-radius: 6px;
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.15);
    z-index: 11;

    &__inner {
      background: #ffffff;
      border-radius: 6px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    &:focus,
    &__focus {
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.15);
    }

    .chat-files {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 5px;
      max-height: 140px;
      overflow: auto;
      padding-top: 5px;
      .chat-file {
        width: 24%;
        height: 60px;
        background: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        position: relative;
        .close-icon {
          position: absolute;
          right: -7px;
          top: -7px;
          display: none;
          cursor: pointer;
        }
        &:hover {
          .close-icon {
            display: block;
            &:hover {
              opacity: 0.8;
            }
          }
        }
        &__img {
          width: 30px;
          height: 30px;
          margin-right: 4px;
        }
        .file-info {
          display: flex;
          flex-direction: column;
          .file-name {
            width: 154px;
            font-size: 14px;
            color: #333333;
            text-wrap: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
          }
          .file-tip {
            width: 100%;
            font-size: 12px;
            color: #9fa7ba;
            &__danger {
              color: #ff2020;
              font-size: 12px;
            }
          }
        }
      }
    }

    .chat-inut {
      height: 27px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      width: 100%;
      .btn-upload {
        width: 24px;
        height: 24px;
        cursor: pointer;
      }

      .sent-input {
        :deep(.el-input__wrapper) {
          box-shadow: none;
        }
      }

      .btn-mic {
        min-width: 30px;
        height: 30px;
        background: #ecf5ff;
        border-radius: 4px;
        margin-right: 10px;
        font-size: 24px;
        color: #409eff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }

      .btn-send {
        min-width: 30px;
        height: 30px;
        background: #409eff;
        border-radius: 4px;
        font-size: 24px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
        &__disabled {
          cursor: not-allowed;
          background: #dddee3;
        }

        &__pause {
          background-color: white;
        }
      }
    }
  }
}
</style>
<style lang="less">
.chat-list {
  /* 设置滚动条的样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cfdcf6;
    border-radius: 4px;
  }
}
.el-popover.popover-soundbyte {
  width: 90px !important;
  min-width: 90px;
  height: 36px;
  background: #409eff;
  border-radius: 4px;
  padding: 3px 15px;

  .el-popper__arrow {
    &::before {
      background: #409eff;
    }
  }

  .btn-icon {
    min-width: 30px;
    height: 30px;
    &:hover {
      opacity: 0.8;
    }
  }
}
.upload-tooltip {
  z-index: 10000 !important;
}
.el-popover.popover-upload-option {
  padding: 4px;
  min-width: 131px;
  z-index: 10000 !important;
  .upload-option {
    &-li {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      height: 44px;
      width: 100%;
      cursor: pointer;
      .upload-file__icon {
        width: 32px;
        height: 32px;
        background: url("@/assets/img/assistant/upload-file.png") no-repeat;
        background-size: 100%;
      }
      .upload-pic__icon {
        width: 32px;
        height: 32px;
        background: url("@/assets/img/assistant/upload-pic.png") no-repeat;
        background-size: 100%;
      }
      .upload-audio__icon {
        width: 32px;
        height: 32px;
        background: url("@/assets/img/assistant/upload-audio.png") no-repeat;
        background-size: 100%;
      }
      &:hover {
        background-color: #cfdcf6;
        color: #409eff;
        border-radius: 4px;
        // .upload-file__icon {
        //   background: url('@/assets/img/assistant/upload-file__active.png') no-repeat;
        //   background-size: 100%;
        // }
        .upload-audio__icon {
          background: url("@/assets/img/assistant/upload-audio__active.png")
            no-repeat;
          background-size: 100%;
        }
      }
      &__disabled {
        background-color: var(--el-disabled-bg-color);
        color: var(--el-disabled-text-color);
        cursor: not-allowed;
        &:hover {
          background-color: var(--el-disabled-bg-color);
          color: var(--el-disabled-text-color);
        }
      }
    }
  }
}

.el-popper.is-blue {
  background: #409eff;
  border: 1px solid #409eff;
  color: var(--el-bg-color);
  width: 312px;
  font-size: 16px;
}
.el-popper.is-blue .el-popper__arrow:before {
  background: #409eff;
  border: 1px solid #409eff;
}
</style>
