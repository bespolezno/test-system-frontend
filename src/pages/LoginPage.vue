<template>
    <section class="screen flex jcc aic">
        <div class="window container">
            <h1 class="white mb1">Вход</h1>
            <form class="card" @submit.prevent="login">
              <BaseInput title="Имя пользователя" class="mb1"
                         v-model:value="form.username" :error="errors.username"/>
              <BaseInput title="Пароль" type="password" class="mb1"
                         v-model:value="form.password" :error="errors.password"/>
                <div class="flex jcsb">
                    <button class="btn btn-primary">Войти</button>
                    <a @click.prevent="$emit('changePage', 'RegisterPage')" href="#" class="btn btn-secondary">Зарегистрироваться</a>
                </div>
            </form>
        </div>
    </section>
</template>

<script>

import {reactive, ref} from "@vue/reactivity";
import BaseInput from "@/components/BaseInput";
import {httpApi} from "@/utils/fetch";

export default {
  components: {BaseInput},
  setup(props, {emit}) {
    const form = reactive({})
    const errors = ref({})

    async function login() {
      errors.value = {};
      const {data, code} = await httpApi('login', 'POST', form);
      if (code === 422) {
        errors.value = data.errors;
        return;
      }
      localStorage.token = data.token;
      emit('changePage', 'UserTestsPage');
    }

    return {form, errors, login}
  }
}
</script>

<style scoped>

</style>
