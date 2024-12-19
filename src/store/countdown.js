/**
 * Importa a função `defineStore` do Pinia, utilizada para criar e gerenciar stores reativos na aplicação.
 */
import { defineStore } from 'pinia';

/**
 * Cria e exporta o store `useCountdownStore` que gerencia um contador regressivo.
 * Este store armazena o tempo de início do contador, a duração do countdown e fornece ações para iniciar o contador e calcular o tempo restante.
 */
export const useCountdownStore = defineStore('countdown', {
  
  /**
   * Define o estado inicial do store, com as propriedades `startTime` e `duration`.
   * O estado é usado para armazenar o tempo de início e a duração do countdown.
   * @returns {Object} O estado inicial do store.
   */
  state: () => ({
    startTime: null, // Armazena o tempo em que o contador foi iniciado. Inicialmente é null.
    duration: 0, // Armazena a duração do countdown, em milissegundos. Inicialmente é 0.
  }),

  /**
   * Define os getters que retornam valores calculados com base no estado do store.
   * O getter `millisecondsRemaining` calcula o tempo restante do countdown.
   */
  getters: {
    
    /**
     * Retorna o número de milissegundos restantes do countdown.
     * Se o countdown não foi iniciado (`startTime` é null), retorna 0.
     * Caso contrário, calcula o tempo restante subtraindo o tempo decorrido da duração do countdown.
     * 
     * @param {Object} state - O estado do store, usado para acessar `startTime` e `duration`.
     * @returns {number} O número de milissegundos restantes no countdown, ou 0 se não houver tempo restante.
     */
    millisecondsRemaining(state) {
      if (!state.startTime) return 0; // Se o contador não foi iniciado, retorna 0.

      const elapsed = Date.now() - state.startTime; // Calcula o tempo decorrido desde o início do countdown.
      return Math.max(state.duration - elapsed, 0); // Retorna o tempo restante, garantindo que nunca seja negativo.
    }
  },

  /**
   * Define as ações que podem ser executadas neste store.
   * As ações manipulam o estado do store e podem realizar tarefas assíncronas ou de efeito colateral.
   */
  actions: {
    
    /**
     * Inicia o countdown, armazenando a duração em milissegundos e o tempo de início.
     * 
     * @param {number} durationInMilliseconds - A duração do countdown em milissegundos.
     */
    startCountdown(durationInMilliseconds) {
      this.startTime = Date.now(); // Armazena o tempo atual como o tempo de início do countdown.
      this.duration = durationInMilliseconds; // Define a duração do countdown.

      // Cria um intervalo que verifica a cada segundo se o countdown terminou.
      const interval = setInterval(() => {
        if (this.millisecondsRemaining <= 0) { // Se o tempo restante for 0 ou negativo
          clearInterval(interval); // Limpa o intervalo, terminando o countdown.
        }
      }, 1000); // O intervalo verifica o estado a cada 1000 milissegundos (1 segundo).
    }
  },

  /**
   * Habilita a persistência dos dados do store, ou seja, os dados serão mantidos mesmo após o refresh da página.
   */
  persist: true  
});