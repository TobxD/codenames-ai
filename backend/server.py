from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import model

app = Flask(__name__)
CORS(app)

allWords = open("data/words.txt").read().split("\n")

def getGameBoard(isSingleTeam : bool):
    words = random.sample(allWords, 25)
    cardColor = ( ["red"] * 8 + ["blue"] * 7 + ["black"] + ["gray"] * 10 
                 if isSingleTeam else
                  ["red"] * 10 + ["black"] + ["gray"] * 14 )
    random.shuffle(cardColor)
    return [{"name": words[i], "color": cardColor[i], "opened": False} for i in range(25)]

def calcHint(color, gameboard):
    cards = [c for c in gameboard if not c["opened"]]
    myWords = [c["name"] for c in cards if c["color"] == color]
    otherWords = [c["name"] for c in cards if c["color"] != color]
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