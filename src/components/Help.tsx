
export default function Help() {
    return <div className="message">
    <p>
        Let's play the game Four-In-A-Row with a twist.  
    </p>
    <ul>
        <li>One plays with circles and the other with crosses</li>
        <li>Every turn you are allowed three moves: 
            <ul>
                <li>Place a piece of your kind. </li>
                <li>Place a piece that is entangled with the opponents last placed piece. <br/>This is not allowed if the opponent just placed an entangled piece. </li>
                <li>Measure out an entangled pair of pieces of your choice: <br/>the outcome will be circle-circle or cross-cross with equal probability. </li>
            </ul>
        </li>
    </ul>
</div>
}