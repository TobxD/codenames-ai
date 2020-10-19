import React from 'react';
import './StatusBar.css';
import { Player } from './GameBoard';
import {Loader} from "./Loader";

export function StatusBar({ playersTurn, hint, winner }
    : { playersTurn: Player, hint: { hint: string | null, count: number, done: number }, winner: Player | null }) {
    if (winner === null) {
        return (
            <div className={`status-bar team-${playersTurn}`}>
                <div className="team">Team {playersTurn}</div>
                <div className="hint">
                    <div className="hintlabel">Hint:</div>
                    <div className="hinttext">{hint.hint ?? <Loader />}</div>
                </div>
                <div className="hintinfo">
                    Used {hint.done} / {hint.count}
                </div>
            </div>
        );
    } else {
        return (
            <div className={`status-bar team-${winner}`}>
                <div className="winner">The winner is: <span>{winner}</span></div>
            </div>
        );
    }
}