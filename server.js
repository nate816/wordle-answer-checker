const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000
app.listen(PORT)

// IMPORT THE CHECKER ---------------------
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

// ------------------------------------------------
// GET /api/used-words
// ------------------------------------------------
app.get("/api/used-words", (req, res) => {
    res.status(200).json(loadWords())
})

// ------------------------------------------------
// POST /api/add-word
// ------------------------------------------------
app.post("/api/add-word", (req, res) => {
    const { word } = req.body
    const used = loadWords()

    if( word && ! used.includes(word) ){
        used.push(word)
        saveWords(used)
    }

    res.json({ status: "ok", used_words: used })
})

// ------------------------------------------------
// POST /api/check-word
// ------------------------------------------------
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

// ------------------------------------------------
// Start server
// ------------------------------------------------
app.listen(PORT)