import { stringify } from 'querystring';
import React from 'react';
import './GameBoard.css'
import Button from 'react-bootstrap/Button'

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

function Card({cardColor, name, onCardClicked} : {cardColor:CardDisplayColor, name:string, onCardClicked: CallbackFunString}) {
    return (
        <div className={"card-" + cardColor + " cn-card"} onClick={() => alert("clicked")}>
            <div>{name}</div>
        </div>
    );
}

function GameBoard({cards, onCardClicked} : {cards: CardInfo[], onCardClicked: CallbackFunString}) {
    return (
        <div id="board-table"> 
            {cards.map(({name, color}) => <Card cardColor={color} name={name} onCardClicked={onCardClicked}></Card>)}
        </div>
    );
}

function internalToDisplay(internalState: InternalCardInfo[]) : CardInfo[] {
    return internalState.map(({name, color, opened}) => ({name:name, color:(opened ? color : "white") as CardDisplayColor}));
}

export function Game() {
    const names = "CRASH NOTE PEAR PRINCESS WHIP DRAFT HONEY AFRICA TORCH".split(" ");
    const oldInfos = names.map((n) => ({name:n, color:"blue" as RealColor, opened:false} as InternalCardInfo));
    const [infos, setInfos] = React.useState(oldInfos);
    function onCardClicked(cardName: string) {
        for(let i=0; i<infos.length; i++){
           if(infos[i].name == cardName){
                
           } 
        }
    }
    function startOnePlayer() : void {

    }
    function startTwoPlayer() : void {

    }
    return (
        <div>
            <StartControl onOneStart={startOnePlayer} onTwoStart={startTwoPlayer}></StartControl>
            <GameBoard cards={internalToDisplay(infos)} onCardClicked={onCardClicked}></GameBoard>
        </div>
    );
}