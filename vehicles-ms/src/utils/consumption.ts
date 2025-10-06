export function estimateAverageConsumption(
  machineryType: 'LIGHT' | 'HEAVY',
  engineType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID',
  engineDisplacement: number,
  year: number,
): number {
  const ageFactor = 1 + (2025 - year) * 0.02; 

  if (machineryType === 'LIGHT') {
    switch (engineType) {
      case 'GASOLINE':
        if (engineDisplacement <= 1.5) return parseFloat((5.0 * ageFactor).toFixed(1));
        if (engineDisplacement <= 2.0) return parseFloat((6.5 * ageFactor).toFixed(1));
        if (engineDisplacement <= 2.5) return parseFloat((7.5 * ageFactor).toFixed(1));
        return parseFloat((9.0 * ageFactor).toFixed(1));
      case 'DIESEL':
        if (engineDisplacement <= 2.0) return parseFloat((4.8 * ageFactor).toFixed(1));
        if (engineDisplacement <= 3.0) return parseFloat((6.5 * ageFactor).toFixed(1));
        return parseFloat((7.5 * ageFactor).toFixed(1));
      case 'HYBRID':
        return parseFloat((3.5 * ageFactor).toFixed(1));
      case 'ELECTRIC':
        return 0;
    }
  }

  if (machineryType === 'HEAVY') {
    switch (engineType) {
      case 'DIESEL':
        if (engineDisplacement <= 6) return parseFloat((24.0 * ageFactor).toFixed(1));
        if (engineDisplacement <= 9) return parseFloat((32.0 * ageFactor).toFixed(1));
        return parseFloat((40.0 * ageFactor).toFixed(1));
      case 'GASOLINE':
        return parseFloat((28.0 * ageFactor).toFixed(1));
      case 'HYBRID':
        return parseFloat((18.0 * ageFactor).toFixed(1));
      case 'ELECTRIC':
        return 0;
    }
  }

  return parseFloat((8.0 * ageFactor).toFixed(1));
}
