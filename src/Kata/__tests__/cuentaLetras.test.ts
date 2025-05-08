import { cuentaLetras } from '../cuentaLetras';

describe('cuentaLetras', () => {
  it('cuenta correctamente las letras en la frase', () => {
    const resul = cuentaLetras('Amigo, amiga, 540 es la revolución del software en Navarra. REV IS DEV');

    expect(resul).toBe(19)
  })

  it('cuenta correctamente las letras en la otra frase', () => {
    const resul = cuentaLetras('Aquí estamos los pibardos refacheros');

    expect(resul).toBe(12)
  })

  it('cuenta correctamente las letras en otra frase mas', () => {
    const resul = cuentaLetras('Que grande el queru que me va a dar puntos de vida');

    expect(resul).toBe(19)
  })
})