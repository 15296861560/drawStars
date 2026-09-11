<!--
 * @Description: 站内信侧边栏
-->
<template>
  <div class="message-box slideInRight" ref="msgBox" v-show="showMessageBox">
    <div class="message-box__header">
      <h2 class="message-box__title">站内信</h2>
      <div class="message-box__header__right">
        <div v-if="hasMore" class="message-btn__more u-btn" @click="onLoadMore">
          查看更多
        </div>
        <el-icon><Close class="u-btn" @click="close" /></el-icon>
      </div>
    </div>

    <div class="message-box__body">
      <div class="message-box__body__select">
        <el-select v-model="filter" @change="onFilterChange">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <div
          class="message-btn__all-read u-btn"
          :class="{ disabled: !unreadCount }"
          @click="onMarkAllRead"
        >
          <el-icon class="message-btn__all-read__icon"><BrushFilled /></el-icon>
          <span>全部已读</span>
        </div>
      </div>

      <div v-loading="loading" class="message-box__body__content">
        <template v-if="notifyList.length">
          <VirtualList
            v-if="useVirtualList"
            ref="virtualListRef"
            class="message-box__body__list"
            :items="notifyList"
            :item-height="ITEM_HEIGHT"
            item-key="id"
            height="100%"
            @reach-bottom="onReachBottom"
          >
            <template #default="{ item }">
              <div
                class="message-card"
                :class="{ 'is-unread': !item.isRead }"
                @click="onOpenItem(item)"
              >
                <div class="message-card__title">
                  <span v-if="!item.isRead" class="dot"></span>
                  {{ displayTitle(item) }}
                </div>
                <div class="message-card__summary">
                  {{ displaySummary(item) }}
                </div>
                <div class="message-card__info">
                  <div class="message-card__info__tag">
                    {{ displayTag(item) }}
                  </div>
                  <div class="message-card__info__time">
                    {{ formatDate(item.createTime, 'yyyy-MM-dd HH:mm') }}
                  </div>
                </div>
              </div>
            </template>
          </VirtualList>

          <ul v-else class="message-box__body__list is-plain">
            <li
              v-for="notify in notifyList"
              :key="notify.id"
              class="message-card"
              :class="{ 'is-unread': !notify.isRead }"
              @click="onOpenItem(notify)"
            >
              <div class="message-card__title">
                <span v-if="!notify.isRead" class="dot"></span>
                {{ displayTitle(notify) }}
              </div>
              <div class="message-card__summary">
                {{ displaySummary(notify) }}
              </div>
              <div class="message-card__info">
                <div class="message-card__info__tag">
                  {{ displayTag(notify) }}
                </div>
                <div class="message-card__info__time">
                  {{ formatDate(notify.createTime, 'yyyy-MM-dd HH:mm') }}
                </div>
              </div>
            </li>
            <li v-if="hasMore" class="message__hint">下滑或点击查看更多</li>
          </ul>
        </template>

        <div v-else-if="!loading" class="nothing">当前没有通知~</div>
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="activeItem ? displayTitle(activeItem) : '消息详情'"
      width="840px"
      top="8vh"
      append-to-body
      destroy-on-close
      class="notify-detail-dialog"
    >
      <div v-if="activeItem" class="detail">
        <div class="detail__meta">
          <el-tag size="small">{{ displayTag(activeItem) }}</el-tag>
          <span class="detail__time">{{
            formatDate(activeItem.createTime, 'yyyy-MM-dd HH:mm:ss')
          }}</span>
        </div>
        <RichTextViewer
          :html="detailHtml"
          bordered
          max-height="68vh"
          min-height="280px"
        />
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import formatDate from '@/utils/commom/formatDate.js'
import { notifyStore } from '@/stores/notify'
import { showTips } from '@/utils/message/showTips.js'
import VirtualList from '@/components/base/VirtualList/index.vue'
import RichTextViewer from '@/components/base/form/RichTextViewer.vue'

const ITEM_HEIGHT = 92

const props = defineProps({
  showMessageBox: { type: Boolean, required: false, default: true }
})

const emit = defineEmits(['close'])

const store = notifyStore()

const options = [
  { value: 'all', label: '全部' },
  { value: 'read', label: '已读' },
  { value: 'unread', label: '未读' }
]

const TAG_LABEL_MAP = {
  notice: '通知公告',
  system: '系统',
  site: '站内',
  message: '消息',
  test: '测试',
  gobang: '五子棋',
  系统: '系统',
  通知公告: '通知公告',
  消息: '消息'
}

const filter = ref(store.filterStatus)
const detailVisible = ref(false)
const activeItem = ref(null)
const useVirtualList = ref(false)
const virtualListRef = ref(null)
const loadingMore = ref(false)

const notifyList = computed(() => store.list)
const loading = computed(() => store.loading)
const hasMore = computed(() => store.hasMore)
const unreadCount = computed(() => store.unreadCount)

const stripHtml = html =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const looksLikeHtml = text => /<[a-z][\s\S]*>/i.test(String(text || ''))

const displayTitle = item => {
  if (!item) return '（无标题）'
  if (item.title) return item.title
  const plain = stripHtml(item.content || item.rawMsg || '')
  return plain || '（无标题）'
}

