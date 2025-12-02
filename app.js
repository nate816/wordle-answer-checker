document.getElementById("req_word").focus()

/**
 * hide the passed element(s)
 * @param {Element[]}
 */
const hideEls = (els) => {
    for(const el of els){
        el.classList.add("hidden")
        el.classList.remove("flex")
    }
}

/**
 * hide the passed element(s)
 * @param {Element[]}
 */
const showEls = (els) => {
    for(const el of els){
        el.classList.add("flex")
        el.classList.remove("hidden")
    }
}

const checkWord = async(word_to_check, el_info) => {

    const endPoint = window.location.href.includes("localhost") ? ""
        : "https://wordle-answer-checker-be.onrender.com"

    if( word_to_check.includes(" ") ){
        return el_info.textContent = "Spaces aren't allowed."
    }

    if( word_to_check && word_to_check.length === 5 ){
        word_to_check = word_to_check.toUpperCase()

        const instructions = document.getElementById("instructions")
        const loading = document.getElementById("loading")
        hideEls([instructions])
        showEls([loading])

        await fetch(endPoint + "/api/used-words")
            .then(r => r.json())
            .then(used_words => {
                // Clear previous results
                el_info.textContent = ""

                const loading = document.getElementById("loading")
                hideEls([loading])

                const addLine = (label, value) => {
                    const line = document.createElement("div")
                    line.className = "py-4 flex" // flex to align label and value

                    // Label (fixed width)
                    const labelSpan = document.createElement("span")
                    labelSpan.className = "w-68 inline-block"

                    // Split the label so we can make the word bold
                    const [beforeWord, afterWord] = label.split(word_to_check)

                    // Before word
                    labelSpan.appendChild(document.createTextNode(beforeWord))

                    // Bold word
                    const wordSpan = document.createElement("span")
                    wordSpan.className = "font-bold"
                    wordSpan.textContent = word_to_check
                    labelSpan.appendChild(wordSpan)

                    // After word
                    labelSpan.appendChild(document.createTextNode(afterWord))

                    // Value
                    const valueSpan = document.createElement("span")
                    valueSpan.className = "font-bold "
                    valueSpan.className += (value.includes("YES")) ? "text-green-600" : "text-red-600"
                    valueSpan.textContent = value

                    line.appendChild(labelSpan)
                    line.appendChild(valueSpan)
                    el_info.appendChild(line)
                }

                const notUsed = ! used_words.includes(word_to_check)
                const all_words = fetch("/all_words.json", { cache: "no-store" })
                    .then(r => r.json())
                    .then(all_words => {
                        if( Array.isArray(all_words) ){
                            const inDict = all_words.map(x => x.toUpperCase()).includes(word_to_check)
                            addLine(
                                "Has " + word_to_check + " never been used?",
                                ( notUsed ? "YES" : "NO")
                            )

                            addLine(
                                "Is " + word_to_check + " a valid Wordle word?",
                                ( inDict ? "YES" : "NO")
                            )
                        }
                        else{
                            addLine("An unexpected error occured.")
                        }
                    })
            })
    }

    else {
        const instructions = document.getElementById("instructions")
        hideEls([instructions])
        el_info.textContent = "You didn't enter a word or it's not a five-letter word."
    }
}

window.checkWord = checkWord
// window.addToUsed = addToUsed
