
export type StartMessage = {
    "type": "starting",
    "name": string,
    "randomSeed": number
}

export type MoveMessage = {
    "type": "move", 
    "x": number, 
    "y": number, 
    "entangled": boolean
}

export type Message = StartMessage | MoveMessage;