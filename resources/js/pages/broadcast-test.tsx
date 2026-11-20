
import { useEffect } from "react";
import echo from "@/echo";

interface BroadcastEvent {
    message: string;
    sent_at: string;
}

export default function BroadcastTest() {
    useEffect(() => {
        const channel = echo.channel("my-channel");

        channel.listen(".my-event", (event: BroadcastEvent) => {
            console.log("Received:", event);
        });

        return () => {
            echo.leave("my-channel");
        };
    }, []);

    return (
        <div>
            <h1>Pusher Test</h1>
            <p>Waiting for broadcast event...</p>
        </div>
    );
}
