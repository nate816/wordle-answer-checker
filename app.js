import data from "./data.js"

document.getElementById("req_word").focus()

const addToUsed = async(word_to_check) => {

    await fetch("https://wordle-answer-checker-be.onrender.com/api/check-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word_to_check })
    })
    .then(res => res.json())
    .then(async(data) => {
        word_to_check = word_to_check.toUpperCase()

        if( ! data.valid ){
            return alert(word_to_check + " was not found in the English dictionary so it was not added to used words.")
        }

        await fetch("https://wordle-answer-checker-be.onrender.com/api/add-word", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: word_to_check })
        })
        .then(res => res.json())
        .then(data => {
            if( data.used_words.includes(word_to_check) ){
                // the requested word was found in the used_words list
                // meaning the addition was done successfully.

                // hide the old add button
                const btnAdd = document.getElementById("add")
                btnAdd.classList.add("hidden")
                btnAdd.classList.remove("flex")

                // show the result information
                const pResult = document.getElementById("result")
                const pWord = document.getElementById("added_word")
                const pRest = document.getElementById("rest")

                for(const el of [pResult, pWord, pRest]){
                    el.classList.remove("hidden")
                    el.classList.add("flex")
                }

                pWord.textContent = word_to_check
                pRest.textContent = " has been added to the Wordle dictionary."

            }
        })
    })

}

const checkWord = async(word_to_check, el_info) => {

    word_to_check = word_to_check.toUpperCase()

    const { all_words } = data

    if( word_to_check.includes(" ") ){
        return el_info.textContent = "Spaces aren't allowed."
    }

    const pWord = document.getElementById("added_word")
    const pRest = document.getElementById("rest")
    for(const el of [pWord, pRest]){
        el.classList.add("hidden")
        el.classList.remove("flex")
    }

    if( word_to_check && word_to_check.length === 5 ){

    const instructions = document.getElementById("instructions")
    instructions.classList.add("hidden")
    instructions.classList.remove("flex")

    const retrieve = await fetch("https://wordle-answer-checker-be.onrender.com/api/used-words").then(r => r.json())
        .then(used_words => {
            console.log(used_words)
            // Clear previous results
            el_info.textContent = ""

            const addLine = (label, value) => {
                const line = document.createElement("div")
                line.className = "py-4 flex" // flex to align label and value

                // Label (fixed width)
                const labelSpan = document.createElement("span")
                labelSpan.className = "w-72 inline-block"

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
            const inDict = all_words.includes(word_to_check)

            addLine(
                "Has " + word_to_check + " never been used?",
                ( notUsed ? "YES" : "NO")
            )

            addLine(
                "Is " + word_to_check + " in the Wordle dictionary?",
                ( inDict ? "YES" : "NO")
            )

            if( notUsed ){
                const btnAdd = document.getElementById("add")
                btnAdd.classList.remove("hidden")
                btnAdd.classList.add("flex")
            }

            // potential problems with dictionary
            const mismatches = []

            for(const word of used_words){
                if( ! all_words.includes(word) ){
                    mismatches.push(word)
                }
            }

            if( mismatches.length ){
                console.log("\nNOTE: some used words are not in the so-called dictionary...")
                console.log(JSON.stringify(mismatches))
            }
        })
    }

    else {
        const btnAdd = document.getElementById("add")
        const instructions = document.getElementById("instructions")
        for(const el of [btnAdd, instructions]){
            el.classList.add("hidden")
            el.classList.remove("flex")
        }
        el_info.textContent = "You didn't enter a word or it's not a five-letter word."
    }
}

window.checkWord = checkWord
window.addToUsed = addToUsed
