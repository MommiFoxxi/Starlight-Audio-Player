// Global variable designation
let currentPlay = ""; // currently playing filename
let currentTitle = ""; // title of currently playing audio
let currentTags = ""; // tags of currently playing audio
let currentSummary = ""; // current audio summary

let buttonTagList = []; // list of tags within the selectedTags button row
let hardTags = ["Extreme", "Incest", "Rape", "Self Harm", "CNC"];
let collabWords = ["Written", "Edited", "Voiced", "Beta", "Collab"]

let hideColumns = ["Filename", "Id"]; // categories from data that should be hidden from user
let audiosData = ""; // data loaded from audios.json

let isPlaying = false; // whether an audio is playing or not
let audioDuration = ""; // duration of audio
let isLooped = false;

const currTime = document.querySelector('#current-time')
let myURL = new URL(window.location.href)
let audioUrlSearch = "";
let fileToLoad = "";

const volumeIcon = document.querySelector("#volumeIcon")
const volumeSlider = document.querySelector("#volumeSlider")

const cssVariables = window.getComputedStyle(document.body)

// ------------- WAVESURFER ----------------
// Creat Waveform
const wavesurfer = WaveSurfer.create({
    /** HTML element or CSS selector (required) */
    container: '#audioplayer',
    /** The height of the waveform in pixels */
    height: 100,
    /** The width of the waveform in pixels or any CSS value; defaults to 100% */
    width: '100%',
    /** Render each audio channel as a separate waveform */
    splitChannels: false,
    /** Stretch the waveform to the full height */
    normalize: true,
    /** The color of the waveform */
    waveColor: cssVariables.getPropertyValue('--waveform-color'),
    /** The color of the progress mask */
    progressColor: cssVariables.getPropertyValue('--waveform-after-color'),
    /** The color of the playback cursor */
    cursorColor: '#ffb007',
    /** The cursor width */
    cursorWidth: 4,
    /** Render the waveform with bars like this: ▁ ▂ ▇ ▃ ▅ ▂ */
    barWidth: 4,
    /** Spacing between bars in pixels */
    barGap: NaN,
    /** Rounded borders for bars */
    barRadius: 20,
    /** A vertical scaling factor for the waveform */
    barHeight: NaN,
    /** Vertical bar alignment **/
    barAlign: '',
    /** Minimum pixels per second of audio (i.e. zoom level) */
    minPxPerSec: 1,
    /** Stretch the waveform to fill the container, true by default */
    fillParent: true,
    /** Audio URL */
    url: currentPlay,
    /** Whether to show default audio element controls */
    mediaControls: false,
    /** Play the audio on load */
    autoplay: false,
    /** Pass false to disable clicks on the waveform */
    interact: true,
    /** Allow to drag the cursor to seek to a new position */
    dragToSeek: true,
    /** Hide the scrollbar */
    hideScrollbar: true,
    /** Audio rate */
    audioRate: 1,
    /** Automatically scroll the container to keep the current position in viewport */
    autoScroll: true,
    /** If autoScroll is enabled, keep the cursor in the center of the waveform during playback */
    autoCenter: true,
    /** Decoding sample rate. Doesn't affect the playback. Defaults to 8000 */
    sampleRate: 8000,
});

siteCreation('./metadata/audios.json') // creation of the whole thing


// Click the waveform itself to seek
wavesurfer.on('click', () => {
    wavesurfer.playPause();
});

// Drag functionality
wavesurfer.on('drag', (relativeX) => {
    //console.log('Drag', relativeX)
})


// Loop functionality
wavesurfer.on('finish', () => {
    if (isLooped === true) {
        wavesurfer.play();
    } else {

    }
});

// Play/pause functionality once decoded
wavesurfer.once('decode', (duration) => {
    document.querySelector('#mainPlay').addEventListener('click', () => {
        wavesurfer.playPause()
    });

});

// Play/pause functionality once decoded
wavesurfer.on('decode', (duration) => {
    audioDuration = duration
    currTime.textContent = formatTime(0)
    document.querySelector('#remaining-time').textContent = "-" + formatTime(audioDuration)
});

wavesurfer.on('timeupdate', (currentTime) => {
    timeLeft = audioDuration - currentTime
    currTime.textContent = formatTime(currentTime)
    document.querySelector('#remaining-time').textContent = "-" + formatTime(timeLeft)
})

wavesurfer.on('play', () => {
    isPlaying = true;
    document.getElementById("cdSpinner").style.animationPlayState = "running";
})

/** When the audio pauses */
wavesurfer.on('pause', () => {
    isPlaying = false;
    document.getElementById("cdSpinner").style.animationPlayState = "paused";
})

const handleVolumeChange = e => {
    // Set volume as input value divided by 100
    // NB: Wavesurfer only excepts volume value between 0 - 1
    const volume = e.target.value / 100
    wavesurfer.setVolume(volume)
    // Save the value to local storage so it persists between page reloads
    localStorage.setItem("audio-player-volume", volume)
}
/**
 * Retrieves the volume value from local storage and sets the volume slider
 */
