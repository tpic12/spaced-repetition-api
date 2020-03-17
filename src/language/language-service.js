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
  
  getNextHead(db, language_id) {
    return db
    .from('word')
    .select(
      'word.original as nextWord',
      'word.correct_count as wordCorrectCount',
      'word.incorrect_count as wordIncorrectCount',
      "language.total_score as totalScore",
    )
    .join("language", "word.language_id", '=', 'language.id' )
    .where({ language_id })
  }
}

module.exports = LanguageService
