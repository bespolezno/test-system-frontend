<template>
  <section id="tests" class="container-sm">
    <div class="card">
      <div class="flex jcsb aic p1">
        <h2 class="m0">Your tests</h2>
        <RouterLink :to="{name: 'CreateTest'}" class="btn primary sm">Create</RouterLink>
      </div>
      <div class="table-wrapper">
        <table>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Created at</th>
            <th width="210">Actions</th>
          </tr>
          <tr v-for="(test, i) in tests" :key="test.id">
            <td>{{ i + 1 }}</td>
            <td>{{ test.title }}</td>
            <td>{{ test.created_at }}</td>
            <td>
              <RouterLink :to="{name: 'Test', params: {id: test.id}}" class="btn sm secondary" >Open</RouterLink>
              <button class="btn secondary sm ml1" @click="copy({name: 'Check', params: {id: test.uuid}})" >Copy link</button>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </section>
</template>
<script>
import {httpApi} from "@/utils/fetch";
import {useRouter} from "vue-router";

export default {
  name: 'TestsView',
  async setup() {
    const router = useRouter();
    const tests = (await httpApi('tests'))?.data;

    function copy(linkObj) {
      const link = location.origin + router.resolve(linkObj).href
      navigator.clipboard.writeText(link);
    }

    return {tests, copy, host: location.origin}
  }
}
</script>