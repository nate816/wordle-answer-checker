const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const app = express()
app.use(cors())
app.use(express.json())

// IMPORT THE CHECKER
const checkWord = require("./server/check_word.js")

const DATA_FILE = path.join(__dirname, "used_words.json")

function loadWords(){
    if( ! fs.existsSync(DATA_FILE) ){
        return []
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))
}

function saveWords(words){
    fs.writeFileSync(DATA_FILE, JSON.stringify(words, null, 2))
}

// ------------------------
// API ROUTES
// ------------------------
app.get("https://wordle-answer-checker-be.onrender.com/api/used-words", (req, res) => {
    res.status(200).json(loadWords())
})

app.post("https://wordle-answer-checker-be.onrender.com/api/add-word", (req, res) => {
    const { word } = req.body
    const used = loadWords()
    if( word && ! used.includes(word) ){
        used.push(word)
        saveWords(used)
    }
    res.json({ status: "ok", used_words: used })
})

app.post("https://wordle-answer-checker-be.onrender.com/api/check-word", (req, res) => {
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