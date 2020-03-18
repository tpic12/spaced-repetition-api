const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../middleware/linkedList')

const languageRouter = express.Router()
const wordsList = new LinkedList()
const jsonBodyParser = express.json()

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
      arr.map(word => wordsList.insertLast(word))
      res.json(wordsList.head)
    })
    .catch(next)
  })
//compareToAnswer
languageRouter
  .post('/guess', jsonBodyParser, async (req, res, next) => {
    
    try{
    const {guess} = req.body
  const answer= await LanguageService.getAnswer(req.app.get('db'), req.language.id)
    
   const newAns= await  LanguageService.compareToAnswer(guess, answer[0])
      console.log('new Ans',newAns)
await LanguageService.updateWordScore(req.app.get('db'),req.language.id, newAns)
await LanguageService.updateLanguageScore(req.app.get('db'),req.language.id, newAns)
      res.status(200).json(newAns)
      next()



    }
    catch (error) {
      next(error)
    }

  
  })

module.exports = languageRouter
