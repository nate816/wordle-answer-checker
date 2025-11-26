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
    const results = []
    const startDate = new Date("2022-02-10")
    const endDate = new Date()

    for(let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)){
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, "0")
        const dd = String(d.getDate()).padStart(2, "0")
        const url = `https://www.nytimes.com/svc/wordle/v2/${yyyy}-${mm}-${dd}.json`

        try {
            const res = await fetch(url)
            if(!res.ok) continue
            const json = await res.json()
            results.push(json.solution)
        } catch(err){
            continue
        }
    }
    console.log(results)
    return results
}

// ------------------------
// API ROUTES
// ------------------------
app.get("/api/used-words", (req, res) => {
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