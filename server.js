const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")
const DATA_FILE = path.join(__dirname, "used_words.json")

const app = express()
app.use(cors())
app.use(express.json())

// IMPORT THE SPELL CHECKER
const checkWord = require("./server/check_word.js")

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
    const prevWords = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))
    const yesterday = subDays(new Date(), 1)
    const formatted = formatDateForMySql(yesterday)
    const url = `https://www.nytimes.com/svc/wordle/v2/${formatted}.json`

    try {
        const res = await fetch(url)
        const json = await res.json()
        const ret = [...prevWords, json.solution]
        return ret
    } catch(err){
        console.error(err)
    }

}

// ------------------------
// API ROUTES
// ------------------------
app.get("/api/used-words", async(req, res) => {
    console.log("Request received for /api/used-words")
    res.status(200).json(loadWords())
})

app.post("/api/check-word", (req, res) => {
    const { word } = req.body
    try {
        const result = checkWord(word)
        res.json(result)
    } catch (err) {
        console.error("check_word.js error:", err)
        res.status(500).json({ error: "check_word.js threw an error" })
    }
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
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})