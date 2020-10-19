import React from 'react';
import './GameBoard.css'
import Button from 'react-bootstrap/Button'
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
type Player = "red" | "blue";
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

function StatusBar({playersTurn, hint, winner}
    : {playersTurn: string, hint: {hint : string, count: number, done: number}, winner: Player | null}) {
    if(winner === null){
        return (
            <div id="status-bar">
                    <p>To Move: {playersTurn}</p>
                    <p>Hint: <b>{hint.hint}</b> ({hint.done}/{hint.count})</p>
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
    const [playersTurn, setPlayersTurn] = React.useState("red" as Player);
    const [isOnePlayer, setIsOnePlayer] = React.useState(false);
    const [hint, setHint] = React.useState({hint: "", count: 0, done: 0});
    const [winner, setWinner] = React.useState(null as Player | null);
    
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
        fetchNewHint(playersTurn, gameboard);
        setIsOnePlayer(singleTeam);
        setWinner(null);
    }

    async function fetchNewHint(player: Player, gameboard : InternalCardInfo[]) {
        const fetchRes = await fetch(`${DOMAIN}/get_hint`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({color: player, gameboard: gameboard})
        });
        const res = await fetchRes.json();
        setHint({...res.res, done: 0});
    }

    function nextPlayer() {
        if(winner !== null)
            return;
        const newPlayer = playersTurn === "red" && !isOnePlayer ? "blue" : "red";
        setPlayersTurn(newPlayer);
        fetchNewHint(newPlayer, infos);
    }
    function determineWinner(infos: InternalCardInfo[]) {
        const redWon = infos.reduce((state, {color, opened}) => state && (opened || color !== "red"), true);
        const blueWon = infos.reduce((state, {color, opened}) => state && (opened || color !== "blue"), true);
        if(redWon)
            setWinner("red");
        else if(!isOnePlayer && blueWon)
            setWinner("blue");
    }
    function onCardClicked(cardName: string) {
        if(winner !== null)
            return;
        const newInfos : InternalCardInfo[] = []
        var failed = false;
        for(let i=0; i<infos.length; i++){
            newInfos.push({...infos[i]});
            if (infos[i].name === cardName && !infos[i].opened){
                if(infos[i].color !== playersTurn){
                    failed = true;
                }else{
                    setHint({...hint, done: hint.done+1});
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
        // startup
        newGame(isOnePlayer);
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