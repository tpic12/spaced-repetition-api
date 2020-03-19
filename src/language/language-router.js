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
    const user_id = req.user.id
    //console.log('user', req.user)
    try {
      wordsList.head = null
      const head = await LanguageService.getHead(req.app.get('db'), req.language.id, user_id)
      //const words = await LanguageService.getWordsInOrder(req.app.get('db'), req.language.id, user_id, head)
      // arr.map(word => wordsList.insertLast(word))
      let arr=[];
      arr.push(head[0]);
      //console.log('head: ', head[0].wordAfter)
      for(let i=0; i<9; i++) {
        if(arr[i].wordAfter !== null){
        let value = await LanguageService.getWordsInOrder(req.app.get('db'), arr[i].wordAfter)
        arr.push(value[0])
        //console.log('value: ', value)
        }
        else {
          break;
        }
      }
      //console.log("arr: ", arr)
      arr.map(word => wordsList.insertLast(word))

      res.json({
        nextWord: head[0].nextWord,
        wordCorrectCount: head[0].wordCorrectCount,
        wordIncorrectCount: head[0].wordIncorrectCount,
        totalScore: head[0].totalScore
      })
      next()
    } catch(error) {
      next(error)
    }
    

    // wordsList.head = null
    // try {
    // const arr = await LanguageService.populateLinkedList(req.app.get('db'), req.language.id)
    //   //console.log('arr: ', arr)
    //   arr.map(word => wordsList.insertLast(word))
    //   res.json(wordsList.head.value)
    //   next()
    // } catch(error) {
    //   next(error)
    // }
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
    const answerArr= await LanguageService.getHeadAnswer(req.app.get('db'), req.language.id)
    const newAns= await  LanguageService.compareToAnswer(guess, answerArr[0])
      
      await LanguageService.updateWordScore(req.app.get('db'), req.language.id, newAns)
      await LanguageService.updateLanguageScore(req.app.get('db'), req.language.id, newAns)
      //await LanguageService.changeWord(wordsList, newAns)
      //console.log('new Ans: ',newAns)
      const {memory_value} = newAns //places to move --> integer
      //console.log('head: ', wordsList.head)
      const newNode = {
        nextWord: wordsList.head.value.nextWord, //original word
        wordCorrectCount: newAns.wordCorrectCount,
        wordIncorrectCount: newAns.wordIncorrectCount,
        totalScore: newAns.totalScore
      };
      //console.log('newNode: ', newNode)
      
      wordsList.insertAt(newNode, wordsList, memory_value)
      wordsList.remove(wordsList.head.value)
      await LanguageService.moveHead(req.app.get('db'), req.language.id, req.user.id, wordsList.head.value.nextWord)
      // console.log('newHead: ', wordsList.head.value.nextWord)
      //map through words list out here, running updateWords for each word...
      while(wordsList.head.next !== null) {
        await LanguageService.updateWordPosition(req.app.get('db'), req.language.id, wordsList.head.value.nextWord, wordsList.head.next.value.nextWord)
        wordsList.head = wordsList.head.next
      }
    
      //console.log('after wordsList =======================')
      //wordsList.display()
      //console.log('newAsns: ', newAns)
      //const sendBack = newNode.nextWord
      res.status(200).json(newAns)
      next()
  }
    catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
