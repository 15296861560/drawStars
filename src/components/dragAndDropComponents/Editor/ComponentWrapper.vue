<template>
    <div @click="handleClick">
        <component
            class="component"
            :is="config.component"
            :style="getStyle(config.style)"
            :propValue="config.propValue"
            :element="config"
        />
    </div>
</template>

<script>
import getStyle from '@/utils/dragAndDropComponents/style'
import runAnimation from '@/utils/dragAndDropComponents/runAnimation'
import { mixins } from '@/utils/dragAndDropComponents/events'

export default {
    props: {
        config: {
            type: Object,
            require: true,
        },
    },
    mounted() {
        runAnimation(this.$el, this.config.animations)
    },
    mixins: [mixins],
    methods: {
        getStyle,

        handleClick() {
            const events = this.config.events
            Object.keys(events).forEach(event => {
                this[event](events[event])
            })
        },
    },
}
</script>

<style lang="less" scoped>
.component {
    position: absolute;
}
</style>