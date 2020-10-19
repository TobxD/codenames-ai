from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import model

app = Flask(__name__)
CORS(app)

allWords = [w for w in open("data/words.txt").read().split("\n") if len(w) > 0]

def getGameBoard(isSingleTeam : bool):
    words = random.sample(allWords, 25)
    cardColor = ( ["red"] * 10 + ["black"] + ["gray"] * 14
                    if isSingleTeam else
                        ["red"] * 8 + ["blue"] * 7 + ["black"] + ["gray"] * 10 )
    random.shuffle(cardColor)
    return [{"name": words[i], "color": cardColor[i], "opened": False} for i in range(25)]

def calcHint(color, gameboard):
    def cleanWord(w:str):
        return w.replace(" ", "_")

    cards = [c for c in gameboard if not c["opened"]]
    myWords = [cleanWord(c["name"]) for c in cards if c["color"] == color]
    otherWords = [cleanWord(c["name"]) for c in cards if c["color"] != color]
    return model.calcBestHint(myWords, otherWords)


@app.route('/new_game', methods = ['POST'])
def newGame():
    data = request.json
    singleTeam = data.get("singleTeam", True) if data else True
    gameboard = getGameBoard(singleTeam)
    return jsonify({"ok": True, "res": gameboard})


@app.route('/get_hint', methods = ['POST'])
def getHint():
    data = request.json
    color = data["color"]
    gameboard = data["gameboard"]
    hint = calcHint(color, gameboard)
    return jsonify({"ok": True, "res": hint})


if __name__ == "__main__":
    app.run()