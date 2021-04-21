<template>
  <section id="tests" class="container-sm">
    <RouterLink :to="{name: 'Tests'}" class="btn secondary sm mb1">Back</RouterLink>
    <div class="card p1 mb1">
      <div class="flex jcsb aic">
        <h2 class="m0">{{ test.test?.title }}</h2>
        <button @click="deleteTest" class="btn sm danger">Delete</button>
      </div>
      <p>{{ test.test?.description }}</p>
      <p><b>Link:</b> <RouterLink :to="{name: 'Check', params: {id: test.test?.uuid}}" v-slot="{href}">{{ host + href }}</RouterLink></p>

    </div>

    <div class="card mb1">
      <canvas id="chartQuestions" width="400" height="100"></canvas>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Ip</th>
            <th>Time</th>
            <th>Result</th>
            <th>Passed</th>
            <th width="100"></th>
          </tr>
          <template v-for="(response, i) in test.responses" :key="response.id">
            <tr>
              <th>{{ i + 1 }}</th>
              <td>{{ response.name }}</td>
              <td>{{ response.ip }}</td>
              <td>{{ response.time }}</td>
              <td>{{ response.correct }}%</td>
              <td>{{ response.created_at }}</td>
              <td>
                <button class="btn secondary sm" @click="response.show = !response.show">Show</button>
              </td>
            </tr>
            <tr>
              <td colspan="7" style="padding: 0">
                <Transition name="spoiler">
                  <div v-if="response.show" :key="'i' + response.id" class="p1">
                    <pre class="m0">{{ makeResponse(response.data) }}</pre>
                  </div>
                </Transition>
              </td>
            </tr>
          </template>
        </table>
      </div>
    </div>
  </section>
</template>
<script>
import {httpApi} from "@/utils/fetch";
import {useRoute, useRouter} from "vue-router";
import {onMounted, watch} from "vue";
import {Chart, registerables} from "chart.js";
import {ref} from "@vue/reactivity";

export default {
  name: 'TestView',
  async setup() {
    const route = useRoute();
    const router = useRouter();
    const test = ref({});
    watch(route.params, async () => test.value = (await httpApi(`test/${route.params.id}/info`))?.data)

    onMounted(() => {
      Chart.register(...registerables);
      console.log(test.value)

      const answers = test.value.responses.map(el => el.checkData.map(item => item.is_correct))
      const questionData = Array.from(
          {length: answers[0]?.length ?? 0},
          (_, i) => Math.round(answers.map(el => el[i]).filter(Boolean).length / answers.length * 100)
      )

      new Chart(document.getElementById('chartQuestions').getContext('2d'), {
        type: 'bar',
        data: {
          labels: questionData.map((el, i) => `Question ${i + 1}`),
          datasets: [{
            label: '% of correct answers',
            data: questionData,
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

    test.value = (await httpApi(`tests/${route.params.id}/info`))?.data;

    async function deleteTest() {
      await httpApi(`tests/${route.params.id}`, 'DELETE');
      await router.push({name: 'Tests'})
    }

    function makeResponse(data) {
      return data.map(question => {
        switch (question.type) {
          case 'text':
            return `${question.question}: ${question.value}`
          case 'single':
            return `${question.question}: ${question.answer.find(el => el.id === question.value).value}`
          case 'multiple':
            return `${question.question}: ${question.value.map(id => question.answer.find(el => el.id === id).value).join(', ')}`
          case 'matching':
            return `${question.question}: ${question.value.map(({key, value}) => `${key} -> ${value}`).join(', ')}`
        }
      }).map((el, i) => `${i + 1}. ${el}`).join('\n')
    }

    return {test, host: location.origin, deleteTest, makeResponse}
  }
}
</script>