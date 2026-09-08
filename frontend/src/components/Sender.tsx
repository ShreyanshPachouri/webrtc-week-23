import { useEffect, useState } from "react"

export const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPC] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender'
            }));
        }

        return () => {
            socket.close();
        }
    }, []);

    const initiateConn = async () => {

        if (!socket) {
            alert("Socket not found");
            return;
        }

        const pc = new RTCPeerConnection();
        setPC(pc);

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            try {
                if (message.type === 'createAnswer') {
                    await pc.setRemoteDescription(message.sdp);
                } else if (message.type === 'iceCandidate') {
                    await pc.addIceCandidate(message.candidate);
                }
            } catch (err) {
                console.error('Error handling message:', err);
            }
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({
                    type: 'iceCandidate',
                    candidate: event.candidate
                }));
            }
        }

        pc.onnegotiationneeded = async () => {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.send(JSON.stringify({
                    type: 'createOffer',
                    sdp: pc.localDescription
                }));
            } catch (err) {
                console.error('Error during negotiation:', err);
            }
        }

        getCameraStreamAndSend(pc);
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.muted = true; // avoid autoplay-policy issues for local preview
                video.play().catch(err => console.error('local preview play() failed:', err));
                // TODO: this should render via a component, not direct DOM manipulation
                document.body.appendChild(video);

                stream.getTracks().forEach((track) => {
                    pc.addTrack(track, stream); // fixed: pass stream as second argument
                });
            })
            .catch(err => console.error('getUserMedia failed:', err));
    }

    return <div>
        Sender
        <button onClick={initiateConn}> Send data </button>
    </div>
}