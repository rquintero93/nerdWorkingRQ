

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import "~~/styles/dropup.css";
import "~~/styles/styles.css";
import "~~/styles/window.css";
import { useGlobalState } from "~~/services/store/store";
import { HaikuCanvas } from "~~/app/haiku";
import toast from "react-hot-toast";
import CytoscapeComponent from "react-cytoscapejs";




const MindWindow = () => {



    const [canvasIndex, setCanvasIndex] = useState(0);
    const { setMyCanvas, myCanvas, canvasDb } = useGlobalState();
    const windowRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null); // Reference for the title bar
    const hc = new HaikuCanvas(myCanvas.owner, myCanvas.id)
    hc.canvas = myCanvas.canvas
    hc.nonce = myCanvas.nonce
    const update = hc.addCanvasHaikuNode



    const updateHandler = async () => {
        try {
            console.log(hc);
            await update();
            toast.success("Canvas Updated");
        } catch (error) {
            console.log(error)
        }
    }
    const elements = [
        { data: { id: "one", label: `${myCanvas.canvas?.node[0].haikipu.haiku}` }, position: { x: 0, y: 0 } },
        { data: { id: "two", label: "Node 2" }, position: { x: 100, y: 0 } },
        {
            data: { source: "one", target: "two", label: "Edge from Node1 to Node2" }
        }
    ];

    useEffect(() => {
        const wwindow = windowRef.current;
        if (!wwindow) return;

        const dragrd = wwindow.querySelector<HTMLDivElement>(".drag-rd");
        const dragru = wwindow.querySelector<HTMLDivElement>(".drag-ru");
        const draglu = wwindow.querySelector<HTMLDivElement>(".drag-lu");
        const dragld = wwindow.querySelector<HTMLDivElement>(".drag-ld");

        const resizeMouseDown = (event: MouseEvent, corner: string) => {
            event.preventDefault();
            const startX = event.clientX;
            const startY = event.clientY;
            const startWidth = wwindow.offsetWidth;
            const startHeight = wwindow.offsetHeight;
            const startPosLeft = wwindow.offsetLeft;
            const startPosTop = wwindow.offsetTop;

            const onMouseMove = (event: MouseEvent) => {
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startPosLeft;
                let newTop = startPosTop;

                switch (corner) {
                    case "rd":
                        newWidth = startWidth + event.clientX - startX;
                        newHeight = startHeight + event.clientY - startY;
                        break;
                    case "ru":
                        newWidth = startWidth + event.clientX - startX;
                        newHeight = startHeight - (event.clientY - startY);
                        newTop = startPosTop + (event.clientY - startY);
                        break;
                    case "lu":
                        newWidth = startWidth - (event.clientX - startX);
                        newHeight = startHeight - (event.clientY - startY);
                        newLeft = startPosLeft + (event.clientX - startX);
                        newTop = startPosTop + (event.clientY - startY);
                        break;
                    case "ld":
                        newWidth = startWidth - (event.clientX - startX);
                        newHeight = startHeight + event.clientY - startY;
                        newLeft = startPosLeft + (event.clientX - startX);
                        break;
                }

                if (newWidth > 100) {
                    wwindow.style.width = newWidth + "px";
                    wwindow.style.left = newLeft + "px";
                }
                if (newHeight > 100) {
                    wwindow.style.height = newHeight + "px";
                    wwindow.style.top = newTop + "px";
                }
            };

            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };

        dragrd?.addEventListener("mousedown", event => resizeMouseDown(event, "rd"));
        dragru?.addEventListener("mousedown", event => resizeMouseDown(event, "ru"));
        draglu?.addEventListener("mousedown", event => resizeMouseDown(event, "lu"));
        dragld?.addEventListener("mousedown", event => resizeMouseDown(event, "ld"));

        // Draggable functionality
        const titleBar = titleRef.current;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;

        const onTitleMouseDown = (event: MouseEvent) => {
            isDragging = true;
            dragStartX = event.clientX - wwindow.offsetLeft;
            dragStartY = event.clientY - wwindow.offsetTop;
            event.preventDefault(); // Prevent text selection
        };

        const onTitleMouseMove = (event: MouseEvent) => {
            if (!isDragging) return;
            wwindow.style.left = `${event.clientX - dragStartX}px`;
            wwindow.style.top = `${event.clientY - dragStartY}px`;
        };

        const onTitleMouseUp = () => {
            isDragging = false;
        };

        titleBar?.addEventListener("mousedown", onTitleMouseDown);
        document.addEventListener("mousemove", onTitleMouseMove);
        document.addEventListener("mouseup", onTitleMouseUp);

        return () => {
            dragrd?.removeEventListener("mousedown", event => resizeMouseDown(event, "rd"));
            dragru?.removeEventListener("mousedown", event => resizeMouseDown(event, "ru"));
            draglu?.removeEventListener("mousedown", event => resizeMouseDown(event, "lu"));
            dragld?.removeEventListener("mousedown", event => resizeMouseDown(event, "ld"));
            titleBar?.removeEventListener("mousedown", onTitleMouseDown);
            document.removeEventListener("mousemove", onTitleMouseMove);
            document.removeEventListener("mouseup", onTitleMouseUp);
        };
    }, []);

    const handleCanvas = () => {
        console.log("Canvas Index: ", canvasIndex, canvasDb);
        if (canvasIndex - 1 < 0) {
            setCanvasIndex(canvasDb.length - 1);
        } else {
            setCanvasIndex(canvasIndex - 1);
        }

        setMyCanvas(canvasDb[canvasIndex]);
    }

    const layout = { name: 'edgehandles' };   // create Cy instance

    //
    return (

        <div id="desktop" className="bg desktop">
            <div ref={windowRef} id="window" className="window">
                <div ref={titleRef} className="title no-select" id="windowTitle">
                    <img className="img" src="/iexp.png" alt="" />
                    Enjoy Explorer
                </div>
                <div className="drag-rd"></div>
                <div className="drag-ru"></div>
                <div className="drag-lu"></div>
                <div className="drag-ld"></div>
                <div className="p-12 content overflow-y-auto">
                    <h1>MindWindow Explorer</h1>
                    Canvas: {myCanvas.title}<br />
                    Owner: {myCanvas.owner?.substring(0, 7)}<br />
                    Haiku: {myCanvas.canvas?.node[0].haikipu.haiku}

                    <div className="relative h-[500px] w-[500px]">
                        <CytoscapeComponent
                            elements={CytoscapeComponent.normalizeElements(elements)}
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>




                    <button onClick={handleCanvas} className="btn btn-primary">Change Canvas</button>
                    <button onClick={updateHandler} className="btn btn-primary">Update Canvas</button>
                </div>
            </div>
        </div >

    );
}


export default MindWindow;
