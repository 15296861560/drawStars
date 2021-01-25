import Vue from 'vue'

const components = [
    'Picture',
    'VText',
    'VButton',
]

components.forEach(key => {
    Vue.component(key, () => import(`@/components/dragAndDropComponents/custom-component/${key}`))
})