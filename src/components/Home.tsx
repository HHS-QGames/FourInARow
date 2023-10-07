import { Link } from "react-router-dom";

export default function Home() {
    return <div className="button-container">
        <Link className="button" to="/local">Local&nbsp;&nbsp;game</Link>
        <Link className="button" to="/online/">Online game</Link>
        <Link className="button help" to="/help">Help</Link>
    </div>;
}