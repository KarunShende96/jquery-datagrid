import "./index.scss";
import { home } from "./src/home";
const app = document.createElement("div");
app.setAttribute("id", "app");
app.appendChild(home());
document.body.appendChild(app);