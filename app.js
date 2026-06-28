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

// BROWSE BY TYPE
const typeSelect = document.querySelector("#type-select");

// STATS AREA (moving around)
const statsArea = document.querySelector("#stats-area");

// randomizer
const randomButton = document.querySelector("#random-btn");
const useRandomButton = document.querySelector("#use-random-button");
const randomPokemonArea = document.querySelector("#random-pokemon-area");

// stores the currently generated random pokemon
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
// loads a random pokemon from the selected type
typeSelect.addEventListener("change", function() {
    // gets the selected pokemon type
    const selectedType = typeSelect.value;

    if (!selectedType) {
        statusMessage.textContent = "Choose a type to browse.";
        return;
    }

    getPokemonByType(selectedType);
});

// displays the animated loading badges inside a selected area
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

        // fetches additional species data for the pokedex entry
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

        // colors the pokemon name based on its primary type
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

        <div class="details-list">

            <div class="detail-row">
                <div class="detail-label">
                    <span class="detail-icon">📏</span>
                    <strong>Height</strong>
                </div>
                <span>${(data.height / 10).toFixed(1)} m</span>
            </div>

            <div class="detail-row">
                <div class="detail-label">
                    <span class="detail-icon">⚖️</span>
                    <strong>Weight</strong>
                </div>
                <span>${(data.weight / 10).toFixed(1)} kg</span>
            </div>

            <div class="detail-row detail-row-stacked">
                <div class="detail-label">
                    <span class="detail-icon">🏷️</span>
                    <strong>Types</strong>
                </div>

                <div class="type-badges">
                    ${
                        data.types.map(type => `
                            <div class="type-badge">
                                <img
                                    src="images/badges/types/${type.type.name}.png"
                                    alt="${type.type.name}"
                                >
                                <span>
                                    ${type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
                                </span>
                            </div>
                        `).join("")
                    }
                </div>
            </div>

            <div class="detail-row detail-row-stacked">
                <div class="detail-label">
                    <span class="detail-icon">⭐</span>
                    <strong>Abilities</strong>
                </div>

                <div class="ability-chips">
                    ${
                        data.abilities.map(ability => `
                            <div class="ability-chip">
                                ${
                                    ability.ability.name
                                        .split("-")
                                        .map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        )
                                        .join(" ")
                                }
                            </div>
                        `).join("")
                    }
                </div>
            </div>

        </div>
        
        `;
        // dynamically builds the pokemon's base stat bars in the stats panel
        statsArea.innerHTML = `
            <div class="stats-section">
                ${
                    data.stats.map(stat => `
                        <div class="stat-row">

                            <span class="stat-name">
                                ${
                                    stat.stat.name
                                        .replace("special-attack", "SP. ATK")
                                        .replace("special-defense", "SP. DEF")
                                        .replace("attack", "ATK")
                                        .replace("defense", "DEF")
                                        .replace("speed", "SPD")
                                        .replace("hp", "HP")
                                        .replace(/^\w/, c => c.toUpperCase())
                                }
                            </span>

                            <div class="stat-bar-container">
                                <div
                                    class="stat-bar"
                                    style="
                                        width:${Math.min(stat.base_stat, 150) / 150 * 100}%;
                                        background:${getStatColor(stat.base_stat)};
                                    "
                                ></div>
                            </div>

                            <span class="stat-value">
                                ${stat.base_stat}
                            </span>

                        </div>
                    `).join("")
                }
            </div>
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

// BROWSE BY POKEMON TYPE DROPDOWN
async function getPokemonByType(typeName) {
    try {
        // clears any previous status message
        statusMessage.textContent = "";

        // shows a loading animation while browsing pokemon types
        showLoader(randomPokemonArea, "Exploring habitats...");
        useRandomButton.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 800));
        // fetches all pokemon that belong to the selected type
        const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);

        if (!response.ok) {
            throw new Error("Type not found.");
        }

        const data = await response.json();

        const pokemonList = data.pokemon;

        // randomly selects one pokemon from that type
        const randomIndex = Math.floor(Math.random() * pokemonList.length);
        const randomPokemonName = pokemonList[randomIndex].pokemon.name;

        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemonName}`);
        const pokemonData = await pokemonResponse.json();

        // saves the pokemon so "Use This Pokémon" works correctly
        randomPokemonData = pokemonData;

        const formattedName =
            pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);

        randomPokemonArea.innerHTML = `
        <div class="random-pokemon-card">
            <img
                src="${pokemonData.sprites.front_default}"
                alt="${formattedName}"
                class="current-pokemon-sprite"
            >
            <h3>${formattedName}</h3>
        </div>
    `;

    useRandomButton.disabled = false;

    // loads the selected pokemon into the dashboard
    await getPokemon(randomPokemonName, 800);

    // updates the search bar with the chosen pokemon
    input.value = randomPokemonName;

    }
    catch (error) {
        console.error(error);
        statusMessage.textContent = "Could not browse this type. Please try again.";
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

// RETURNS A COLOR BASED ON THE POKEMONS STAT VALUE
function getStatColor(value) {
    if (value >= 120) {
        return "#ff5252";
    }

    if (value >= 90) {
        return "#ff8e43";
    }

    if (value >= 70) {
        return "#ffd93d";
    }

    return "#4cd964";
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