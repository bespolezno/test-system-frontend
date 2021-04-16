<template>
  <section class="container mb2">
    <h1 class="white">Создание теста</h1>
  </section>
  <section class="container mb1">
    <div class="card">
      <h4>Основные настройки</h4>
      <BaseInput title="Название" class="mb1" v-model:value="form.title"
                 :error="errors.title ?? (Array.isArray(errors.questions) ? undefined : errors.questions) ?? (Array.isArray(errors.ratings) ? undefined : errors.ratings)" />
      <BaseInput title="Описание" type="textarea"
                 :error="errors.description" v-model:value="form.description"/>
    </div>
  </section>
  <section class="container">
    <div class="card flex jcsb aic mb1">
      <h4 class="mb0">Список вопросов</h4>
      <button class="btn btn-primary" @click="addQuestion">Добавить</button>
    </div>
    <div class="card mb1" v-for="(question, qIndex) in form.questions" :key="question.id">
      <div class="flex jcsb aic">
        <h4>Вопрос {{ qIndex + 1 }}</h4>
        <button class="btn btn-danger" @click="deleteQuestion(question)">Удалить</button>
      </div>
      <div class="col2">
        <BaseInput title="Вопрос" v-model:value="question.question"
                   :error="errors.questions?.[qIndex]?.question ?? (Array.isArray(errors.questions?.[qIndex]?.answers) ? undefined : errors.questions?.[qIndex]?.answers)" />
        <BaseInput title="Тип вопроса" type="select" :error="errors.questions?.[qIndex]?.type" v-model:value="question.type">
          <option value="single">Один ответ</option>
          <option value="multiple">Несколько ответов</option>
          <option value="text">Произвольный ответ</option>
          <option value="matching">Сопоставление</option>
        </BaseInput>
      </div>
      <div class="flex jcsb aic" v-if="question.type">
        <p><b>Ответы</b></p>
        <button class="btn btn-primary" v-if="question.type !== 'text'" @click="addAnswer(question)">Добавить</button>
      </div>
      <div class="flex gap2 nowrap aib" v-if="question.type === 'text'">
        <BaseInput title="Ответ" :error="errors.questions?.[qIndex]?.answer" v-model:value="question.answer"/>
      </div>
      <div class="flex gap2 nowrap aib" v-else v-for="(answer, aIndex) in question.answers" :key="answer.id">
        <template v-if="question.type === 'multiple'">
          <BaseInput title="Ответ" :error="errors.questions?.[qIndex]?.answers?.[aIndex]?.value" v-model:value="answer.value"/>
          <label class="text-nowrap"><input type="checkbox" v-model="answer.is_correct"> Правильный ответ</label>
        </template>
        <template v-else-if="question.type === 'single'">
          <BaseInput title="Ответ" :error="errors.questions?.[qIndex]?.answers?.[aIndex]?.value" v-model:value="answer.value"/>
          <label class="text-nowrap"><input type="radio"> Правильный ответ</label>
        </template>
        <template v-else-if="question.type === 'matching'">
          <BaseInput title="Ключ" :error="errors.questions?.[qIndex]?.answers?.[aIndex]?.key" v-model:value="answer.key" class="mb0"/>
          <BaseInput title="Значение" :error="errors.questions?.[qIndex]?.answers?.[aIndex]?.value" v-model:value="answer.value"/>
        </template>
        <button class="btn btn-danger" @click="deleteAnswer(question, answer)">Удалить</button>
      </div>
    </div>
  </section>
  <section class="container mb1">
    <div class="card">
      <div class="flex aic jcsb">
        <h4>Шкала оценки</h4>
        <button class="btn btn-primary" @click="addRating">Добавить</button>
      </div>
      <div class="flex gap2 nowrap aib mb1" v-for="(rating, rIndex) in form.ratings" :key="rating.id">
        <BaseInput title="Текст оценки" v-model:value="rating.text" class="mb0"
                   :error="errors.ratings?.[rIndex]?.text" />
        <BaseInput title="Мин %" v-model:value="rating.min" class="mb0"
                   :error="errors.ratings?.[rIndex]?.min" type="number" style="width: 100px"/>
        <BaseInput title="Макс %" v-model:value="rating.max" class="mb0"
                   :error="errors.ratings?.[rIndex]?.max" type="number" style="width: 100px"/>
        <button class="btn btn-danger" @click="removeRating(rating)">Удалить</button>
      </div>
    </div>
  </section>
  <section class="container flex">
    <div></div>
    <a href="#" class="btn btn-primary" @click="createTest">Сохранить</a>
  </section>
</template>

<script>
import BaseInput from "@/components/BaseInput";
import {reactive, ref} from "@vue/reactivity";
import {httpApi, parseErrors} from "@/utils/fetch";
export default {
  components: {BaseInput},
  setup(props, {emit}) {
    const form = reactive({questions: [], ratings: []})
    const errors = ref({})

    let counter = 1;

    function addQuestion() {
      form.questions.push({id: counter++, answers: []})
    }

    function deleteQuestion(question) {
      form.questions.splice(form.questions.findIndex(el => el === question), 1);
    }

    function addAnswer(question) {
      question.answers.push({id: counter++})
    }

    function deleteAnswer(question, answer) {
      question.answers.splice(question.answers.findIndex(el => el === answer), 1);
    }

    function addRating() {
      form.ratings.push({id: counter++, min: 0, max: 100})
    }

    function removeRating(rating) {
      form.ratings.splice(form.ratings.findIndex(el => el === rating), 1);
    }

    async function createTest() {
      errors.value = {};
      const {data, code} = await httpApi('tests', 'POST', form, true);
      if (code === 422) {
        errors.value = parseErrors(data.errors);
        return;
      }
      emit('changePage', 'UserTestsPage');
    }

    return {form, errors, createTest, addQuestion, addAnswer, deleteAnswer, deleteQuestion, addRating, removeRating}
  }
}
</script>

<style scoped>

</style>
