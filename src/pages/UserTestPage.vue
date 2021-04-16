<template>
  <section class="container mb2">
    <h1 class="white">{{ test.title }}</h1>
  </section>
  <section class="container mb1">
    <div class="card mb1">
      <div class="flex jcsb aic">
        <h4>Информация</h4>
        <a href="#" class="btn btn-danger mlauto" @click="deleteTest">Удалить</a>
      </div>
      <div class="col2">
        <div>
          <p><b>Дата создания:</b> {{ test.created_at }}</p>
          <p><b>Количество вопросов:</b> {{ test.questions.length }}</p>
          <p><b>Ссылка:</b> <a :href="testLink(test.uuid)">{{ testLink(test.uuid) }}</a></p>
          <p><b>Пройден:</b> {{ responses.length }}</p>
          <p><b>Средний балл:</b> {{ isNaN(avg) ? 0 : avg }}%</p>
          <a href="#" class="btn btn-secondary" @click="$root.changePage('TestPage', {id: test.uuid, back: {page: 'UserTestPage', params: {id: test.id}}})">Пройти</a>
        </div>
        <div>
          <p><b>Описание:</b> {{ test.description }}</p>
        </div>
      </div>
    </div>
    <div class="card">
      <canvas id="chartQuestions" width="400" height="100"></canvas>
    </div>
  </section>
  <section class="container mb1">
    <div class="card mb1">
      <h4 class="mb0">Ответы</h4>
    </div>
    <div class="card mb1" v-for="response in responses" :key="response.id">
      <div class="col2">
        <div>
          <p><b>Имя:</b> {{ response.name }}</p>
          <p><b>IP:</b> {{ response.ip }}</p>
          <p><b>Дата прохождения:</b> {{ response.created_at }}</p>
        </div>
        <div>
          <p><b>Время прохождения:</b> {{ response.time }}</p>
          <p><b>Правильные ответы:</b> {{ response.correct_answers }}</p>
          <p><b>Процент выполнения:</b> {{ response.correct }}%</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {httpApi} from "@/utils/fetch";
import {onMounted, ref} from "vue";
import {Chart, registerables} from "chart.js";
import {unref} from "@vue/reactivity";
import {testLink} from "@/utils/link";

function isOk(question, answer) {
  return (question.type === 'text' && question.answer === answer.answer) ||
      (question.type === 'single' && question.answers.filter(a => a.is_correct).map(a => a.id).includes(answer.id)) ||
      (question.type === 'multiple' && question.answers.every(a => !!answer.ids.includes(a.id) === !!a.is_correct)) ||
      (question.type === 'matching' && answer.answers.every(a => question.answers.find(qa => qa.id === a.id).value === a.value));
}

export default {
  async setup(params, {emit}) {
    const {id} = JSON.parse(localStorage.params);
    const test = ref({});
    const responses = ref([]);

    onMounted(() => {
      Chart.register(...registerables);

      const questionData = unref(test).questions.map(question => ({
        ...question,
        data: unref(responses).map(el => isOk(question, el.data.find(i => i.question_id === question.id)))
      }));

      new Chart(document.getElementById('chartQuestions').getContext('2d'), {
        type: 'bar',
        data: {
          labels: questionData.map((el, i) => `Вопрос ${i + 1}`),
          datasets: [{
            label: '% правильных ответов',
            data: questionData.map(el => Math.round(el.data.filter(Boolean).length / el.data.length * 100)),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      })
    });

    const data = (await httpApi(`tests/${id}/info`, 'GET', null, true))?.data;
    test.value = data.test;
    responses.value = data.responses;
    const avg = Math.round(unref(responses).map(el => el.correct).reduce((acc, el) => acc + el, 0) / unref(responses).length);

    async function deleteTest() {
      await httpApi(`tests/${id}`, 'DELETE', null, true);
      emit('changePage', 'UserTestsPage')
    }

    return {test, responses, avg, testLink, deleteTest}
  }
}
</script>

<style scoped>

</style>
