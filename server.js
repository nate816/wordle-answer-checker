const express = require("express")
const cors = require("cors")
const path = require("path")
const fetch = require("node-fetch")

const app = express()
app.use(cors())
app.use(express.json())

// IMPORT THE CHECKER
const checkWord = require("./server/check_word.js")

async function loadWords(){
    const url = "https://www.nytimes.com/svc/wordle/v2/wordle.json"

    const res = await fetch(url)
    if(!res.ok){
        throw new Error("Failed to fetch Wordle archive")
    }

    const json = await res.json()

    // Extract just solutions
    return json.map(day => day.solution)
}

// ------------------------
// API ROUTES
// ------------------------
app.get("/api/used-words", async(req, res) => {
    console.log("Request received for /api/used-words")

    const words = await loadWords()

    res.status(200).json(words)
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