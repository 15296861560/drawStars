<template>
    <div class="event-list">
        <div class="div-events">
            <el-button @click="isShowEvent = true">{{$t("btn.addEvent")}}</el-button>
            <div>
                <el-tag
                    v-for="event in Object.keys(curComponent.events)"
                    :key="event"
                    closable
                    @close="removeEvent(event)"
                >
                    {{ event }}
                </el-tag>
            </div>
        </div>

        <!-- 选择事件 -->
        <Modal v-model="isShowEvent">
            <el-tabs v-model="eventActiveName">
                <el-tab-pane v-for="item in eventList" :key="item.key" :label="item.label" :name="item.key" style="padding: 0 20px">
                    <el-input v-if="item.key == 'redirect'" v-model="item.param" type="textarea" :placeholder="$t("placeholder.redirect")" />
                    <el-input v-if="item.key == 'alert'" v-model="item.param" type="textarea" :placeholder="$t("placeholder.alertContent")" />
                    <el-button style="margin-top: 20px;" @click="addEvent(item.key, item.param)">{{$t("btn.confirm")}}</el-button>
                </el-tab-pane>
            </el-tabs>
        </Modal>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import Modal from '@/components/dragAndDropComponents/Modal'
import { eventList } from '@/utils/dragAndDropComponents/events'

export default {
    components: { Modal },
    data() {
        return {
            isShowEvent: false,
            eventURL: '',
            eventActiveName: 'redirect',
            eventList,
        }
    },
    computed: mapState([
        'curComponent',
    ]),
    methods: {
        addEvent(event, param) {
            this.isShowEvent = false
            this.$store.commit('addEvent', { event, param })
        },

        removeEvent(event) {
            this.$store.commit('removeEvent', event)
        },
    },
}
</script>

<style lang="less" scoped>
.event-list {
    .div-events {
        text-align: center;
        padding: 0 20px;
        
        .el-button {
            display: inline-block;
            margin-bottom: 10px;
        }

        .el-tag {
            display: block;
            width: 50%;
            margin: auto;
            margin-bottom: 10px;
        }
    }
}
</style>