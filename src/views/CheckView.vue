<template>
  <section id="check" class="container-sm">
    <div class="card p1 mb1" v-if="state === 'result'">
      <h2>Your rating</h2>
      <div class="grid2">
        <p>{{ result.rating.text }}</p>
        <div class="flex jcc aic"><h3 class="result"><span class="result-big">{{ result.correct_answers }}</span> / {{ result.total_questions }}</h3></div>
      </div>
      <button class="btn secondary" @click="restart">Restart</button>
      <button class="btn primary" @click="state = 'start'">Show answers</button>
    </div>
    <template v-if="state === 'start'">
      <div class="card p1 mb1">
        <h2>{{ test.title }}</h2>
        <BaseInput label="Your name" type="text" :error="errors.name" v-model="form.name"/>
      </div>
      <div class="card p1 mb1" :class="checkClasses(i)" v-for="(question, i) in form.data" :key="question.id">
        <h3>Question {{ i + 1 }}</h3>
        <p>{{ question.question }}</p>
        <p v-if="result && !isOk(i)"><b>Correct answer: </b> {{ correctAnswer(question) }}</p>
        <template v-if="question.type === 'text'">
          <BaseInput label="Answer" type="text" :error="errors[`data.${i}.value`]" v-model="question.value"/>
        </template>
        <template v-else-if="question.type === 'multiple'">
          <label class="flex gap1 answer mb1" v-for="answer in question.answer" :key="answer.id">
            <input type="checkbox" v-model="question.value" :value="answer.id" > {{ answer.value }}
          </label>
        </template>
        <template v-else-if="question.type === 'single'">
          <label class="flex gap1 answer mb1" v-for="answer in question.answer" :key="answer.id">
            <input type="radio" v-model="question.value" :value="answer.id"> {{ answer.value }}
          </label>
        </template>
        <template v-else-if="question.type === 'matching'">
          <h4>Answers</h4>
          <div class="grid2">
            <template v-for="answer in question.value" :key="answer.id">
              <div class="w100 match">{{ answer.key }}</div>
              <div class="w100 match" draggable="true" @drag="drag(answer)" @drop="drop(question, answer)"
                   @dragover.prevent>{{ answer.value }}
              </div>
            </template>
          </div>
        </template>
        <small v-if="question.type !== 'text' && errors[`data.${i}.value`]" class="wrong">{{ errors[`data.${i}.value`] }}</small>
      </div>
      <div class="flex gap1">
        <button class="btn primary mlauto" @click="check" v-if="!result">Check</button>
        <button class="btn primary mlauto" @click="state = 'result'" v-else>Go to Result</button>
      </div>
    </template>
  </section>
</template>
<script>
import {useRoute} from "vue-router";
import {httpApi} from "@/utils/fetch";
import BaseInput from "@/components/BaseInput";
import {reactive, ref} from "@vue/reactivity";
import {secondsToTime} from "@/utils/timeFormat";
import {shuffleValues} from "@/utils/shuffle";

export default {
  name: 'CheckView',
  components: {BaseInput},
  async setup() {
    const route = useRoute()
    const errors = ref({})
    const state = ref('start')

    const test = (await httpApi(`tests/${route.params.id}`))?.data
    const started = Date.now()

    const form = reactive({
      data: test.questions.map(el => {
        if (el.type === 'multiple') el.value = []
        if (el.type === 'matching') el.value = shuffleValues(el.answer)
        return el
      })
    })

    const result = ref(null)

    async function check() {
      form.time = secondsToTime((Date.now() - started) / 1000 ^ 0)
      errors.value = {}
      const {data, code} = await httpApi(`tests/${route.params.id}`, 'POST', form)
      if (code === 422) {
        errors.value = data.errors
        return
      }
      result.value = data
      console.log(data)
      state.value = 'result'
    }

    const dragged = ref(null);

    function drag(answer) {
      dragged.value = answer;
    }

    function drop(question, answer) {
      if (question.answer.map(el => el.id).includes(dragged.value.id))
        [dragged.value.value, answer.value] = [answer.value, dragged.value.value];
      dragged.value = null;
    }

    function isOk(index) {
      const checkData = result.value?.checkData

      return checkData[index].is_correct
    }

    function checkClasses(index) {
      return result.value ? {ok: isOk(index), wrong: !isOk(index)} : {}
    }

    function correctAnswer(question) {
      switch (question.type) {
        case 'text':
          return question.answer
        case 'single':
          return question.answer.find(el => el.is_correct).value
        case 'multiple':
          return question.answer.filter(el => el.is_correct).map(el => el.value).join(', ')
        case 'matching':
          return question.answer.map(({key, value}) => `${key} -> ${value}`).join(', ')
      }
    }

    return {test, check, form, errors, drag, drop, state, result, isOk, checkClasses, correctAnswer, restart: location.reload}
  }
}
</script>