let useCelsius = usesMetricSystem();
// let savedTemp = null;
let savedTemp = localStorage.getItem("tempK");
let savedFeelsLike = localStorage.getItem("tempFeelsLikeK");
let savedCityName = localStorage.getItem("cityName");
let savedWeatherIconUrl = localStorage.getItem("weatherIconUrl");
let weatherDataTimeStamp = localStorage.getItem("weatherDataTimeStamp");
let use12HrClock = uses12HrClock();
// let use12HrClock = localStorage.getItem("12HrClock");
let randomQuote = useRandomQuote();
let oldTime;
let timeUpdateInterval = 500; // 0.5 secs
let intervalID;
const decimalsToRoundTo = 0;
let launchData = localStorage.getItem('launchData');
let launchDataTimeStamp = localStorage.getItem('launchDataTimeStamp');
// let launchData = null;
// let launchDataTimeStamp = null;
let outdatedDataThreshold = 1000 * 60 * 60; // In ms

function KtoC(kelvin) {
    return kelvin - 273.15;
}

function KtoF(kelvin) {
    return KtoC(kelvin) * 9 / 5 + 32;
}

function unitButton() {
    switchUnits();
    let temp = KtoF(savedTemp);
    let tempFeelsLike = KtoF(savedFeelsLike);
    let unit = "F";
    if (useCelsius) {
        temp = KtoC(savedTemp);
        tempFeelsLike = KtoC(savedFeelsLike);
        unit = "C";
    }
    temp = Math.round(temp * 10 ** decimalsToRoundTo) / 10 ** decimalsToRoundTo;
    tempFeelsLike = Math.round(tempFeelsLike * 10 ** decimalsToRoundTo) / 10 ** decimalsToRoundTo;
    document.querySelector(".temp").textContent = `Temp: ${temp}°${unit}⠀⠀`;
    document.querySelector(".tempFeelsLike").textContent = `Feels like: ${tempFeelsLike}°${unit}`;
}

function switchUnits() {
    useCelsius = !useCelsius;

    if (useCelsius) { localStorage.setItem("tempUnit", "C"); }
    else { localStorage.setItem("tempUnit", "F"); }
}

function timeButton() {
    switchTime();
    updateDateTime();
}

function switchTime() {
    use12HrClock = !use12HrClock;

    if (use12HrClock) { localStorage.setItem("12HrClock", "true"); }
    else { localStorage.setItem("12HrClock", "false"); }
}

function quoteButton() {
    switchQuoteType();
    getQuote(randomQuote);
}

function switchQuoteType() {
    randomQuote = !randomQuote;

    if (randomQuote) { localStorage.setItem("randomQuote", "true"); }
    else { localStorage.setItem("randomQuote", "false"); }
}

function useRandomQuote() {
    if (localStorage.getItem("randomQuote") == "false") { return false; }

    localStorage.setItem("randomQuote", "true");
    return true;
}

function uses12HrClock() {
    if (localStorage.getItem("12HrClock") == "true") { return true; }
    if (localStorage.getItem("12HrClock") == "false") { return false; }

    const format = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric'
    }).resolvedOptions().hourCycle;

    let use12HrClock = format.startsWith('h12') ? true : false;

    if (use12HrClock) { localStorage.setItem("12HrClock", "true"); }
    else { localStorage.setItem("12HrClock", "false"); }

    return use12HrClock;
}

function usesMetricSystem() {
    if (localStorage.getItem("tempUnit") == "C") { return true; }
    if (localStorage.getItem("tempUnit") == "F") { return false; }
    
    const userLocales = navigator.languages || [navigator.language];

    for (const locale of userLocales) {
        // Extract the country code (last part, after the hyphen, case-insensitive)
        const countryCode = locale.trim().split('-').pop().toLowerCase();

        // Check for known imperial countries
        if (countryCode === 'us' || countryCode === 'mm' || countryCode === 'lr') {
            localStorage.setItem("tempUnit", "F");
            return false; // Imperial
        }
    }

    // Default to metric for all other locales (most of the world)
    localStorage.setItem("tempUnit", "C");
    return true; // Metric
}

