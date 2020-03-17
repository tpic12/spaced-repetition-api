const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const Queue = require('../middleware/queue')
const LinkedList = require('../middleware/linkedlist')

const languageRouter = express.Router()
const wordsQ = new Queue()
const wordsList = new LinkedList()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    await LanguageService.getNextHead(req.app.get('db'), req.language.id)
    .then(arr => {
      arr.map(word => wordsQ.enqueue(word))
      res.json(wordsQ.show())
    })
    .catch(next)
  })

languageRouter
  .post('/guess', async (req, res, next) => {
    // implement me
    await LanguageService.
    res.send('implement me!')
  })

module.exports = languageRouter
