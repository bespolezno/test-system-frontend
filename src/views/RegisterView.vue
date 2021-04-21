<template>
  <section id="register" class="screen flex jcc aic">
    <div class="window">
      <form class="window-main" @submit.prevent="register">
        <h1 class="text-center">Sign Up</h1>
        <BaseInput type="text" label="Username" :error="errors.username" v-model="form.username"/>
        <BaseInput type="password" label="Password" :error="errors.password" v-model="form.password"/>
        <BaseInput type="password" label="Password confirmation" :error="errors.password_confirmation" v-model="form.password_confirmation"/>
        <div class="text-center">
          <button class="btn primary">Sign Up</button>
        </div>
      </form>
      <div class="window-sec">
        Already have an account? <RouterLink :to="{name: 'Login'}">Log In</RouterLink>
      </div>
    </div>
  </section>
</template>
<script>
import BaseInput from "@/components/BaseInput";
import {ref, reactive} from "@vue/reactivity";
import {httpApi} from "@/utils/fetch";
import {useRouter} from "vue-router";

export default {
  name: 'RegisterView',
  components: {BaseInput},
  setup() {
    const form = reactive({})
    const errors = ref({})
    const router = useRouter();

    async function register() {
      errors.value = {};
      const {data, code} = await httpApi('register', 'POST', form);
      if (code === 422) {
        errors.value = data.errors;
        return;
      }
      localStorage.token = data.token;
      await router.push({name: 'Tests'});
    }

    return {form, errors, register}
  }
}
</script>