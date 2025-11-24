/**
 * Funções de formatação globais reutilizáveis
 */

/**
 * Formata um valor de volume de forma inteligente (apenas o número, sem "kg")
 * @param volume - Volume em kg
 * @returns String formatada (ex: "999", "1.2k", "10.5k", "100.2k", "1.0M")
 */
export const formatVolume = (volume: number): string => {
  if (!volume || typeof volume !== 'number' || isNaN(volume)) {
    return '0';
  }

  // Milhões
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  
  // Milhares - formatar sempre com 1 decimal se tiver parte decimal
  if (volume >= 10000) {
    const kValue = volume / 1000;
    // Se for número redondo (ex: 10000 = 10k), mostrar sem decimal
    if (kValue % 1 === 0) {
      return `${kValue.toFixed(0)}k`;
    }
    return `${kValue.toFixed(1)}k`;
  }
  
  // Milhares menores que 10k
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  
  // Valores menores que 1000
  return `${volume.toFixed(0)}`;
};

/**
 * Formata tempo em segundos para string legível
 * @param seconds - Tempo em segundos
 * @returns String formatada (ex: "5m 30s", "1h 5m")
 */
export const formatTime = (seconds: number): string => {
  if (!seconds || typeof seconds !== 'number' || isNaN(seconds)) {
    return '0s';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Formata data para formato legível
 * @param dateString - Data em ISO string
 * @returns String formatada (ex: "segunda-feira, 26 de out de 2024")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) {
    return 'Data não disponível';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return 'Data inválida';
  }
};

