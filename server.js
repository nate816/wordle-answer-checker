const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")
const used_words = path.join(__dirname, "used_words.json")
const all_words = path.join(__dirname, "all_words.json")

const app = express()
app.use(cors())
app.use(express.json())

const subDays = (date, days) => {
    date = date instanceof Date ? date : new Date(date)
    return date.setDate(date.getDate() - days)
}

const formatDateForMySql = function($date){
    if (!$date){ return }
    var date = $date instanceof Date ? $date :
    new Date(
        typeof $date === "string" ?
        $date.replace(/-/g,'/') : $date
    )
    return String(date.getFullYear())
    + '-' + String(date.getMonth() + 1).padStart(2, '0')
    + '-' + String(date.getDate()).padStart(2, '0')
}

async function loadWords(){
    let prevWords = []
    let allWords = []

    try {
        const uw = fs.readFileSync(used_words, "utf8")
        prevWords = JSON.parse(uw)
        if (!Array.isArray(prevWords)) prevWords = []
    } catch(err){
        console.warn("Failed to read or parse used_words.json, starting empty:", err.message)
        prevWords = []
    }

    try {
        const aw = fs.readFileSync(all_words, "utf8")
        allWords = JSON.parse(aw)
        if (!Array.isArray(allWords)) allWords = []
    } catch(err){
        console.warn("Failed to read or parse all_words.json, starting empty:", err.message)
        allWords = []
    }

    const yesterday = subDays(new Date(), 1)
    const formatted = formatDateForMySql(yesterday)
    const url = `https://www.nytimes.com/svc/wordle/v2/${formatted}.json`

    // console.log(url)

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
        const json = await res.json()
        const yesterday_answer = json.solution.toUpperCase()
        console.log("yesterday's answer: " + yesterday_answer)

        // yesterday's answer should obviously be in the all_words list
        if( ! allWords.includes(yesterday_answer.toLowerCase()) ){
            const appended = [...allWords, yesterday_answer.toLowerCase()]
            // write the new list of used words to disk
            console.log('adding '+yesterday_answer.toLowerCase()+' to all_words')
            fs.writeFileSync(all_words, JSON.stringify(appended, null, 2))
        }

        if( ! prevWords.includes(yesterday_answer) ){
            const appended = [...prevWords, yesterday_answer]
            // write the new list of used words to disk
            console.log('adding '+yesterday_answer+' to used_words')
            fs.writeFileSync(used_words, JSON.stringify(appended, null, 2))
            return appended
        }

        // only return verified used words
        return prevWords

    } catch(err){
        console.error("Failed to fetch yesterday's word:", err)
        return prevWords   // fallback to existing words
    }
}

// ------------------------
// API ROUTES
// ------------------------
app.get("/api/used-words", async(req, res) => {
    console.log("Request received for /api/used-words")
    const words = await loadWords()
    res.status(200).json(words)
})

app.get("/all_words.json", (req, res) => {
    res.sendFile(all_words)
})

// ------------------------
// Serve static frontend
// ------------------------
const DIST_DIR = path.join(__dirname, "dist")
app.use(express.static(DIST_DIR))

// Always serve index.html for SPA routing
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"))
})

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})