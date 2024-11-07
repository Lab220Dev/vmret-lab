<script setup>
import { computed, watch, ref } from 'vue';
import MyTopBar from './MytopBar.vue';
import AppFooter from './AppFooter.vue';
import MySideBar from './mysidebar.vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const loading = ref(false);
const outsideClickListener = ref(null);


watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

const containerClass = computed(() => {
    return {
        'layout-theme-light': layoutConfig.darkTheme.value === 'light',
        'layout-theme-dark': layoutConfig.darkTheme.value === 'dark',
        'layout-overlay': layoutConfig.menuMode.value === 'overlay',
        'layout-static': layoutConfig.menuMode.value === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive.value,
        'layout-mobile-inactive': !layoutState.staticMenuMobileActive.value,
        'layout-mobile-active': layoutState.staticMenuMobileActive.value,
        'p-ripple-disabled': layoutConfig.ripple.value === false
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive.value = false;
                layoutState.staticMenuMobileActive.value = false;
                layoutState.menuHoverActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};

const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value);
        outsideClickListener.value = null;
    }
};

const isOutsideClicked = (event) => {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div>
        <LoadingSpinner v-if="loading" />
        <div v-else class="layout-wrapper" :class="containerClass">
            <MyTopBar></MyTopBar>
            <div class="layout-sidebar">
                <MySideBar></MySideBar>
            </div>
            <div class="layout-main-container">
                <div class="layout-main">
                    <router-view></router-view>
                </div>
                <AppFooter></AppFooter>
            </div>
        </div>
        <Toast />
    </div>
</template>

<style lang="scss" scoped></style>
