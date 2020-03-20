const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getHead(db, language_id, user_id) {
    return db
    .from('language')
    .select(
      'language.total_score as totalScore',
      'word.original as nextWord',
      'word.correct_count as wordCorrectCount',
      'word.incorrect_count as wordIncorrectCount',
      'word.next as wordAfter'
      )
    .join('word', 'word.id', '=', 'language.head')
    .where({ language_id, user_id })
  },

  getWordsInOrder(db, next_id) {
    return db
      .from('word')
      .select(
      'language.total_score as totalScore',
      'word.original as nextWord',
      'word.correct_count as wordCorrectCount',
      'word.incorrect_count as wordIncorrectCount',
      'word.next as wordAfter'
      )
      .join("language", "word.language_id", '=', 'language.id' )
      .where('word.id', '=', `${next_id}`)
},
  
  // populateLinkedList(db, language_id) {
  //   return db
  //   .from('word')
  //   .select(
  //     'word.original as nextWord',
  //     'word.correct_count as wordCorrectCount',
  //     'word.incorrect_count as wordIncorrectCount',
  //     "language.total_score as totalScore",
  //     'word.next as wordAfter'
  //   )
  //   .join("language", "word.language_id", '=', 'language.id' )
  //   .where({ language_id })
  // },

  // getAnswer(db, language_id) {
  //   return db
  //   .from('word')
  //   .select(
  //     'word.translation as answer', //are these sqitch w for word?
  //     'word.memory_value',
  //     'word.correct_count as wordCorrectCount',
  //     'word.incorrect_count as wordIncorrectCount',
  //     'w.original as nextWord', //are these sqitch w for word?
  //     'language.total_score as totalScore'
  //   )
  //   .join("language", "word.language_id", '=', 'language.id' )
  //   .join('word as w', 'word.next', '=', 'w.id')
  //   .where(`word.language_id`, '=', `${language_id}`)
  // },

  moveHead(db, language_id, user_id, newHead) { 
    return db.raw(
        `update language set "head" = (select id from word w where w.original = '${newHead}' and w.language_id = ${language_id}) where language.id = ${language_id}`
      )
  },

  getHeadAnswer(db, language_id) {
    return db
    .from('language')
    .select(
      'language.total_score as totalScore',
      'word.translation as answer',
      'word.memory_value',
      'word.correct_count as wordCorrectCount',
      'word.incorrect_count as wordIncorrectCount',
      'w.original as nextWord'
      )
    .join('word', 'word.id', '=', 'language.head')
    .join('word as w', 'word.next', '=', 'w.id')
    .where(`word.language_id`, '=', `${language_id}`)
  },

  compareToAnswer(guess, ans) {
    let guessLC = guess.toLowerCase()
    let newAns = ans
    //console.log('ANS: ', ans)
    if(guessLC === ans.answer){
      newAns.memory_value = newAns.memory_value * 2
      newAns.isCorrect=true
      ++newAns.wordCorrectCount
      ++newAns.totalScore
    }
    else {
      newAns.memory_value = 1
      newAns.isCorrect=false
      newAns.wordIncorrectCount = newAns.wordIncorrectCount + 1
    }
    return newAns
  },

  updateWordScore(db,language_id, newAns) {
    return db
    .from('word')
    .update({
      memory_value:newAns.memory_value,
      correct_count:newAns.wordCorrectCount,
      incorrect_count:newAns.wordIncorrectCount
    })
    .where({
      translation:newAns.answer,
      language_id
    })
  },

  updateLanguageScore(db, language_id, newAns){
    return db
    .from("language")
    .where({id:language_id})
    .update({
      total_score:newAns.totalScore
      })
  },
  updateWordPosition(db, language_id, currentWord, nextWord) {
    if(nextWord === currentWord) {
      return db.raw(
        `update word set "next" = null where word.language_id = ${language_id} and original = '${currentWord}'`)
    } else {
      return db.raw(
        `update word set "next" = (select id from word w where w.original = '${nextWord}' and w.language_id = ${language_id}) where word.language_id = ${language_id} and original = '${currentWord}'`
      )
    }

  }

  // changeWord(list, newAns) {
  //   const {memory_value} = newAns //places to move --> integer

  //   for(let i=1; i < memory_value; i++){
  //     list.head = list.head.next
  //   }
  //   newAns.next = this.head.next
  //   this.head.next = newAns.nextWord
  // }
}

module.exports = LanguageService