const displaySummary = item => {
  if (!item) return ''
  const plain = stripHtml(item.content || item.rawMsg || '')
  if (!plain) return ''
  // 有独立标题时展示正文；标题本身来自正文摘要时不再重复
  if (item.title) return plain
  return ''
}

const displayTag = item => {
  const raw = String(item?.tag || item?.notifyType || 'system').trim()
  if (!raw) return '系统'
  const key = raw.toLowerCase()
  return TAG_LABEL_MAP[raw] || TAG_LABEL_MAP[key] || raw
}

/** 轻量清理后用于富文本渲染 */
const sanitizeHtml = html =>
  String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')

const detailHtml = computed(() => {
  const item = activeItem.value
  if (!item) return ''
  const raw = item.content || item.rawMsg || ''
  if (!raw) return ''
  if (looksLikeHtml(raw)) return sanitizeHtml(raw)
  // 纯文本转义后保留换行
  return sanitizeHtml(
    String(raw)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>')
  )
})

const close = () => {
  emit('close', false)
}

const refresh = async () => {
  filter.value = store.filterStatus
  useVirtualList.value = false
  await Promise.all([
    store.fetchList({ reset: true }),
    store.fetchUnreadCount()
  ])
}

const onFilterChange = async val => {
  useVirtualList.value = false
  await store.setFilter(val)
}

const onLoadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    await store.loadMore()
    useVirtualList.value = true
    await nextTick()
    virtualListRef.value?.measure?.()
  } finally {
    loadingMore.value = false
  }
}

const onReachBottom = async () => {
  if (!useVirtualList.value || !hasMore.value || loadingMore.value) return
  await onLoadMore()
}

const onMarkAllRead = async () => {
  if (!unreadCount.value) return
  const ok = await store.markAllRead()
  if (ok) showTips('success', '已全部标为已读')
  else showTips('error', '操作失败')
}

const onOpenItem = async notify => {
  activeItem.value = notify
  detailVisible.value = true
  if (!notify.isRead) {
    await store.markRead(notify.id)
  }
}

watch(
  () => props.showMessageBox,
  val => {
    if (val) refresh()
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
.message-box {
  position: fixed;
  top: 60px;
  left: auto;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 100vw;
  background-color: #fff;
  box-shadow: 0 2px 4px 0 rgb(54 58 80 / 32%);
  display: flex;
  color: rgba(0, 0, 0, 0.9);
  flex-direction: column;
  z-index: 10;
  transition: all ease 0.5s;
  animation-duration: 0.5s;

  .message-box__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    padding: 10px 20px;
    border-bottom: 1px solid #e7eaef;
    flex: 0 0 50px;

    .message-box__title {
      line-height: 28px;
      margin: 0;
      font-size: 18px;
    }

    .message-box__header__right {
      display: flex;
      align-items: center;

      .message-btn__more {
        margin-right: 8px;
        color: #006eff;
        cursor: pointer;
        font-size: 13px;
      }
    }
  }

  .message-box__body {
    flex: 1 1 auto;
    overflow: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;
    position: relative;

    .message-box__body__select {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      flex-shrink: 0;

      :deep(.el-select) {
        flex: 1;
        min-width: 0;
        max-width: 160px;
      }
    }

    .message-btn__all-read {
      height: 32px;
      flex: 0 0 auto;
      padding: 0 12px;
      border: 1px solid #006eff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      box-sizing: border-box;
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      border-radius: 0;
      user-select: none;
      color: #006eff;

      .message-btn__all-read__icon {
        flex-shrink: 0;
        font-size: 14px;
      }

      span {
        flex-shrink: 0;
        white-space: nowrap;
      }

      &:hover:not(.disabled) {
        background-color: #ebeef2;
        border-color: #cfd5de;
      }

      &.disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }

    .message-box__body__content {
      flex: 1;
      min-height: 120px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .message-box__body__list {
      flex: 1;
      min-height: 0;
      margin: 0;
      padding: 0;
      list-style: none;

      &.is-plain {
        overflow: auto;
      }

      :deep(.message-card),
      .message-card {
        height: 92px;
        padding: 10px 16px 10px 20px;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;

        &:hover {
          background: #e7eaef;
        }

        &.is-unread .message-card__title {
          font-weight: 700;
        }

        .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f56c6c;
          margin-right: 6px;
          vertical-align: middle;
        }

        .message-card__title {
          margin-bottom: 2px;
          color: #000;
          font-weight: 500;
          line-height: 20px;
          min-width: 20px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .message-card__summary {
          margin-bottom: 4px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 12px;
          line-height: 18px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          min-height: 18px;
        }

        .message-card__info {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;

          .message-card__info__tag {
            margin: 0 4px 0 0;
            padding: 0 7px;
            line-height: 18px;
            border: 1px solid #ffe8d5;
            background-color: #ffe8d5;
            color: #ff7200;
            font-size: 12px;
          }

          .message-card__info__time {
            color: rgba(0, 0, 0, 0.4);
            line-height: 20px;
            font-size: 12px;
          }
        }
      }

      .message__hint {
        padding: 14px 10px;
        text-align: center;
        color: rgba(0, 0, 0, 0.4);
        font-size: 13px;
      }
    }
  }

  .nothing {
    text-align: center;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.45);
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.detail {
  .detail__meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .detail__time {
    color: rgba(0, 0, 0, 0.45);
    font-size: 13px;
  }
}
</style>
