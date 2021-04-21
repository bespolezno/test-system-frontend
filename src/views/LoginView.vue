<template>
  <section id="login" class="screen flex jcc aic">
    <div class="window">
      <form class="window-main" @submit.prevent="login">
        <h1 class="text-center">Log In</h1>
        <BaseInput type="text" label="Username" :error="errors.username" v-model="form.username"/>
        <BaseInput type="password" label="Password" :error="errors.password" v-model="form.password"/>
        <div class="text-center">
          <button class="btn primary">Log In</button>
        </div>
      </form>
      <div class="window-sec">
        Don't have an account? <RouterLink :to="{name: 'Register'}">Sign Up</RouterLink>
      </div>
    </div>
  </section>
</template>
<script>
import BaseInput from "@/components/BaseInput";
import {reactive, ref} from "@vue/reactivity";
import {httpApi} from "@/utils/fetch";
import {useRouter} from "vue-router";

export default {
  name: 'LoginView',
  components: {BaseInput},
  setup() {
    const form = reactive({})
    const errors = ref({})
    const router = useRouter();

    async function login() {
      errors.value = {};
      const {data, code} = await httpApi('login', 'POST', form);
      if (code === 422) {
        errors.value = data.errors;
        return;
      }
      localStorage.token = data.token;
      await router.push({name: 'Tests'});
    }

    return {form, errors, login}
  }
}
</script>