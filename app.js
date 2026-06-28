// selecting html elements
const form = document.querySelector('#pokemon-form');
const input = document.querySelector('#pokemon-input');
const statusMessage = document.querySelector('#status');

// selected pokemon display areas
const pokemonImageArea = document.querySelector("#pokemon-image-area");
const pokemonDetailsArea = document.querySelector("#pokemon-details-area");
const pokedexEntryArea = document.querySelector("#pokedex-entry"); 
const currentPokemonIcon = document.querySelector("#current-pokemon-icon");
const currentPokemonName = document.querySelector("#current-pokemon-name");

// TIME
const pokeTime = document.querySelector("#poke-time");

// randomizer
const randomButton = document.querySelector("#random-btn");
const useRandomButton = document.querySelector("#use-random-button");
const randomPokemonArea = document.querySelector("#random-pokemon-area");

let randomPokemonData = null;


// listen for the form being submitted
form.addEventListener('submit', function(event){
    // prevents page refresh when form is submitted
    event.preventDefault();
    // get the pokemon name from the input and converts to lowercase for the API to accept
    const pokemonName = input.value.trim().toLowerCase();
    // makes sure the user entered a pokemon name. its checking
    if (pokemonName === ""){
        statusMessage.textContent = "Please enter a Pokémon name.";
        return;
    }

    statusMessage.textContent = "";
    showLoader(pokemonImageArea, "Loading Pokémon...");
    showLoader(pokemonDetailsArea, "Gathering details...");


    //<p>Searching for: ${pokemonName}...</p>
    // call the function that fetches pokemon data from the API
    getPokemon(pokemonName);
});

// generates a random pokemon when the Randomize button is clicked
randomButton.addEventListener("click", function() {
    getRandomPokemon();
});
//uses the generated random pokemon as the selected pokemon
useRandomButton.addEventListener("click", function() {
    // makes sure a random pokemon is generated
    if(randomPokemonData) {
            showLoader(pokemonImageArea, "Loading Pokemon...");
            showLoader(pokemonDetailsArea, "Gathering details...");

            getPokemon(randomPokemonData.name, 800);
    }

});

// shows loading dots inside a selected area
function showLoader(area, message) {
    area.innerHTML = `
        <div class="loader-box">
            <div class="loader-badges">
                <img src="images/badges/loader/grass.png" alt="Grass badge">
                <img src="images/badges/loader/fire.png" alt="Fire badge">
                <img src="images/badges/loader/water.png" alt="Water badge">
                <img src="images/badges/loader/electric.png" alt="Electric badge">
            </div>
            <p>${message}</p>
        </div>
    `;
}

// async function to fetch the pokemon data from the API woo!
async function getPokemon(pokemonName, delay = 1400)
{
    try{
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        // TEMP: keeps the loader on the screen for 1.2 seconds! 
        // this was just a test but 1200 was too long
        // await new Promise(resolve => setTimeout(resolve, 1200));

        // NEW: keeps the loader on the screen for 1200ms instead.
        await new Promise(resolve => setTimeout(resolve, delay));

        // if the pokemon doesnt exist, it'll force an error
        if(!response.ok)
        {
            throw new Error("Pokemon not found, Sorry! :<");
        }

        const data = await response.json();

        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();

        // POKEDEX ENTRY

        const englishEntry = speciesData.flavor_text_entries.find(
            entry => entry.language.name === "en"
        );

        const flavorText = englishEntry.flavor_text
            .replace(/\f/g, " ")
            .replace(/\n/g, " ");
        
            pokedexEntryArea.textContent = flavorText;

        // print the pokemon data in the console
        //console.log(data)
        //console.log(data.sprites.front_default);

        // this makes it to where any TYPE of pokemon, the name will be colored to that specific type!
        const typeColors = 
        {
            electric: "#f7d02c",
            fire: "#ee8130",
            water: "#6390f0",
            grass: "#7ac74c",
            psychic: "#f95587",
            ice: "#96d9d6",
            dark: "#705746",
            fairy: "#d685ad",
            ghost: "#735797",
            dragon: "#6f35fc",
            bug: "#a6b91a",
            normal: "#a8a77a",
            poison: "#a33ea1",
            ground: "#e2bf65",
            fighting: "#c22e28",
            rock: "#b6a136",
            steel: "#b7b7ce",
            flying: "#a98ff3"
        };

        const mainType = data.types[0].type.name;
        const nameColor = typeColors[mainType] || "#000000";

        // shows a status once the pokemon is found
        //statusMessage.textContent = `${data.name} found! Woo!`;

        // Shows a status message while also capitalizing things properly
        statusMessage.textContent = "";

        const formattedName = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        currentPokemonName.textContent = formattedName;
        currentPokemonIcon.innerHTML = `
            <img
                src="${data.sprites.front_default}"
                alt="${formattedName}"
                class= "current-pokemon-sprite"
            >
        `;
    
        pokemonImageArea.innerHTML = `
        <img
            src="${data.sprites.front_default}"
            alt="${data.name}"
            class="pokemon-sprite"
            >
        `;

        pokemonDetailsArea.innerHTML = `
        <h2 style="color:${nameColor};">
            ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}
        </h2>

        <p>
            <strong>Type:</strong>
            ${data.types
                .map(type => type.type.name)
                .join(", ")}
        </p>

        <p>
            <strong>Height:</strong>
            ${(data.height / 10).toFixed(1)} m
        </p>

        <p>
            <strong>Weight:</strong>
            ${(data.weight / 10).toFixed(1)} kg
        </p>

        <p>
            <strong>Abilities:</strong>
            ${data.abilities
                .map(ability => ability.ability.name)
                .join(", ")
            }
        </p>
        `;

    }
    catch (error)
    {
        console.error(error);

        // shows a error message
        statusMessage.textContent = "Pokémon not found. Please try again! Wompwomp :(";

        // clear old pokemon card if it fails
        pokemonImageArea.innerHTML = "";
        pokemonDetailsArea.innerHTML = "";
        pokedexEntryArea.innerHTML = "";
    }
    
}

// RANDOM POKEMON FUNCTION
async function getRandomPokemon()
{
    try
    {

        showLoader(randomPokemonArea, "Randomizing...");
        useRandomButton.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 600));

        // generates a random pokemon id
        const randomId = Math.floor(Math.random() * 1025) + 1;

        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${randomId}`
        );

        if (!response.ok)
        {
            throw new Error("Random Pokémon not found.");
        }

        const data = await response.json();
        // stores the random pokemon so it can be used later :3
        randomPokemonData = data;

        const formattedName =
            data.name.charAt(0).toUpperCase() + data.name.slice(1);
        
        randomPokemonArea.innerHTML = `
            <div class="random-pokemon-card">
                <img
                    src="${data.sprites.front_default}"
                    alt="${formattedName}"
                    class="current-pokemon-sprite"
                >
                    <h3>${formattedName}</h3>
            </div>
        `;
        // enables the "use this pokemon" button
        useRandomButton.disabled = false;
    }

    catch(error)
    {
        console.error(error);

        randomPokemonArea.innerHTML = `
        <p>Unable to load a random Pokemon.</p>
        `;

        useRandomButton.disabled = true;
    }
}

// TIME FUNCTION [LIVE CLOCK POKEMON:OCLOCK]
function updateTime() {
    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    });

    pokeTime.textContent = time;
}

// START THE LIVE CLOCK
updateTime();
setInterval(updateTime, 1000);