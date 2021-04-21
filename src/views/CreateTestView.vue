<template>
  <section id="create" class="container-sm">
    <div class="card p1 mb1">
      <h2>New Test</h2>
      <BaseInput type="text" label="Title" :error="errors.title ?? errors.ratings ?? errors.questions" v-model="form.title"/>
      <BaseInput type="text" label="Description" :error="errors.description" v-model="form.description"/>
      <div class="flex aic jcsb mt1">
        <h4 class="m0">Ratings</h4>
      </div>
      <div class="flex ais gap1 nowrap" v-for="(rating, i) in form.ratings" :key="rating.id">
        <BaseInput type="text" label="Text" :error="errors[`ratings.${i}.text`]" v-model="rating.text" class="w100"/>
        <BaseInput type="number" label="Min" :error="errors[`ratings.${i}.min`]" v-model="rating.min"/>
        <BaseInput type="number" label="Max" :error="errors[`ratings.${i}.max`]" v-model="rating.max"/>
        <button class="btn danger sm inline" @click="removeRating(rating)">Delete</button>
      </div>
      <button class="btn primary sm" @click="addRating">Add</button>
    </div>
    <div class="card p1 mb1" v-for="(question, i) in form.questions" :key="question.id">
      <div class="flex ais gap1 nowrap mb1">
        <BaseInput type="text" label="Question" class="w100 m0" :error="errors[`questions.${i}.question`]"
                   v-model="form.questions[i].question"/>
        <button class="btn danger sm inline" @click="removeQuestion(question)">Delete</button>
      </div>
      <BaseInput type="text" class="w100" v-model="question.answer" label="Answer" :error="errors[`questions.answer`]" v-if="question.type === 'text'"/>
      <template v-else>
        <div class="flex ais jcsb mb1">
          <h4 class="m0">Answers</h4>
        </div>
        <div class="flex ais gap1 nowrap" v-for="(answer, ai) in question.answers" :key="answer.id">
          <template v-if="question.type === 'multiple'">
            <input type="checkbox" class="mtl" v-model="answer.is_correct">
            <BaseInput type="text" class="w100" v-model="answer.value" :error="errors[`questions.${i}.answers.${ai}.value`]"/>
          </template>
          <template v-else-if="question.type === 'single'">
            <input type="radio" class="mtl" v-model="question.answer" :value="answer.id" :name="'single' + question.id">
            <BaseInput type="text" class="w100" v-model="answer.value" :error="errors[`questions.${i}.answers.${ai}.value`]"/>
          </template>
          <template v-else-if="question.type === 'matching'">
            <BaseInput label="Key" type="text" class="m0 w100" v-model="answer.key" :error="errors[`questions.${i}.answers.${ai}.key`]"/>
            <BaseInput label="Value" type="text" class="m0 w100" v-model="answer.value" :error="errors[`questions.${i}.answers.${ai}.value`]"/>
          </template>
          <button class="btn danger sm inline" @click="deleteAnswer(question, answer)" :class="{m0: question.type !== 'matching'}">Delete</button>
        </div>
      </template>
      <button class="btn primary sm mt1" @click="addAnswer(question)" v-if="question.type !== 'text'">Add</button>
    </div>
    <div class="flex gap1">
      <button class="btn square secondary" @click="addQuestion('multiple')"><i class="fas fa-check-square"></i></button>
      <button class="btn square secondary" @click="addQuestion('single')"><i class="fas fa-dot-circle"></i></button>
      <button class="btn square secondary" @click="addQuestion('text')"><i class="fas fa-font"></i></button>
      <button class="btn square secondary" @click="addQuestion('matching')"><i class="fas fa-list-ul"></i></button>
      <button class="btn primary mlauto" @click="createTest">Save</button>
    </div>
  </section>
</template>
<script>
import {reactive, ref} from "@vue/reactivity";
import BaseInput from "@/components/BaseInput";
import {httpApi} from "@/utils/fetch";
import {useRouter} from "vue-router";

export default {
  name: 'CreateTestView',
  components: {BaseInput},
  setup() {
    let counter = 1;

    const form = reactive({questions: [], ratings: [{id: counter++, min: 0, max: 100}]})
    const errors = ref({})
    const router = useRouter()

    function addQuestion(type) {
      form.questions.push({id: counter++, type, answers: [{id: counter++, is_correct: false}]})
    }

    function removeQuestion(question) {
      form.questions.splice(form.questions.findIndex(el => el === question), 1)
    }

    function addAnswer(question) {
      question.answers.push({id: counter++, is_correct: false})
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

      const questions = form.questions.map(el => {
        if (el.type === 'single') {
          const id = el.answer;
          el.answer = null;
          const item = el.answers.find(item => item.id === id);
          if (item) item.is_correct = true;
        }
        return el;
      });

      const {data, code} = await httpApi('tests', 'POST', {...form, questions});
      if (code === 422) {
        errors.value = data.errors
        return
      }
      await router.push({name: 'Tests'})
    }

    return {form, errors, addQuestion, removeQuestion, addAnswer, deleteAnswer, createTest, addRating, removeRating}
  }
}
</script>