<template>
  <header>
    <div class="container flex aic jcsb">
      <a href="#" class="btn btn-secondary"
         v-if="hasBack" @click.prevent="back">Назад</a>
      <button class="btn btn-secondary mlauto"
              v-if="logined"
              @click="logout">Выйти</button>
    </div>
  </header>
  <main>
    <BaseLoader>
      <Component :is="currentPage" @change-page="changePage"/>
    </BaseLoader>
  </main>
</template>

<script>
import '@/assets/css/style.css'
import {ref} from "@vue/reactivity";
import RegisterPage from "@/pages/RegisterPage"
import LoginPage from "@/pages/LoginPage";
import UserTestsPage from "@/pages/UserTestsPage";
import UserTestPage from "@/pages/UserTestPage";
import BaseLoader from "@/components/BaseLoader";
import CreateTestPage from "@/pages/CreateTestPage";
import TestPage from "@/pages/TestPage";

export default {
  name: 'App',
  components: {
    RegisterPage,
    LoginPage,
    UserTestsPage,
    UserTestPage,
    BaseLoader,
    CreateTestPage,
    TestPage
  },
  setup() {
    const urlParams = new URLSearchParams(location.search);
    const page = urlParams.get('page') ?? localStorage.page;
    const currentPage = ref((localStorage.token && page) ? page : 'LoginPage');

    const logined = ref(!!localStorage.token);
    const hasBack = ref(!!JSON.parse(localStorage.params)?.back);

    function changePage(page, params = {}) {
      localStorage.params = JSON.stringify(params);
      hasBack.value = !!params.back;
      localStorage.page = page;
      logined.value = !!localStorage.token;
      currentPage.value = page;
    }

    function logout() {
      localStorage.clear();
      logined.value = false;
      changePage('LoginPage');
    }


    function back() {
      const {back: {page, params}} = JSON.parse(localStorage.params);
      changePage(page, params);
    }

    return {currentPage, changePage, logout, logined, back, hasBack}
  }
}
</script>
