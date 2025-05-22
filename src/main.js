
import 'primeicons/primeicons.css'; // Ícones do PrimeVue
import 'primeflex/primeflex.css';// Estilos do PrimeFlex

import { createApp } from 'vue';
import axios from './axios';
import App from './App.vue';
import router from './router/router';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import i18n from './i18n';

import AutoComplete from 'primevue/autocomplete';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Aura from '@primeuix/themes/aura';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import ConfirmationService from 'primevue/confirmationservice';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import DialogService from 'primevue/dialogservice';
import Divider from 'primevue/divider';
import Drawer from 'primevue/drawer';
import Fieldset from 'primevue/fieldset';
import FileUpload from 'primevue/fileupload';
import Image from 'primevue/image';
import Message from 'primevue/message';
import InputIcon from 'primevue/inputicon';
import ToggleSwitch from 'primevue/toggleswitch';
import IconField from 'primevue/iconfield';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import Listbox from 'primevue/listbox';
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import MultiSelect from 'primevue/multiselect';
import Password from 'primevue/password';
import PrimeVue from 'primevue/config';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Rating from 'primevue/rating';
import RadioButton from 'primevue/radiobutton';
import Row from 'primevue/row';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import Skeleton from 'primevue/skeleton';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Toolbar from 'primevue/toolbar';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Timeline from 'primevue/timeline';
import Tooltip from 'primevue/tooltip';
import VirtualScroller from 'primevue/virtualscroller';
import { createPinia } from 'pinia';

import '@/assets/styles.scss';
import { definePreset } from '@primeuix/themes';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(i18n);
app.use(router);
app.use(pinia);

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
});

app.use(PrimeVue, {// Configuração do PrimeVue
    theme: {// Definindo o tema do PrimeVue
        preset: MyPreset,// Definindo o tema personalizado
        options: {// Definindo as opções do tema
            cssLayer: {// Definindo a camada CSS
                name: 'primevue',// Definindo o nome da camada CSS
                order: 'theme, base, primevue'// Definindo a ordem das camadas CSS
            }
        }
    },
    locale: { // Definindo o idioma para português do Brasil no componente DataTable Avançado
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
    },
    ripple: true // Ativar o efeito ripple
 });


app.use(ToastService);
app.use(DialogService);
app.use(ConfirmationService);


app.directive('badge',);
app.directive('tooltip', Tooltip);

app.component('Accordion', Accordion);
app.component('AccordionPanel', AccordionPanel);
app.component('AccordionHeader', AccordionHeader);
app.component('AccordionContent', AccordionContent);
app.component('AutoComplete', AutoComplete);
app.component('Avatar', Avatar);
app.component('Button', Button);
app.component('Card', Card);
app.component('Chart', Chart);
app.component('Checkbox', Checkbox);
app.component('Column', Column);
app.component('DataTable', DataTable);
app.component('DatePicker', DatePicker);
app.component('Dialog', Dialog);
app.component('Divider', Divider);
app.component('Drawer', Drawer);
app.component('Fieldset', Fieldset);
app.component('FileUpload', FileUpload);
app.component('IconField', IconField);
app.component('Image', Image);
app.component('Message', Message);
app.component('InputIcon', InputIcon);
app.component('InputMask', InputMask);
app.component('InputNumber', InputNumber);
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
app.component('Select', Select);
app.component('SelectButton', SelectButton);
app.component('ScrollPanel', ScrollPanel);
app.component('ScrollTop', ScrollTop);
app.component('Skeleton', Skeleton);
app.component('Splitter', Splitter);
app.component('SplitterPanel', SplitterPanel);
app.component('TabPanel', TabPanel);
app.component('Tabs', Tabs);
app.component('TabList', TabList);
app.component('TabPanels', TabPanels);
app.component('Tab', Tab);
app.component('Tag', Tag);
app.component('Textarea', Textarea);
app.component('Timeline', Timeline);
app.component('Toast', Toast);
app.component('Toolbar', Toolbar);
app.component('ToggleSwitch', ToggleSwitch);
app.component('VirtualScroller', VirtualScroller);
app.config.globalProperties.$axios = axios;
app.mount('#app');
