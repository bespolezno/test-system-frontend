<template>
  <header class="container flex aic jcsb">
    <RouterLink :to="{name: 'Tests'}" style="text-decoration: none !important; color: #333333">
      <h1 class="m0">Test system</h1>
    </RouterLink>
    <button class="btn secondary sm" @click="logout">Logout</button>
  </header>
  <main>
    <router-view v-slot="{ Component }">
      <Suspense timeout="0">
        <component :is="Component"></component>
        <template #fallback>
          <section class="screen flex jcc aic">
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          </section>
        </template>
      </Suspense>
    </router-view>
  </main>
</template>

<script>
import '@/assets/css/all.css';
import '@/assets/css/style.css';
import {useRouter} from "vue-router";
import {onErrorCaptured} from "vue";

export default {
  setup() {
    const router = useRouter();

    function logout() {
      localStorage.clear();
      router.push({name: 'Login'})
    }

    onErrorCaptured(err => {
      if (err.message === 'Unauthorized') {
        router.push({name: 'Login'});
        return false;
      }
      return true;
    })

    return {logout}
  }
}
</script>

<style scoped>
.lds-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>