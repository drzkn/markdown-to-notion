export const sumar = (a: number, b: number) => {
  return a + b;
}

export const revert = (cadena: string) => {
  return cadena.split('').reverse().join('')
}

export const primeroUltimo = (cadena: string) => {
  return cadena[0] + cadena[cadena.length - 1]
}

export const duplicar = (numeros: number[]) => {
  return numeros.map(item => item * 2);
}

export const esPalindromo = (cadena: string) => {
  return cadena === revert(cadena);
}

export const aleatorio = () => {
  return Math.round(Math.random() * 10)
}