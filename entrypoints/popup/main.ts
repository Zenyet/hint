import './style.css';
import './settings.css';
import { Settings } from '../components/Settings';

const app = document.querySelector<HTMLDivElement>('#app')!;
const settings = new Settings();
app.appendChild(settings.getElement());
