import gensim

model = gensim.models.KeyedVectors.load_word2vec_format('./data/GoogleNews-vectors-negative300.bin', binary=True)
words = [w for w in model.vocab][:20000]

def getSimil(w, lst):
	return [model.similarity(w, w2) for w2 in lst]

def getScore(word, myWords, otherWords, returnWords=False):
    for w in myWords+otherWords:
        if w in word or word in w:
            return (-1, -1)
    simOwn = getSimil(word, myWords)
    simOther = max(getSimil(word, otherWords))

    def isValid(index):
        return simOwn[index] > simOther and simOwn[index] > 0.3

    wordsTarget = [myWords[i] for i in range(len(myWords)) if isValid(i)]
    minScore = min([simOwn[i] for i in range(len(myWords)) if isValid(i)] + [1])
    
    if returnWords:
        return wordsTarget
    return (len(wordsTarget), minScore)

def calcBestHint(myWords, otherWords):
    print("starting score calculation")
    scoreWords = [(getScore(w, myWords, otherWords), w) for w in words]
    print("done.")
    scoreWords.sort(reverse=True)
    bestWord = scoreWords[0][1]
    hintedWords = getScore(bestWord, myWords, otherWords, returnWords=True)
    print("returning")
    return {"hint": bestWord.replace("_", " "), "count": len(hintedWords), "hintedWords": hintedWords}