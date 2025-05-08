import { getPokemon } from "../pokeApi";

describe('getPokemon', () => {
  it('should call the pokeApi with the correct url', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ test: 100 }),
      }),
    ) as jest.Mock;

    await getPokemon();

    expect(global.fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/tpye/10?limit=100000')
  })
});
