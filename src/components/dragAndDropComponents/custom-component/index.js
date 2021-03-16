import Vue from 'vue'

const components = [
    'Picture',
    'VText',
    'VButton',
    'Group',
    'RectShape',
]

components.forEach(key => {
    Vue.component(key, () => import(`@/components/dragAndDropComponents/custom-component/${key}`))
})