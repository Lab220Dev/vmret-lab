import { createApp } from 'vue';
import axios from './axios';
import App from './App.vue';
import router from './router/router';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import i18n from './i18n';
import PrimeVue from 'primevue/config';
import AutoComplete from 'primevue/autocomplete';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import ConfirmationService from 'primevue/confirmationservice';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import DialogService from 'primevue/dialogservice';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import Fieldset from 'primevue/fieldset';
import FileUpload from 'primevue/fileupload';
import IconField from 'primevue/iconfield';
import Image from 'primevue/image';
import InlineMessage from 'primevue/inlinemessage';
import InputIcon from 'primevue/inputicon';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import Listbox from 'primevue/listbox';
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import MultiSelect from 'primevue/multiselect';
import Password from 'primevue/password';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Rating from 'primevue/rating';
import RadioButton from 'primevue/radiobutton';
import Row from 'primevue/row';
import SelectButton from 'primevue/selectbutton';
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import Skeleton from 'primevue/skeleton';
import Sidebar from 'primevue/sidebar';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Toolbar from 'primevue/toolbar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Timeline from 'primevue/timeline';
import Tooltip from 'primevue/tooltip';
import VirtualScroller from 'primevue/virtualscroller';
import { createPinia } from 'pinia';
import '@/assets/styles.scss';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Configurar PrimeVue com tradução
app.use(PrimeVue, {
    locale: {
        startsWith: 'Começa com',
        contains: 'Contém',
        notContains: 'Não contém',
        endsWith: 'Termina com',
        equals: 'Igual a',
        notEquals: 'Diferente de',
        noFilter: 'Sem filtro',
        lt: 'Menor que',
        lte: 'Menor ou igual a',
        gt: 'Maior que',
        gte: 'Maior ou igual a',
        is: 'É',
        isNot: 'Não é',
        before: 'Antes de',
        after: 'Depois de',
        dateIs: 'Data é',
        dateIsNot: 'Data não é',
        dateBefore: 'Data antes de',
        dateAfter: 'Data depois de',
        clear: 'Limpar',
        apply: 'Aplicar',
        matchAll: 'Corresponde a todos',
        matchAny: 'Corresponde a qualquer',
        addRule: 'Adicionar regra',
        removeRule: 'Remover regra',
        accept: 'Aceitar',
        reject: 'Rejeitar',
    }
});
app.use(i18n);
app.use(router);
app.use(PrimeVue, { ripple: true });
app.use(ToastService);
app.use(DialogService);
app.use(ConfirmationService);

app.directive('tooltip', Tooltip);
app.directive('badge', );

app.component('Accordion', Accordion);
app.component('AccordionTab', AccordionTab);
app.component('AutoComplete', AutoComplete);
app.component('Avatar', Avatar);
app.component('Button', Button);
app.component('Calendar', Calendar);
app.component('Card', Card);
app.component('Chart', Chart);
app.component('Checkbox', Checkbox);
app.component('Column', Column);
app.component('DataTable', DataTable);
app.component('Dialog', Dialog);
app.component('Divider', Divider);
app.component('Dropdown', Dropdown);
app.component('Fieldset', Fieldset);
app.component('FileUpload', FileUpload);
app.component('IconField', IconField);
app.component('Image', Image);
app.component('InlineMessage', InlineMessage);
app.component('InputIcon', InputIcon);
app.component('InputMask', InputMask);
app.component('InputNumber', InputNumber);
app.component('InputSwitch', InputSwitch);
app.component('InputText', InputText);
app.component('Listbox', Listbox);
app.component('Menu', Menu);
app.component('Menubar', Menubar);
app.component('MultiSelect', MultiSelect);
app.component('Password', Password);
app.component('ProgressBar', ProgressBar);
app.component('ProgressSpinner', ProgressSpinner);
app.component('RadioButton', RadioButton);
app.component('Rating', Rating);
app.component('Row', Row);
app.component('SelectButton', SelectButton);
app.component('ScrollPanel', ScrollPanel);
app.component('ScrollTop', ScrollTop);
app.component('Sidebar', Sidebar);
app.component('Skeleton', Skeleton);
app.component('Splitter', Splitter);
app.component('SplitterPanel', SplitterPanel);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('Tag', Tag);
app.component('Textarea', Textarea);
app.component('Timeline', Timeline);
app.component('Toast', Toast);
app.component('Toolbar', Toolbar);
app.component('VirtualScroller', VirtualScroller);
app.config.globalProperties.$axios = axios;
app.use(pinia);
app.mount('#app');
