import { stringify } from 'querystring';
import React from 'react';
import './GameBoard.css'
import Button from 'react-bootstrap/Button'
import { REFUSED } from 'dns';
import { DOMAIN } from "../constants"

type CallbackFun = () => void;
type CallbackFunString = (arg0: string) => void;

function StartControl({onOneStart, onTwoStart} : {onOneStart: CallbackFun, onTwoStart: CallbackFun}) {
    return (
        <div id="start-control">
            <Button variant="secondary" onClick={onOneStart}>
                Start new one-player game
            </Button>
            <Button variant="secondary" onClick={onTwoStart}>
                Start new two-player game
            </Button>
        </div>
    );
}

type RealColor = "red" | "blue" | "black" | "grey";
type CardDisplayColor = RealColor | "white";
type CardInfo = {name:string, color:CardDisplayColor};
type InternalCardInfo = {name:string, color:RealColor, opened:boolean};

function Card({cardColor, name, onCardClicked} 
    : {cardColor:CardDisplayColor, name:string, onCardClicked: CallbackFunString}) {
    return (
        <div className={"card-" + cardColor + " cn-card"} onClick={() => onCardClicked(name)}>
            <div>{name}</div>
        </div>
    );
}

function GameBoard({cards, onCardClicked} : {cards: CardInfo[], onCardClicked: CallbackFunString}) {
    return (
        <div id="board-table"> 
            {cards.map(({name, color}) => 
                <Card cardColor={color} name={name} onCardClicked={onCardClicked}></Card>)}
        </div>
    );
}

function NextMove({onMoveEnded}: {onMoveEnded: CallbackFun}) {
    return (
        <div id="next-move-control">
            <Button variant="success" onClick={onMoveEnded}>
                End Move
            </Button>
        </div>
    );
}

function StatusBar({playersTurn, hint, winner}: {playersTurn: string, hint: string, winner: string}) {
    if(winner == "none"){
        return (
            <div id="status-bar">
                    <p>To Move: {playersTurn}</p>
                    <p>Hint: {hint}</p>
            </div>
        );
    }
    else{
        return (
            <div id="status-bar">
                    <p>The Winner is: {winner}</p>
            </div>
        );
    }
}

function internalToDisplay(internalState: InternalCardInfo[]) : CardInfo[] {
    return internalState.map(({name, color, opened}) => (
        {name:name, color:(opened ? color : "white") as CardDisplayColor}
    ));
}

export function Game() {
    const [infos, setInfos] = React.useState([] as InternalCardInfo[]);
    const [playersTurn, setPlayersTurn] = React.useState("red");
    const [isOnePlayer, setIsOnePlayer] = React.useState(false);
    const [hint, setHint] = React.useState("no hint");
    const [winner, setWinner] = React.useState("none");
    
    async function newGame(singleTeam: boolean){
        console.log("starting new game...");
        const fetchRes = await fetch(`${DOMAIN}/new_game`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({singleTeam: singleTeam})
        });
        const res = await fetchRes.json();
        const gameboard : InternalCardInfo[] = res.res;
        setInfos(gameboard);
        setPlayersTurn("red");
        setIsOnePlayer(singleTeam);
        setWinner("none");
    }

    function nextPlayer() {
        if(winner != "none")
            return;
        setPlayersTurn(playersTurn === "red" ? "blue" : "red");
    }
    function determineWinner(infos: InternalCardInfo[]) {
        const redWon = infos.reduce((state, {color, opened}) => state && (opened || color != "red"), true);
        const blueWon = infos.reduce((state, {color, opened}) => state && (opened || color != "blue"), true);
        if(redWon)
            setWinner("red");
        else if(!isOnePlayer && blueWon)
            setWinner("blue");
    }
    function onCardClicked(cardName: string) {
        if(winner != "none")
            return;
        const newInfos : InternalCardInfo[] = []
        var failed = false;
        for(let i=0; i<infos.length; i++){
            newInfos.push({...infos[i]});
            if (infos[i].name === cardName && !infos[i].opened){
                if(infos[i].color != playersTurn){
                    failed = true;
                }
                if(infos[i].color === "black"){
                    setWinner(playersTurn === "red" ? "blue" : "red");
                }
                newInfos[i].opened = true;
            } 
        }
        determineWinner(newInfos);
        setInfos(newInfos);
        if(failed){
            nextPlayer();
        }
    }
    function startOnePlayer() : void {
        newGame(true);
    }
    function startTwoPlayer() : void {
        newGame(false);
    }
    React.useEffect(() => {
        // starup
        newGame(true);
    }, []);
    return (
        <div>
            <StartControl onOneStart={startOnePlayer} onTwoStart={startTwoPlayer} />
            <GameBoard cards={internalToDisplay(infos)} onCardClicked={onCardClicked} />
            <NextMove onMoveEnded={nextPlayer} />
            <StatusBar playersTurn={playersTurn} hint={hint} winner={winner} />
        </div>
    );
}