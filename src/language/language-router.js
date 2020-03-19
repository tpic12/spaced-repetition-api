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
    wordsList.head = null
    try {
    const arr = await LanguageService.getNextHead(req.app.get('db'), req.language.id)
      //console.log('arr: ', arr)
      arr.map(word => wordsList.insertLast(word))
      res.json(wordsList.head.value)
      next()
    } catch(error) {
      next(error)
    }
  })
//compareToAnswer
languageRouter
  .post('/guess', jsonBodyParser, async (req, res, next) => {
  try{
    if(!req.body.guess) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`
      })
    }
    const {guess} = req.body
    const answer= await LanguageService.getAnswer(req.app.get('db'), req.language.id)
    const newAns= await  LanguageService.compareToAnswer(guess, answer[0])
      
      LanguageService.updateWordScore(req.app.get('db'), req.language.id, newAns)
      LanguageService.updateLanguageScore(req.app.get('db'), req.language.id, newAns)
      //await LanguageService.changeWord(wordsList, newAns) //we are here
      const {memory_value} = newAns //places to move --> integer
      //console.log('head: ', wordsList.head)
      const newNode = {
        nextWord: wordsList.head.value.nextWord, //original word
        wordCorrectCount: newAns.wordCorrectCount,
        wordIncorrectCount: newAns.wordIncorrectCount,
        totalScore: newAns.totalScore
      };
      //console.log('newNode: ', newNode)
      //console.log('new Ans before moving',newAns)
      wordsList.insertAt(newNode, wordsList, memory_value)
      wordsList.remove(wordsList.head.value)
      //console.log('new Ans after moving', wordsList.find('elefante'))
      //map through words list out here, running updateWords for each word...
      while(wordsList.head.next !== null) {
        await LanguageService.updateWordPosition(req.app.get('db'), req.language.id, wordsList.head.value.nextWord, wordsList.head.next.value.nextWord)
        wordsList.head = wordsList.head.next
      }
    
      //console.log('after wordsList =======================')
      //wordsList.display()
      // console.log('newAsns: ', newAns)
      const sendBack = wordsList.find(`${newNode.nextWord}`)
      res.status(200).json(sendBack)
      next()
  }
    catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
