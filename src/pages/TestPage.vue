<template>
  <section class="container mb1" v-if="state === 'start'">
    <div class="card">
      <h3>Итоговое тестирование</h3>
      <p>Для прохождения тестирования необходимо заполнить поля ниже</p>
      <BaseInput title="Ваше имя" v-model:value="name" class="mb1"/>
      <a href="#" class="btn btn-primary" @click="name.length ? state = 'test' : ''">Начать</a>
    </div>
  </section>
  <template v-else-if="state === 'test'">
    <section class="container mb2">
      <div class="progress">
        <h1 class="white">Итоговое тестирование</h1>
        <div class="progress-value" :style="{width: `${100 - (complete / form.data.length * 100)}%`}"></div>
      </div>
    </section>
    <section class="container mb1">
      <div class="flex gap1 mb1 aib">
        <a href="#" class="result" v-for="(q, i) in test.questions" :key="q.id"
           :class="{current: i === index, empty: !hasAnswer(i), ok: isPassed && !isWrong(q), wrong: isPassed && isWrong(q, i)}" @click="index = i">{{ i + 1 }}</a>
      </div>
    </section>
    <section class="container mb1">
      <div class="card mb1">
        <h4>Вопрос {{ index + 1 }}</h4>
        <p v-if="texts.length < 2">{{ question.question }}</p>
        <p v-if="question.type === 'text'"
           :class="{answer: isPassed, ok: isPassed && form.data[index].answer === question.answer, wrong: isPassed && form.data[index].answer !== question.answer}">
          <span v-if="texts.length === 2">{{ texts[0] }}</span>
          <input type="text" class="inline" :disabled="isPassed"
                 :style="{width: `${question.answer?.length}ch`}" v-model="form.data[index].answer">
          <span v-if="texts.length === 2">{{ texts[1] }}</span>
        </p>
      </div>
      <div class="card" v-if="question.type === 'matching'">
        <div class="col2 mb05" v-for="answer in form.data.find(el => el.question_id === question.id).answers"
             :key="answer.id">
          <div class="answer">{{ answer.key }}</div>
          <div class="answer" :draggable="!isPassed" @drag="drag(answer)" @dragover.prevent @drop="drop(answer)"
               :class="{ok: isPassed && answer.value === question.answers.find(el => el.id === answer.id).value, wrong: isPassed && answer.value !== question.answers.find(el => el.id === answer.id).value}">
            {{ answer.value }}
          </div>
        </div>
      </div>
      <div class="card" v-else-if="question.type !== 'text'">
        <div class="answers" v-for="(answer) in question.answers" :key="answer.id">
          <label class="answer mb05" v-if="question.type === 'multiple'"
                 :class="{ok: isPassed && form.data[index].ids.includes(answer.id) && answer.is_correct, wrong: isPassed && ((form.data[index].ids.includes(answer.id) && !answer.is_correct) || (!form.data[index].ids.includes(answer.id) && answer.is_correct))}">
            <input type="checkbox" v-model="form.data[index].ids" :value="answer.id"
                   :disabled="isPassed">
            <div>{{ answer.value }}</div>
          </label>
          <label class="answer mb05" v-else-if="question.type === 'single'"
                 :class="{ok: isPassed && form.data[index].id === answer.id && answer.is_correct, wrong: isPassed && ((form.data[index].id === answer.id && !answer.is_correct) || (form.data[index].id !== answer.id && answer.is_correct))}">
            <input type="radio" :name="'as' + index" v-model="form.data[index].id" :value="answer.id"
                   :disabled="isPassed">
            <div>{{ answer.value }}</div>
          </label>
        </div>
      </div>
    </section>
    <section class="container mb1">
      <div class="flex jcsb">
        <a href="#" class="btn btn-secondary" v-if="!isFirst" @click="index--">Назад</a>
        <div></div>
        <a href="#" class="btn btn-primary" v-if="!isLast" @click="index++">Далее</a>
        <a href="#" class="btn btn-primary" v-else-if="complete === form.data.length"
           @click.prevent="result.id ? state = 'result' : check()">Завершить</a>
      </div>
    </section>
  </template>
  <section class="container" v-else>
    <h1 class="white mb2">Результат</h1>
    <div class="card">
      <h3>Итоговое тестирование</h3>
      <div class="col2">
        <div class="">
          <p>{{ result.rating.text }}</p>
          <div class="flex nowrap">
            <a href="#" class="btn btn-primary" @click="location.reload()">Пройти ещё раз</a>
            <a href="#" class="btn btn-secondary ml1" @click="state = 'test'">Просмотреть ответы</a>
          </div>
        </div>
        <div class="">
          <h1><span class="big">{{ result.correct_answers }}</span> / {{ result.total_questions }}</h1>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {httpApi} from "@/utils/fetch";
