import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  AiConversation,
  AiFabPosition,
  AiMessage,
  AiPanelLayout
} from '@/types/ai-assistant'
import * as aiApi from '@/api/ai-assistant'

const PANEL_DEFAULT: AiPanelLayout = {
  x: -1,
  y: -1,
  width: 720,
  height: 520
}

const FAB_DEFAULT: AiFabPosition = { x: -1, y: -1 }

export const aiAssistantStore = defineStore(
  'aiAssistant',
  () => {
    const panelOpen = ref(false)
    const sidebarCollapsed = ref(false)
    const groupExpanded = ref(true)
    const loading = ref(false)
    const sending = ref(false)
    const streaming = ref(false)
    const streamContent = ref('')
    const streamThinking = ref('')
    const thinkingActive = ref(false)
    const conversations = ref<AiConversation[]>([])
    const messages = ref<AiMessage[]>([])
    const activeConversationId = ref<string | null>(null)
    const panelLayout = ref<AiPanelLayout>({ ...PANEL_DEFAULT })
    const fabPosition = ref<AiFabPosition>({ ...FAB_DEFAULT })

    const activeConversation = computed(() =>
      conversations.value.find(c => c.id === activeConversationId.value)
    )

    const groupedConversations = computed(() => {
      const groups: Record<string, AiConversation[]> = {
        today: [],
        yesterday: [],
        earlier: []
      }
      for (const c of conversations.value) {
        groups[c.group]?.push(c)
      }
      return groups
    })

    async function loadConversations() {
      loading.value = true
      try {
        conversations.value = await aiApi.getConversations()
        if (!activeConversationId.value && conversations.value.length) {
          activeConversationId.value = conversations.value[0].id
          await loadMessages(activeConversationId.value)
        }
      } finally {
        loading.value = false
      }
    }

    async function loadMessages(conversationId: string) {
      loading.value = true
      try {
        messages.value = await aiApi.getMessages(conversationId)
      } finally {
        loading.value = false
      }
    }

    async function selectConversation(id: string) {
      if (activeConversationId.value === id) return
      activeConversationId.value = id
      await loadMessages(id)
    }

    async function newConversation() {
      const conv = await aiApi.createConversation()
      conversations.value.unshift(conv)
      activeConversationId.value = conv.id
      messages.value = []
      return conv
    }

    function updateConversationMeta(
      convId: string,
      assistant: AiMessage,
      userText: string
    ) {
      const conv = conversations.value.find(c => c.id === convId)
      if (conv) {
        conv.preview = assistant.content.replace(/<[^>]+>/g, '').slice(0, 40)
        conv.updatedAt = assistant.createdAt
        conv.messageCount = messages.value.length
        if (conv.title === '新对话' && userText) {
          conv.title = userText.slice(0, 16) || '新对话'
        }
      }
    }

    async function sendUserMessage(
      content: string,
      options?: { type?: AiMessage['type']; file?: File }
    ) {
      if (!content.trim() && !options?.file) return
      let convId = activeConversationId.value
      if (!convId) {
        const conv = await newConversation()
        convId = conv.id
      }

      let fileExcerpt: string | undefined
      if (options?.file) {
        const uploaded = await aiApi.uploadFile(options.file)
        fileExcerpt = uploaded.excerpt
      }

      const payload = {
        conversationId: convId,
        content: content.trim() || options?.file?.name || '',
        type: options?.type ?? (options?.file ? 'file' : 'text'),
        fileExcerpt
      }

      sending.value = true
      streaming.value = false
      streamContent.value = ''
      streamThinking.value = ''
      thinkingActive.value = false

      const tempUserId = `temp-user-${Date.now()}`
      const streamAssistantId = `stream-${Date.now()}`
      let assistantIdx = -1

      messages.value.push({
        id: tempUserId,
        conversationId: convId,
        role: 'user',
        type: payload.type ?? 'text',
        content: payload.content,
        createdAt: new Date().toISOString()
      })

      try {
        if (aiApi.preferStream()) {
          streaming.value = true
          assistantIdx = messages.value.push({
            id: streamAssistantId,
            conversationId: convId,
            role: 'assistant',
            type: 'rich',
            content: '',
            createdAt: new Date().toISOString(),
            capabilityId: 'llm'
          }) - 1

          const res = await aiApi.sendMessageStream(payload, {
            onUserMessage: msg => {
              const userIdx = messages.value.findIndex(m => m.id === tempUserId)
              if (userIdx >= 0) {
                messages.value[userIdx] = msg
              } else {
                messages.value.push(msg)
              }
            },
            onThinkingStart: () => {
              thinkingActive.value = true
            },
            onThinkingDelta: (_chunk, full) => {
              streamThinking.value = full
              if (assistantIdx >= 0) {
                const target = messages.value[assistantIdx]
                target.payload = { ...target.payload, thinking: full }
              }
            },
            onDelta: (_chunk, full) => {
              thinkingActive.value = false
              streamContent.value = full
              if (assistantIdx >= 0) {
                const target = messages.value[assistantIdx]
                target.content = full.includes('<')
                  ? full
                  : `<p>${full.replace(/\n/g, '<br/>')}</p>`
              }
            },
            onDone: done => {
              if (assistantIdx >= 0) {
                messages.value[assistantIdx] = done.assistantMessage
              } else {
                messages.value.push(done.userMessage, done.assistantMessage)
              }
              updateConversationMeta(convId, done.assistantMessage, content)
            },
            onError: msg => {
              if (assistantIdx >= 0) {
                messages.value[assistantIdx] = {
                  ...messages.value[assistantIdx],
                  content: `<p>对话出错：${msg}</p>`,
                  capabilityId: 'error'
                }
              }
            }
          })

          updateConversationMeta(convId, res.assistantMessage, content)
        } else {
          const res = await aiApi.sendMessage(payload)
          const userIdx = messages.value.findIndex(m => m.id === tempUserId)
          if (userIdx >= 0) {
            messages.value[userIdx] = res.userMessage
            messages.value.push(res.assistantMessage)
          } else {
            messages.value.push(res.userMessage, res.assistantMessage)
          }
          updateConversationMeta(convId, res.assistantMessage, content)
        }
      } finally {
        sending.value = false
        streaming.value = false
        streamContent.value = ''
        streamThinking.value = ''
        thinkingActive.value = false
      }
    }

    function togglePanel() {
      panelOpen.value = !panelOpen.value
      if (panelOpen.value && !conversations.value.length) {
        loadConversations()
      }
    }

    function openPanel() {
      panelOpen.value = true
      if (!conversations.value.length) loadConversations()
    }

    function closePanel() {
      panelOpen.value = false
    }

    function resetPanelLayout() {
      panelLayout.value = { ...PANEL_DEFAULT }
    }

    function setPanelLayout(layout: Partial<AiPanelLayout>) {
      panelLayout.value = { ...panelLayout.value, ...layout }
    }

    function setFabPosition(pos: AiFabPosition) {
      fabPosition.value = { ...pos }
    }

    return {
      panelOpen,
      sidebarCollapsed,
      groupExpanded,
      loading,
      sending,
      streaming,
      streamContent,
      streamThinking,
      thinkingActive,
      conversations,
      messages,
      activeConversationId,
      panelLayout,
      fabPosition,
      activeConversation,
      groupedConversations,
      loadConversations,
      loadMessages,
      selectConversation,
      newConversation,
      sendUserMessage,
      togglePanel,
      openPanel,
      closePanel,
      resetPanelLayout,
      setPanelLayout,
      setFabPosition
    }
  },
  {
    persist: {
      key: 'drawstars-ai-assistant',
      paths: [
        'sidebarCollapsed',
        'groupExpanded',
        'panelLayout',
        'fabPosition'
      ]
    }
  }
)
