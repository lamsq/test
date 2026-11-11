import { createApp } from 'vue';
import App from './App.vue';

const root = document.getElementById('app');
if (root) {
    createApp(App, {
        endpoint: root.dataset.endpoint,
        page: root.dataset.page === 'home' ? 'home' : 'shifts',
        homeUrl: root.dataset.homeUrl,
        shiftsUrl: root.dataset.shiftsUrl,
    }).mount(root);
}
