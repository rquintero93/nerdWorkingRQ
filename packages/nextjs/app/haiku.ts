
"use client";

import { toast } from "react-hot-toast";
import { HaikuNode, Canvas, Haikipu } from "~~/types/dbSchema";
import { useGlobalState } from "~~/services/store/store"
export class HaikuCanvas {
    title: string;
    owner: string;
    id: string;
    nonce: number;
    canvas: Canvas;
    haikuchain: Haikipu[];

    constructor(
        owner: string,
        id: string,
        title?: string,
        haikuNodes?: HaikuNode[],
    ) {
        this.owner = owner;
        this.id = id;
        this.title = title || "Untitled Haiku"
        this.nonce = 0;
        this.canvas = {
            node: haikuNodes || [],
            edge: []
        } as Canvas
        this.haikuchain = []
    }
    // create a new haiku node
    async addNewHaikuNode(context: any): Promise<HaikuNode> {
        const response = await fetch("/api/gen/haiku", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(context),
        });
        const parsed: HaikuNode = await response.json();
        this.nonce++;
        this.canvas.node.push(parsed);

        return parsed;
    }

    async addCanvasHaikuNode(): Promise<HaikuNode> {

        const response = await fetch("/api/gen/canvasUpdate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this),
        });
        const parsed: HaikuNode = await response.json();
        return parsed;
    }

    addMyHaikuNode(haikuNode: HaikuNode): void {
        if (haikuNode.haikipu.address !== this.owner) return console.error("Invalid owner");
        this.nonce + 1;
        this.canvas.node.push(haikuNode);
    }

    // create a new edge
    addEdge(from: number, to: number, label?: string): void {
        const fromNode = this.canvas.node[from].id;
        const toNode = this.canvas.node[to].id;
        const newEdge = {
            id: `${fromNode}-${toNode}`,
            label,
            fromNode,
            toNode
        };
        this.canvas.edge.push(newEdge);
    }

    addChainEdge(from: number, to: number, label?: string): void {
        const fromNode = this.haikuchain[from]._id;
        const toNode = this.haikuchain[to]._id;
        const newEdge = {
            id: `${fromNode}-${toNode}`,
            label: label || "haikuchain",
            fromNode,
            toNode
        };
        this.canvas.edge.push(newEdge);
    }
    // Get project information
    //
    getProjectInfo(): Canvas {
        const canvas = this.canvas
        return canvas;
    }
    async loadCanvas(): Promise<void> {
        const response = await fetch(`/api/mongo/canvas/?id=${this.id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const call: any[] = await response.json();
        const parsed = call[0];
        this.title = parsed.haikipu.title;
        this.canvas = parsed.haikipu.canvas;
        this.haikuchain = parsed.haikipu.haikuchain;
        this.nonce = parsed.haikipu.nonce;
    }


}


export async function createCanvas(haikipu: Haikipu): Promise<HaikuCanvas> {
    //
    const haikuNode: HaikuNode = {
        id: haikipu._id,
        type: "node0",
        x: 0,
        y: 0,
        height: 1,
        width: 1,
        haikipu: haikipu,
        color: "blue"
    }
    const newCanvas = new HaikuCanvas(haikipu.address, haikipu._id, haikipu.title, [haikuNode])
    await fetch("/api/canvasMongo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newCanvas),
    });


    console.log("newCanvas", newCanvas);

    toast.success(`"${newCanvas} has been created"`); // Include database save operation here if needed
    return newCanvas;
}