import {computed, reactive, ref, unref} from "@vue/reactivity";
import {shuffleValues} from "@/utils/shuffle";
import BaseInput from "@/components/BaseInput";

const dataTypes = {
  single: {id: null},
  multiple: {ids: []},
  text: {answer: ""},
  matching: {answers: []},
}

export default {
  components: {BaseInput},
  async setup() {
    const urlParams = new URLSearchParams(location.search);
    const uuid = urlParams.get('uuid');

    const {id} = JSON.parse(localStorage.params);
    const test = (await httpApi(`tests/${uuid ?? id}`))?.data;

    const state = ref('start');
    const name = ref('');

    const index = ref(0);
    const question = computed(() => test.questions[unref(index)]);
    const isFirst = computed(() => unref(index) === 0);
    const isLast = computed(() => unref(index) === test.questions.length - 1);

    const startTime = Date.now();

    const form = reactive({
      data: test.questions.map(el => {
        const result = {question_id: el.id, ...dataTypes[el.type]};

        if (el.type === 'matching') {
          result.answers = shuffleValues(el.answers)
        }

        return result;
      })
    });

    const dragged = ref(null);

    function drag(answer) {
      dragged.value = answer;
    }

    function drop(answer) {
      [answer.value, dragged.value.value] = [dragged.value.value, answer.value];
      dragged.value = null;
    }

    function hasAnswer(index) {
      const answer = unref(form).data[index];
      return answer.id || answer.ids?.length > 0 || answer.answer || answer.answers;
    }

    const complete = computed(() => unref(form).data.filter((el, i) => hasAnswer(i)).length)

    const result = ref({});
    const isPassed = computed(() => unref(result).id);

    async function check() {
      const seconds = (Date.now() - startTime) / 1000 ^ 0;
      form.name = unref(name);
      form.time = `${(seconds / 3600 ^ 0).toString().padStart(2, '0')}:${(seconds % 3600 / 60 ^ 0).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
      const {data, code} = await httpApi(`tests/${uuid ?? id}`, 'POST', form);
      if (code === 422) {
        return;
      }
      result.value = data;
      state.value = 'result';
    }

    const texts = computed(
        () => unref(question).type === 'text'
            ? unref(question).question.split('__ANSWER__')
            : []
    );

    function isWrong(question) {
      const answer = unref(form).data.find(el => el.question_id === question.id);
      return (question.type === 'text' && question.answer !== answer.answer) ||
          (question.type === 'single' && !question.answers.filter(a => a.is_correct).map(a => a.id).includes(answer.id)) ||
          (question.type === 'multiple' && !question.answers.every(a => !!answer.ids.includes(a.id) === !!a.is_correct)) ||
          (question.type === 'matching' && !answer.answers.every(a => question.answers.find(qa => qa.id === a.id).value === a.value));
    }

    return {
      test,
      drag,
      drop,
      check,
      form,
      index,
      question,
      isFirst,
      isLast,
      hasAnswer,
      complete,
      texts,
      name,
      state,
      result,
      isPassed,
      isWrong
    }
  }
}
</script>

<style scoped>

</style>
