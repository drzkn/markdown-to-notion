export function cuentaLetras(cadena: string) {
  const vocales = ['a', 'e', 'i', 'o', 'u'];
  let total = 0;

  for (let char of cadena) {
    vocales.includes(char) ? total++ : total;
  }

  return total;
}
