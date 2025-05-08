import { revert, sumar, primeroUltimo, duplicar, esPalindromo, aleatorio } from '../suma';
import { parInpar } from '../parInpar';
describe('funciones', () => {
  it('sumar', () => {
    const reusl = sumar(1, 2)
    expect(reusl).toBe(3);
  })

  it('impar', () => {
    const impar = parInpar(3);
    expect(impar).toBe('impar')
  })

  it('par', () => {
    const par = parInpar(2);
    expect(par).toBe('par')
  })

  it('revert', () => {
    const result = revert('hola');

    expect(result).toBe('aloh');
  })

  it('primeroUltimo', () => {
    const result = primeroUltimo('casa');

    expect(result).toBe('ca')
  })

  it('primeroUltimo', () => {
    const result = primeroUltimo('ainhoa');

    expect(result).toBe('aa')
  })

  it('duplicar', () => {
    const result = duplicar([1, 2, 3]);

    expect(result).toStrictEqual([2, 4, 6])
  })

  it('duplicar', () => {
    const result = duplicar([2, 4, 6]);

    expect(result).toStrictEqual([4, 8, 12])
  })

  it('esPalindromo', () => {
    const result = esPalindromo('arroz');

    expect(result).toBeFalsy()
  })

  it('esPalindromo', () => {
    const result = esPalindromo('oso');

    expect(result).toBeTruthy()
  })

  it('aleatorio', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const result = aleatorio();

    expect(result).toBe(5)
  })
})