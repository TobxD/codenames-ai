import gensim

def getW(s):
	return s.lower().split(" ")

model = gensim.models.KeyedVectors.load_word2vec_format('./GoogleNews-vectors-negative300.bin', binary=True)
myW = getW("CRASH NOTE PEAR PRINCESS WHIP DRAFT HONEY AFRICA TORCH")
otherW = getW("BERLIN MARBLE NIGHT COMPOUND CZECH DRAGON TRIP CHARGE")
neutrW = getW("SERVER SNOWMAN PLASTIC CARD PILOT SPIDER TRAIN")
badW = getW("CARROT")
notMine = otherW + neutrW + badW

print("model loaded")

def getSimil(w, lst):
	return [model.similarity(w, w2) for w2 in lst]

def getN(w, output=False):
#dOwn = model.distances(w, myW)
#	dOther = min(model.distances(w, notMine))
	dOwn = getSimil(w, myW)
	dOther = max(getSimil(w, notMine))
	res = ""
	cnt = 0
	minSc = 1
	for i in range(len(dOwn)):
		if dOwn[i] > dOther and dOwn[i] > 0.3:
			cnt += 1
			minSc = min(minSc, dOwn[i])
			if output:
				res += "{}({:.2f}) ".format(myW[i], dOwn[i])
	if output:
		print(res)
	return (-cnt, -minSc)

words = [w for w in model.vocab][:100000]
scoreWords = [(getN(w), w) for w in words]
scoreWords.sort()
scoreWords = scoreWords[:100]
for (sc, w) in scoreWords:
	print(w + ": ", end = "")
	getN(w, True)
