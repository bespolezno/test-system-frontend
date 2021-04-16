<template>
  <section class="container mb2">
    <h1 class="white">Ваши тесты</h1>
  </section>
  <section class="container mb1">
    <a href="#" class="btn btn-primary" @click="$root.changePage('CreateTestPage', {back: {page: 'UserTestsPage'}})">Создать тест</a>
  </section>
  <section class="container">
    <div class="card mb1" v-for="test in tests" :key="test.id">
      <div class="flex jcsb aic">
        <h4>{{ test.title }}</h4>
        <a href="#" @click.prevent="$root.changePage('UserTestPage', {id: test.id, back: {page: 'UserTestsPage'}})" class="btn btn-secondary">Просмотреть</a>
      </div>
      <div class="col2">
        <div>
          <p><b>Дата создания:</b> {{ test.created_at }}</p>
          <p><b>Количество вопросов:</b> {{ test.questions.length }}</p>
          <p><b>Ссылка:</b> <a :href="testLink(test.uuid)">{{ testLink(test.uuid) }}</a></p>
        </div>
        <div>
          <p><b>Описание:</b>{{ test.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {httpApi} from "@/utils/fetch";
import {testLink} from "@/utils/link";

export default {
  async setup() {
    const tests = (await httpApi('tests', 'GET', null, true))?.data;
    return {tests, testLink}
  }
}
</script>

