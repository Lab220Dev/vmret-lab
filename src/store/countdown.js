// store/countdown.js

import { defineStore } from 'pinia';

export const useCountdownStore = defineStore('countdown', {
  state: () => ({
    startTime: null,
    duration: 0  
  }),
  getters: {
    millisecondsRemaining(state) {
      if (!state.startTime) return 0;

      const elapsed = Date.now() - state.startTime;
      return Math.max(state.duration - elapsed, 0);
    }
  },
  actions: {
    startCountdown(durationInMilliseconds) {
      this.startTime = Date.now();
      this.duration = durationInMilliseconds;

      const interval = setInterval(() => {
        if (this.millisecondsRemaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);  
    }
  },
  persist: true  
});
