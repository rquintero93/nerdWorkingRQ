import { create } from "zustand";
import { HaikuCanvas } from "~~/app/haiku";
import scaffoldConfig from "~~/scaffold.config";
import { HackathonEntry, Haikipu, Canvas } from "~~/types/dbSchema";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
    nativeCurrencyPrice: number;
    setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
    targetNetwork: ChainWithAttributes;
    setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
    hackathonEntries: HackathonEntry[];
    setHackathonEntries: (newHackathonEntries: HackathonEntry[]) => void;
    canvasDb: HaikuCanvas[];
    setCanvasDb: (newCanvasDb: HaikuCanvas[]) => void;
    myCanvas: HaikuCanvas;
    setMyCanvas: (newCanvas: HaikuCanvas) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
    canvasDb: [],
    setCanvasDb: (newCanvasDb: HaikuCanvas[]) => set(() => ({ canvasDb: newCanvasDb })),
    myCanvas: {} as HaikuCanvas,
    setMyCanvas: (newCanvas: HaikuCanvas) => set(() => ({ myCanvas: newCanvas })),
    hackathonEntries: [],
    setHackathonEntries: (newHackathonEntries: HackathonEntry[]) =>
        set(() => ({ hackathonEntries: newHackathonEntries })),
    nativeCurrencyPrice: 0,
    setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
    targetNetwork: scaffoldConfig.targetNetworks[0],
    setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
}));
