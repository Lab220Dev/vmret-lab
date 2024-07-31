<script setup>
import { ref,onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore';
import AppMenuItem from './AppMenuItem.vue';

const store = useAuthStore();
const model= ref([{items:[]}])

const buildMenu = () => {
    model.value = [
        {
            items: store.menuItems
        }
    ];
};

onMounted(() => {
    buildMenu();
});

</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>

        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
