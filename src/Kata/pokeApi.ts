export const getPokemon = async () => {
  const url = 'https://pokeapi.co/api/v2/tpye/10?limit=100000';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }

    const json = await response.json();
    console.log(json)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}