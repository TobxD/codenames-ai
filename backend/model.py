import gensim

model = gensim.models.KeyedVectors.load_word2vec_format('./data/GoogleNews-vectors-negative300.bin', binary=True)
words = [w for w in model.vocab][:20000]

def getSimil(w, lst):
	return [model.similarity(w, w2) for w2 in lst]

def getScore(word, myWords, otherWords, returnWords=False):
    simOwn = getSimil(word, myWords)
    simOther = max(getSimil(word, otherWords))

    def isValid(index):
        return simOwn[index] > simOther and simOwn[index] > 0.3

    wordsTarget = [myWords[i] for i in range(len(myWords)) if isValid(i)]
    minScore = min([simOwn[i] for i in range(len(myWords)) if isValid(i)])
    
    if returnWords:
        return wordsTarget
    return (len(wordsTarget), minScore)

def calcBestHint(myWords, otherWords):
    scoreWords = [(getScore(w, myWords, otherWords), w) for w in words]
    scoreWords.sort(reverse=True)
    bestWord = scoreWords[0][0]
    hintedWords = getScore(bestWord, myWords, otherWords, returnWords=True)
    return {"hint": bestWord, "count": len(hintedWords), "hintedWords": hintedWords}