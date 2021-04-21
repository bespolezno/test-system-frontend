import {createRouter, createWebHashHistory} from 'vue-router'
import TestsView from "@/views/TestsView";
import CreateTestView from "@/views/CreateTestView";
import CheckView from "@/views/CheckView";
import LoginView from "@/views/LoginView";
import RegisterView from "@/views/RegisterView";
import NotFoundView from "@/views/NotFoundView";
import TestView from "@/views/TestView";

const routes = [
  {
    path: '/',
    name: 'Tests',
    component: TestsView
  },
  {
    path: '/create',
    name: 'CreateTest',
    component: CreateTestView
  },
  {
    path: '/test/:id',
    name: 'Check',
    component: CheckView
  },
  {
    path: '/test/:id/info',
    name: 'Test',
    component: TestView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/not-found',
    name: 'NotFound',
    component: NotFoundView
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/not-found'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
