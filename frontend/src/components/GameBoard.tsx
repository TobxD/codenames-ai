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
        <div className={"card-" + cardColor + " cn-card"} onClick={() => alert("clicked")}>
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

function internalToDisplay(internalState: InternalCardInfo[]) : CardInfo[] {
    return internalState.map(({name, color, opened}) => (
        {name:name, color:(opened ? color : "white") as CardDisplayColor}
    ));
}

export function Game() {
    const names = "CRASH NOTE PEAR PRINCESS WHIP DRAFT HONEY AFRICA TORCH".split(" ");
    const oldInfos = names.map((n) => (
        {name:n, color:"blue" as RealColor, opened:false} as InternalCardInfo));
    const [infos, setInfos] = React.useState(oldInfos);
    
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
    }

    React.useEffect(() => {
        // starup
        newGame(true);
    }, []);

    function onCardClicked(cardName: string) {
        for(let i=0; i<infos.length; i++){
           if(infos[i].name == cardName){
                
           } 
        }
    }
    function startOnePlayer() : void {
        newGame(true);
    }
    function startTwoPlayer() : void {
        newGame(false);
    }
    return (
        <div>
            <StartControl onOneStart={startOnePlayer} onTwoStart={startTwoPlayer} />
            <GameBoard cards={internalToDisplay(infos)} onCardClicked={onCardClicked} />
        </div>
    );
}