const fs = require("fs")
const path = require("path")
const nspell = require("nspell")

// Load dictionary files
const aff = fs.readFileSync(path.join(__dirname, "../dicts/en_US.aff"), "utf8")
const dic = fs.readFileSync(path.join(__dirname, "../dicts/en_US.dic"), "utf8")

// Create the spellchecker once
const spellchecker = nspell({ aff, dic })

/**
 * Check validity of a word
 * @param {string} word
 * @returns {{ word: string, valid: boolean, suggestions: string[] }}
 */
function checkWord(word){
    const valid = spellchecker.correct(word)

    return {
        word,
        valid,
        suggestions: valid ? [] : spellchecker.suggest(word)
    }
}

module.exports = checkWord