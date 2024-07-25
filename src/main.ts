import { createApp } from "vue";
import App from "./App.vue";
import installMain from "@/plugins";

const app = createApp(App);
installMain(app);

app.mount("#app");
