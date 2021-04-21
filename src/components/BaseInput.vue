<template>
  <div class="input-wrapper" :class="{invalid: !!error}">
    <label :for="id">{{ label }}</label>
    <input :type="type" v-model="value" :id="id">
    <div class="error">{{ error }}</div>
  </div>
</template>
<script>
import {computed} from "vue";

export default {
  name: 'BaseInput',
  props: ['type', 'label', 'modelValue', 'error'],
  setup(props, {emit}) {
    const id = 'input' + (window.id = (window.id ?? 1) + 1);

    const value = computed({
      get: () => props.modelValue,
      set: value => emit('update:modelValue', value)
    })

    return {id, value}
  }
}
</script>