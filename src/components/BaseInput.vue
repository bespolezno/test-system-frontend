<template>
  <div class="input-wrapper" :class="{invalid: error}" v-bind="$attrs">
    <label :for="id">{{ title }}</label>
    <textarea v-if="type === 'textarea'" class="input" :id="id" v-model="input" rows="3"></textarea>
    <select v-else-if="type === 'select'" class="input" :id="id" v-model="input"><slot></slot></select>
    <input v-else class="input" :id="id" v-model="input" :type="type ?? 'text'">
    <small class="error">{{ error }}</small>
  </div>
</template>
<script>
import {computed} from "vue";

export default {
  name: 'BaseInput',
  inheritAttrs: false,
  props: ['error', 'value', 'title', 'type'],
  setup(props, {emit}) {
    const id = 'input' + (window.id = (window.id ?? 0) + 1);

    const input = computed({
      get: () => props.value,
      set: value => emit('update:value', value)
    })

    return {input, id}
  }
}
</script>