async function getWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            document.querySelector(".weatherLink").href = `https://weather.com/weather/today/l/${position.coords.latitude},${[position.coords.longitude]}`;
        });

        if (!savedTemp || Date.parse(new Date()) - Date.parse(weatherDataTimeStamp) > 2 * outdatedDataThreshold) {
            navigator.geolocation.getCurrentPosition(async function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const apikey = 'a202d86abefde616a6d380e85d119e81';
                weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}`;
                // weather api request
                const data = await fetch(weatherURL);
                const json = await data.json();
                // console.log(json);

                const cityName = json.name;
                document.querySelector(".city").textContent = `City: ${cityName}`;
                // savedTemp = json.main.temp;
                // savedFeelsLike = json.main.feels_like;
                let temp = KtoF(json.main.temp);
                let tempFeelsLike = KtoF(json.main.feels_like);
                let unit = "F";
                if (useCelsius) {
                    temp = KtoC(json.main.temp);
                    tempFeelsLike = KtoC(json.main.feels_like);
                    unit = "C";
                }
                temp = Math.round(temp * 10 ** decimalsToRoundTo) / 10 ** decimalsToRoundTo;
                tempFeelsLike = Math.round(tempFeelsLike * 10 ** decimalsToRoundTo) / 10 ** decimalsToRoundTo;
                document.querySelector(".temp").textContent = `Temp: ${temp}°${unit}⠀⠀`;
                document.querySelector(".tempFeelsLike").textContent = `Feels like: ${tempFeelsLike}°${unit}`;

                const iconURL = getWeatherIconFromCode(json.weather[0].icon);
                document.querySelector(".weather-icon img").src = iconURL;

                localStorage.setItem("tempK", json.main.temp);
                localStorage.setItem("tempFeelsLikeK", json.main.feels_like);
                localStorage.setItem("cityName", json.name);
                localStorage.setItem("weatherIconUrl", iconURL);
                localStorage.setItem("weatherDataTimeStamp", new Date().toISOString());

                savedTemp = localStorage.getItem("tempK");
                savedFeelsLike = localStorage.getItem("tempFeelsLikeK");
                savedCityName = localStorage.getItem("cityName");
                savedWeatherIconUrl = localStorage.getItem("weatherIconUrl");
                weatherDataTimeStamp = localStorage.getItem("weatherDataTimeStamp");
            });
        } else {
            document.querySelector(".city").textContent = `City: ${savedCityName}`;
            let temp = KtoF(savedTemp);
            let tempFeelsLike = KtoF(savedFeelsLike);
            let unit = "F";
            if (useCelsius) {
                temp = KtoC(savedTemp);
                tempFeelsLike = KtoC(savedFeelsLike);
                unit = "C";
            }
            temp = Math.round(temp * 10 ** decimalsToRoundTo) / 10 ** decimalsToRoundTo;
            tempFeelsLike = Math.round(tempFeelsLike * 10 ** decimalsToRoundTo) / 10 ** decimalsToRoundTo;
            document.querySelector(".temp").textContent = `Temp: ${temp}°${unit}⠀⠀`;
            document.querySelector(".tempFeelsLike").textContent = `Feels like: ${tempFeelsLike}°${unit}`;
            document.querySelector(".weather-icon img").src = savedWeatherIconUrl;
        }
    }
}

async function updateDateTime() {
    const now = new Date();
    
    const timeOptions = {
        hour12: use12HrClock,
        hour: "2-digit",
        minute: "2-digit",
    };
    
    const dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    
    const timeDisplay = document.querySelector(".time");
    let newTime = now.toLocaleTimeString(undefined, timeOptions);
    timeDisplay.textContent = newTime;

    if (oldTime != undefined && newTime != oldTime && timeUpdateInterval == 500) {
        timeUpdateInterval = 60 * 1000; // 1 min
        clearInterval(intervalID);
        setInterval(updateDateTime, timeUpdateInterval, use12HrClock);
    } else {
        oldTime = newTime;
    }
    
    const dateDisplay = document.querySelector(".date");
    dateDisplay.textContent = now.toLocaleDateString(undefined, dateOptions);
}

async function getQuote(randomQuote) {
    let type = "today";
    if (randomQuote) { type = "random"; }
    // const url = `https://zenquotes.io/api/${type}/`;
    const url = `https://corsproxy.io/?url=https://zenquotes.io/api/${type}/`;

    const data = await fetch(url);
    const json = await data.json();

    // console.log(json);

    document.querySelector(".quote").textContent = json[0].q;
    document.querySelector(".author").textContent = json[0].a;
}

async function getLaunchData() {
    const url = `https://ll.thespacedevs.com/2.3.0/launches/upcoming/?format=json`;
    let json = {};

    if (!launchData || Date.parse(new Date()) - Date.parse(launchDataTimeStamp) > outdatedDataThreshold) {
        const data = await fetch(url);
        json = await data.json();
        localStorage.setItem('launchData', JSON.stringify(json));
        localStorage.setItem('launchDataTimeStamp', new Date().toISOString());
        launchData = localStorage.getItem('launchData');
        launchDataTimeStamp = localStorage.getItem('launchDataTimeStamp');
        // console.log("getting new launch data");
    }
    else {
        json = JSON.parse(launchData);
    }
    // console.log(json);

    const thumbnailURL = json.results[0].image.thumbnail_url;
    document.querySelector(".launch-img").src = thumbnailURL

    const name = json.results[0].name;
    document.querySelector(".launch-name").textContent = name;

    const pad = json.results[0].pad.name;
    document.querySelector(".launch-pad").textContent = pad;

    const location = json.results[0].pad.location.name;
    document.querySelector(".launch-location").textContent = location;

    const window_start = json.results[0].window_start;
    const dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZoneName: "short",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    };
    const launchDate = new Date(window_start);
    document.querySelector(".launch-window").textContent = launchDate.toLocaleDateString('en-US', dateOptions);

    const organization = json.results[0].launch_service_provider.name;
    document.querySelector(".launch-organization").textContent = organization;
}

getWeather();
const hrsToUpdate = 2;
setInterval(getWeather, hrsToUpdate * 60 * 60 * 1000);

updateDateTime();
intervalID = setInterval(updateDateTime, timeUpdateInterval);

getQuote(randomQuote);

getLaunchData();

document.querySelector(".datetimeButton").addEventListener("click", timeButton);
document.querySelector("#quoteDiv").addEventListener("click", quoteButton);
document.querySelector(".weatherData").addEventListener("click", unitButton);

/*
https://api.openweathermap.org/data/2.5/weather?lat=44.49058035520899&lon=-72.73436178999917&appid=a202d86abefde616a6d380e85d119e81
44.49058035520899, -72.73436178999917
*/