const setVolumeFromLocalStorage = () => {
    // Retrieves the volume from local storage, or falls back to default value of 50
    const volume = localStorage.getItem("audio-player-volume") * 100 || 50
    volumeSlider.value = volume
}
volumeSlider.addEventListener("input", handleVolumeChange)

// function  to change looping variable

function toggleLoop() {
    if (isLooped === false) {
        isLooped = true;
        document.getElementById("loopButton").innerHTML = "Loop Audio: YES"
    } else {
        isLooped = false;
        document.getElementById("loopButton").innerHTML = "Loop Audio: NO"
    }
}
// function to create the content of the website (mostly)
function siteCreation(dataPath) {
    // Create table of audios and fetch data
    const listEl = document.querySelector("#audio-table"); // Table object

    fetch(dataPath)
        .then(res => res.json())
        .then(data => {
            audiosData = data


            stringURL = myURL.toString()
            if (stringURL.includes("?")) {
                audioUrlSearch = stringURL.split("?")[1]

            } else {}

            // Generate table headers
            const headerRow = document.createElement('tr');
            const keyss = Object.keys(data[0]); // Get keys from the first object
            keyss.forEach(key => {
                const th = document.createElement('th');
                th.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize header
                headerRow.appendChild(th);
            });

            // Add last column of button options
            const buttCol = document.createElement('th');
            buttCol.textContent = "Options";
            headerRow.appendChild(buttCol);
            listEl.appendChild(headerRow); // Append header row to table

            hideColumns.forEach(col => {
                headerRow.querySelectorAll('th').forEach(data => {
                    if (col === data.innerText) {
                        data.outerHTML = `<th data-visible="false>${col}</th>`
                    }
                })

            })
            // Generate table rows
            pi = 0 // Used to check for last item to load by default
            data.forEach(post => {

                keys = Object.keys(post);
                values = Object.values(post);
                const row = document.createElement('tr'); // Row element

                // Make sure latest audio is currently loaded
                joever = false;
                pi++;


                // Create rest of cells from data
                for (var i = 0; i < keys.length; i++) {
                    value = values[i];
                    column = keys[i].charAt(0).toUpperCase() + keys[i].slice(1)
                    if (hideColumns.includes(column)) {
                        //pass
                    } else {
                        const rowValue = document.createElement('td')
                        rowValue.textContent = value;

                        row.appendChild(rowValue);

                        // Creating buttons for tags
                        tagCreation = true;
                        if (column === "Tags" && tagCreation) {
                            tagButt = tagButtonCreation(value)

                            rowValue.innerHTML = tagButt
                            tagCreation = false;
                        }

                    }

                    audioURLMatch = post["title"].replace(/\s{2,}/g, " ").replace(/[.,\/#!$%\^&\*;:{}“=\-_`'“’"“?~()]/g, "").toLowerCase().split(' ').join('').substring(0, 30)

                    if (audioUrlSearch === "") {
                        if (pi === data.length && joever === false) {

                            currentPlay = `${post["filename"]}`
                            currentTags = `${post["tags"]}`
                            currentTitle = `${post["title"]}`
                            currentSummary = `${post["summary"]}`

                            fileToLoad = currentPlay

                            document.querySelector('#npTitle').innerHTML = `${currentTitle}`;
                            document.querySelector('#nowPlaying').innerHTML = `${tagButt}`;
                            document.querySelector('#npSummary').innerHTML = `${currentSummary}`;
                            joever = true;
                        } else {
                            joever = false;
                        }

                    } else if (audioUrlSearch === audioURLMatch && audioUrlSearch != "") {

                        currentPlay = `${post["filename"]}`
                        currentTags = `${post["tags"]}`
                        currentTitle = `${post["title"]}`
                        currentSummary = `${post["summary"]}`
                        currentTagsButtons = tagButtonCreation(currentTags)

                        fileToLoad = currentPlay


                        document.querySelector('#npTitle').innerHTML = `${currentTitle}`;
                        document.querySelector('#nowPlaying').innerHTML = `${currentTagsButtons}`;
                        document.querySelector('#npSummary').innerHTML = `${currentSummary}`;

                        joever = true;
                    }
                }
                audioURL = post["title"].replace(/\s{2,}/g, " ").replace(/[.,\/#!$%\^&\*;:{}“=\-_`'“’"“?~()]/g, "").toLowerCase().split(' ').join('').substring(0, 30)

                if (myURL.toString().includes("?")) {
                    baseURL = myURL.toString().split("?")[0]

                } else {
                    baseURL = myURL.toString()
                }

                audioURLComplete = baseURL + "?" + audioURL

                // Create "Load Audio" button for each row
                const playButton = document.createElement('td')

                playButton.insertAdjacentHTML("beforeend", `<button onclick="location.href='${audioURLComplete}'"id="playbutton" value="${post["filename"]}">Load Audio</button>`)


                row.appendChild(playButton);
                listEl.appendChild(row); // add whole row to table

            });

            // Functionality selected tags
            document.querySelectorAll("#tagButton").forEach(button => {
                button.addEventListener('click', () => {
                    buttVal = button.innerText
                    if (buttonTagList.includes(buttVal)) {
                        index = buttonTagList.indexOf(buttVal)
                        buttonTagList.splice(index, 1)
                        searchTable()
                    } else {
                        buttonTagList.push(buttVal)
                        searchTable()
                    }

                    buttString = ""
                    buttonTagList.forEach(tsButt => {
                        buttClass = ""
                        if (tsButt.includes("4")) {
                            buttClass = "Audience"
                        } else if (tsButt.includes("SFW")) {
                            buttClass = "Rating"
                        } else if (itemInList(hardTags, tsButt)) {
                            buttClass = "Extreme"
                        } else if (itemInList(collabWords, tsButt)) {
                            buttClass = "Collab"
                        } else {
                            buttClass = "General"
                        }

                        tagButtonText = `<button onclick="resetTagList('${tsButt}')" id="selectedTags" class="${buttClass}" value="${tsButt}">${tsButt}</button>`
                        buttString = buttString + tagButtonText
                    })
                    document.querySelector('#selectedTagContainer').innerHTML = buttString
                })


            })
            if (fileToLoad === "") {
                document.querySelector('#npTitle').innerHTML = `Oops`
                document.querySelector('#npSummary').innerHTML = `${currentSummary}`
            }
            wavesurfer.load(fileToLoad)
        });

};

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

// This function resets the buttonTagList at the beginning and the selected tag list on the page
function resetTagList(word) {
    index = buttonTagList.indexOf(word)
    buttonTagList.splice(index, 1)
    buttString = ""
    buttonTagList.forEach(tsButt => {
        buttClass = ""
        if (tsButt.includes("4")) {
            buttClass = "Audience"
        } else if (tsButt.includes("SFW")) {
            buttClass = "Rating"
        } else if (itemInList(hardTags, tsButt)) {
            buttClass = "Extreme"
        } else if (itemInList(collabWords, tsButt)) {
            buttClass = "Collab"
        } else {
            buttClass = "General"
        }

        tagButtonText = `<button onclick="resetTagList('${tsButt}')" id="selectedTags" class= "${buttClass}"value="${tsButt}">${tsButt}</button>`
        buttString = buttString + tagButtonText
    })
    document.querySelector('#selectedTagContainer').innerHTML = buttString

    searchTable()
}



// creates tag buttons
function tagButtonCreation(value) {
    tagButt = ""
    matches = value.match(/(?<=\[).+?(?=\])/g); // Get text within bracket
    // Iterate over tags to create each button
    matches.forEach(tag => {

        tagClass = ""
        if (tag.includes("4")) {
            tagClass = "Audience"
        } else if (tag.includes("SFW")) {
            tagClass = "Rating"
        } else if (itemInList(hardTags, tag)) {
            tagClass = "Extreme"
        } else if (itemInList(collabWords, tag)) {
            tagClass = "Collab"
        } else {
            tagClass = "General"
        }
        tagButtValue = `<button id="tagButton" class="${tagClass}" value=${tag}>${tag}</button>`
        tagButt = tagButt + tagButtValue
    })
    return tagButt
}

function itemInList(inputList, inputString) {
    trueList = []
    for (item in inputList) {
        checkString = inputList[item]
        if (inputString.includes(checkString)) {
            trueList.push(true)
        } else {
            trueList.push(false)
        }
    }

    if (trueList.includes(true)) {
        return true
    } else {
        return false
    }
}
// function that pilots searching with input and tags
function searchTable() {

    // Declare variables
    const newArray = [];
    for (let i = 0; i < buttonTagList.length; i++) {
        let capitalizeArray = buttonTagList[i].toUpperCase();
        newArray.push(capitalizeArray);
    };

    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase().trim().split(/\s+/)
    filter = filter.concat(newArray)
    table = document.getElementById("audio-table");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 1; i < tr.length; i++) {

        td = tr[i].getElementsByTagName("td")[0];

        tdTags = tr[i].getElementsByTagName("td")[1]
        tagString = ""


        tdTags.querySelectorAll("#tagButton").forEach(rowTag => {
            tagLook = rowTag.innerText.toUpperCase()
            tagString = tagString + " " + tagLook
        })

        // Remove empty string from filter list
        if (filter.includes('')) {
            index = filter.indexOf('')
            filter.splice(index, 1)
        }

        tr[i].style.display = "";
        if (td) {
            txtValue = td.textContent || td.innerText;
            txtValue = txtValue.toUpperCase() + " " + tagString
            matchList = []
            matchStatus = ""
            filter.forEach(filterItem => {

                if (txtValue.match("NSFW") && filterItem === "SFW") {
                    matchStatus = matchStatus + " " + "neehaw"

                } else if (txtValue.includes(filterItem)) {
                    matchStatus = matchStatus + " " + "yeehaw"
                    tr[i].style.display = "";

                } else {
                    matchStatus = matchStatus + " " + "neehaw"
                }
            })

            if (matchStatus.includes("neehaw")) {
                tr[i].style.display = "none";
            }

        }

    }

}
