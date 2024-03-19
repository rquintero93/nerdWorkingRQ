/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

// Import necessary hooks and libraries
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useAccount } from 'wagmi';
import { createHackathonEntry, hackathonEntry, updateHackathonEntry } from "~~/app/hackathon"; import { ChartContainer, BarChart } from "@mui/x-charts";
import ChatSection from "./components/chat-section";
import { Node, HackathonEntry, HackathonProjectAttributes, AIEvaluation, TeamMember, ProgressUpdate, CodeEntry, Haikipu, TextNode, HaikuNode, Edge } from "~~/types/dbSchema";
import { useSigner } from "~~/utils/wagmi-utils";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
// Define types for your state
import { Header } from "~~/components/Header";
import DailyLog from "~~/components/dailyLog";
import { Faucet } from "~~/components/scaffold-eth/Faucet";
import MindWindow from "~~/components/MindWindow";
import { useGlobalState } from "~~/services/store/store";
import { HaikuCanvas } from "./haiku";

const Home: NextPage = () => {
    const { address } = useAccount();

    // Initialize form state with structure expected by your backend
    const [activeTab, setActiveTab] = useState('submit'); // Default to submit tab
    const [db, setDb] = useState<HackathonEntry[]>([])
    const [hackathonProject, setHackathonProject] = useState<HackathonProjectAttributes>({
        projectName: "",
        problemStatement: "",
        solutionDescription: "",
        implementationDescription: "",
        technologyStack: [],
    })
    const [entry, setEntry] = useState<HackathonEntry>({
        address: address || "",
        _id: "",
        hack: {} as HackathonProjectAttributes,
        teamMembers: [] as TeamMember[],
        eval: [] as AIEvaluation[],
        progressUpdates: [] as ProgressUpdate[],
    });
    const [updateData, setUpdateData] = useState<ProgressUpdate>({
        progress: "",
        wins: "",
        losses: "",
        gamePlan: "",
        actionItems: [],
        codeSnippets: [] as CodeEntry[],
    });


    const [myProject, setMyProject] = useState<HackathonEntry>({} as HackathonEntry);
    const [techInput, setTechInput] = useState("");
    const [actionInput, setActionInput] = useState("");
    const [teamInput, setTeamInput] = useState("");
    const [teamInputEmail, setTeamInputMail] = useState("");
    const [teamInputRole, setTeamInputRole] = useState("");
    const [codeInput, setCodeInput] = useState("");
    const [codeComment, setCodeComment] = useState("");
    const [codeLanguage, setCodeLanguage] = useState("");
    const [evals, setEvals] = useState<AIEvaluation[]>();
    const [evalIndex, setEvalIndex] = useState<number>(0);
    const [entryIndex, setEntryIndex] = useState<number>(0);
    const [canvasIndex, setCanvasIndex] = useState<number>(0);
    const [isProject, setIsProject] = useState(true);
    const [isUpdate, setIsUpdate] = useState(false);
    const [haikuDb, setHaikuDb] = useState<Haikipu[]>([]);
    const state = useGlobalState();

    // web3 config
    const canvas = state.myCanvas?.canvas
    const { setMyCanvas: setCanvas, setCanvasDb, canvasDb: myCanvasDb } = useGlobalState()
    const signer = useSigner();
    const account = useAccount();
    const usrAddress = account?.address;
    // call db for user
    useEffect(() => {
        if (address == null) return
        dbCall()
        haikuCall()
        canvasDb()
    }, [address])

    useEffect(() => {
        if (db == null) return
        setMyProject(db[entryIndex])
    }, [entryIndex, db])
    // Handler for text input changes
    //
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntry({ ...entry, [name]: value });
    };
    const handleAddNode = () => {
        if (!canvas) return;
        const newNode: HaikuNode = { id: haiku._id, type: "haiku", x: 100, y: 100, height: 1, width: 1, color: "1", haikipu: haiku };
    }
    const handleAddEdge = (from: string, to: string) => {
        if (!canvas) return;
        const newEdge: Edge = { id: `${from}-${to}`, fromNode: from, toNode: to, color: "1" };
    }


    const dbCall = async () => {
        const data = await fetch(`api/mongo?id=${address}`)
        const res: HackathonEntry[] = await data.json()
        setDb(res);
        setEntryIndex(res.length - 1);
        setMyProject(res[res.length - 1]);
        setEvals(res[res.length - 1].eval);
        console.log(res);
    };

    const canvasDb = async () => {
        const data = await fetch(`api/mongo/canvas?id=${address}`)
        const res: HaikuCanvas[] = await data.json()
        setCanvasIndex(res.length - 1);
        setCanvas(res[res.length - 1]);
        setCanvasDb(res);
        console.log(res);
    };

    const haikuCall = async () => {
        const data = await fetch(`api/mongo/haiku?type="RnD"`)
        const res: Haikipu[] = await data.json()
        setHaikuDb(res);
        console.log(res);
    };


    const canvasIndexHandler = () => {
        if (myCanvasDb == undefined) return;
        if (canvasIndex - 1 >= 0) {
            setCanvasIndex(canvasIndex - 1);
        } else {
            setCanvasIndex(myCanvasDb.length - 1)
        }
        setCanvas(myCanvasDb[canvasIndex])
        toast.success(`Entry Index: ${canvasIndex}`)
    }



    const indexHandler = () => {
        if (db == undefined) return;
        if (entryIndex - 1 >= 0) {
            setEntryIndex(entryIndex - 1);
        } else {
            setEntryIndex(db.length - 1)
        }
        setEntry(db[entryIndex])
        setEvals(db[entryIndex]?.eval)
        toast.success(`Entry Index: ${entryIndex}`)
    }

    const evalHandler = () => {
        if (evals == undefined) return;
        if (evalIndex - 1 >= 0) {
            setEvalIndex(evalIndex - 1);
        } else {
            setEvalIndex(evals.length - 1)
        }
        toast.success(`Eval Index: ${evalIndex}`)
    }


    const Attest = async (hackName: string) => {

        const easContractAddress = "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458";
        const schemaUID = "0x3b1be860b499c1c49462c79befd38034914a97ff2e9e1648529106d9b271f65e";
        "0x8d915de0951fc02b7f25f1744f77737e017ffb132057b5debd0c9ec7df2cc343";
        const eas = new EAS(easContractAddress);
        // Signer must be an ethers-like signer.

        if (!signer) return;
        eas.connect(signer);
        // Initialize SchemaEncoder with the schema string
        const offchain = await eas.getOffchain();
        const schemaEncoder = new SchemaEncoder("string hackName");
        const encodedData = schemaEncoder.encodeData([
            { name: "hackName", value: hackName, type: "string" }
        ]);
        const offchainAttestation = await offchain.signOffchainAttestation({
            recipient: usrAddress || "0x",
            // Unix timestamp of when attestation expires. (0 for no expiration)
            expirationTime: BigInt(0),
            // Unix timestamp of current time
            time: BigInt(1671219636),
            revocable: true, // Be aware that if your schema is not revocable, this MUST be false
            nonce: BigInt(0),
            schema: schemaUID,
            refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
            data: encodedData,
        }, signer);

        toast.success("Attesting Hack!");
        const uid = offchainAttestation.uid;

        console.log(uid);
        return uid;
    }

    // Simplified handleSubmit function for demonstration
    const handleSubmit = async () => {
        if (!address) return; // Guard against missing address
        toast.success("Submitting your project");
        try {
            const uid = await Attest(hackathonProject.projectName)
            console.log(uid);

            if (uid == undefined) return;
            entry.address = address;
            entry._id = uid;
            entry.eval = [];
            entry.progressUpdates = [];
            entry.hack = hackathonProject;
            console.log(entry);
            // Validate or prepare data as needed before submission
            const hackEntry: hackathonEntry = await createHackathonEntry(entry);
            const res = hackEntry.getProjectInfo()
            setEntry(res);
            toast(`Project Information: ${JSON.stringify(res)}`);
            console.log(res); address
            toast.success("Hackathon entry submitted successfully");
        } catch (error) {
            toast.error("Submission failed");
            console.error(error);
        }
    };

    const handleUpdate = async () => {
        if (!address) return; // Guard against missing address
        toast.success("Submitting your update");
        try {
            // Validate or prepare data as needed before submission
            entry.progressUpdates?.push(updateData);
            const hackEntry: hackathonEntry = await updateHackathonEntry(entry);
            const res = hackEntry.getProjectInfo()
            setEntry(res);
            toast(`Project Information: ${JSON.stringify(res)}`);
            console.log(res);
            toast.success("Hackathon entry submitted successfully");
        } catch (error) {
            toast.error("Submission failed");
            console.error(error);
        }
    };

    const handleAddTeamMember = () => {
        if (!teamInput) return; // Similar guard
        const newMember: TeamMember = { name: teamInput, email: teamInputEmail, skills: [teamInputRole], bio: "" }; // Simplify for demonstration
        setEntry({
            ...entry,
            teamMembers: [...entry.teamMembers, newMember],
        });
        setTeamInput("");
        setTeamInputMail("");
        setTeamInputRole(""); // Reset input
    };

    // Handler for text input changes
    const handleProgressUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUpdateData({ ...updateData, [name]: value });
    };
    // Handlers for tech stack and team members


    // Handler for text input changes
    const handleHackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setHackathonProject({ ...hackathonProject, [name]: value });
    };

    // Handlers for tech stack and team members
    const handleAddTech = () => {
        if (!techInput) return; // Prevent adding empty values
        setHackathonProject({
            ...hackathonProject,
            technologyStack: [...hackathonProject.technologyStack, techInput],
        });
        setTechInput(""); // Reset input
    };

    const haiku = haikuDb[0]


    // ProjectDetails.js
    //
    const renderTabContent = () => {
        switch (activeTab) {
            case 'submit':
                return renderSubmitTab();
            case 'update':
                return renderUpdateTab();
            case 'browse':
                return renderBrowseTab();
            default:
                return <div>Invalid tab</div>;
        }
    };

    const renderSubmitTab = () => {
        return (
            <div
                className={"p-3 flex flex-row sm:w-[300px] md:w-[400px] lg:w-[500px] xl:w-[700px] sm:h-[60px] md:h-[60px] lg:h-[70px] xl:h-[120px] items-start justify-around overflow-y-scroll overflow-x-hidden sm:mt-4 md:mt-6 lg:mt-8 xl:mt-10 sm:ml-5 md:ml-5"}
            >
                <div className={"flex flex-col"}>
                    SUBMIT YOUR PROJECT<br />
                    <input
                        name="projectName"
                        onChange={handleHackChange}
                        placeholder="Project Name"
                        className={"text-black"}
                        value={hackathonProject.projectName}
                    />
                    <input
                        name="problemStatement"
                        onChange={handleHackChange}
                        placeholder="Problem Statement"
                        className={"text-black"}
                        value={hackathonProject.problemStatement}
                    />
                    <input
                        name="solutionDescription"
                        onChange={handleHackChange}
                        placeholder="Solution"
                        className={"text-black"}
                        value={hackathonProject.solutionDescription}
                    />
                    <input
                        name="implementationDescription"
                        onChange={handleHackChange}
                        placeholder="implementationDescription"
                        className={"text-black"}
                        value={hackathonProject.implementationDescription}
                    />

                    {/* Include other inputs similarly */}
                    <input
                        value={techInput}
                        onChange={e => setTechInput(e.target.value)}
                        className={"text-black"}
                        placeholder="Add Technology"
                    />


                </div>
                {/* Tech Input */}

                <div className={"flex flex-col"}>
                    ADD TEAM MEMBERS<br />
                    <input
                        value={teamInput}
                        onChange={e => setTeamInput(e.target.value)}
                        className={"text-black"}
                        placeholder="Add Team Member Name"
                    />
                    <input
                        value={teamInputEmail}
                        onChange={e => setTeamInputMail(e.target.value)}
                        className={"text-black"}
                        placeholder="Add Team Member Email"
                    />
                    <input
                        value={teamInputRole}
                        onChange={e => setTeamInputRole(e.target.value)}
                        className={"text-black"}
                        placeholder="Add Team Member Role"
                    />


                </div>

            </div>
        );
    };

    const renderUpdateTab = () => {
        return (
            <div
                className={"p-3 flex flex-row sm:w-[300px] md:w-[400px] lg:w-[500px] xl:w-[700px] sm:h-[60px] md:h-[60px] lg:h-[70px] xl:h-[120px] items-start justify-around overflow-y-scroll overflow-x-hidden sm:mt-4 md:mt-6 lg:mt-8 xl:mt-10 sm:ml-5 md:ml-5"}
            >
                <div className={"flex flex-col"}>
                    PROGRESS UPDATE<br />
                    <input
                        name="progress"
                        onChange={handleProgressUpdate}
                        placeholder="Progress Update"
                        className={"text-black"}
                        value={updateData.progress}
                    />
                    <input
                        name="wins"
                        onChange={handleProgressUpdate}
                        placeholder="Ws"
                        className={"text-black"}
                        value={updateData.wins}
                    />
                    <input
                        name="losses"
                        onChange={handleProgressUpdate}
                        placeholder="Ls"
                        className={"text-black"}
                        value={updateData.losses}
                    />
                    <input
                        name="gamePlan"
                        onChange={handleProgressUpdate}
                        placeholder="Game Plan"
                        className={"text-black"}
                        value={updateData.gamePlan}
                    />

                    {/* Include other inputs similarly */}
                    <input
                        value={actionInput}
                        onChange={e => setActionInput(e.target.value)}
                        className={"text-black"}
                        placeholder="Add Action Items"
                    />


                </div>
                {/* Tech Input */}

                <div className={"flex flex-col"}>
                    ADD TECH UPDATE<br />
                    <input
                        value={codeInput}
                        onChange={e => setCodeInput(e.target.value)}
                        className={"text-black"}
                        placeholder="Add Code"
                    />
                    <input
                        value={codeComment}
                        onChange={e => setCodeComment(e.target.value)}
                        className={"text-black"}
                        placeholder="Comments"
                    />
                    <input
                        value={codeLanguage}
                        onChange={e => setCodeLanguage(e.target.value)}
                        className={"text-black"}
                        placeholder="Language"
                    />
                    <br />

                </div>
            </div>
        );
    };

    const renderBrowseTab = () => {
        return (
            <>
                <MindWindow />
                <div
                    className={"p-3 flex flex-row sm:w-[300px] md:w-[400px] lg:w-[500px] xl:w-[700px] sm:h-[60px] md:h-[60px] lg:h-[70px] xl:h-[120px] items-start justify-around overflow-y-scroll overflow-x-hidden sm:mt-4 md:mt-6 lg:mt-8 xl:mt-10 sm:ml-5 md:ml-5"}
                >
                    <div className={"flex flex-col"}>
                        HAIKU FINDER<br />
                        <input
                            name="progress"
                            onChange={handleProgressUpdate}
                            placeholder="Haiku Title"
                            className={"text-black"}
                            value={updateData.progress}
                        />
                        <input
                            name="wins"
                            onChange={handleProgressUpdate}
                            placeholder="Author"
                            className={"text-black"}
                            value={updateData.wins}
                        />
                        <input
                            name="losses"
                            onChange={handleProgressUpdate}
                            placeholder="ID"
                            className={"text-black"}
                            value={updateData.losses}
                        />
                        <input
                            name="gamePlan"
                            onChange={handleProgressUpdate}
                            placeholder="Category"
                            className={"text-black"}
                            value={updateData.gamePlan}
                        />



                    </div>
                    {/* Tech Input */}

                    <div className={"flex flex-col"}>
                        Haiku Chain<br />
                        <textarea
                            value={codeInput}
                            onChange={e => setCodeInput(e.target.value)}
                            className={"text-black"}
                            placeholder="Add Code"
                        />

                    </div>
                </div>
            </>
        );
    };
    // Then use this in your return statement to dynamically show the content

    const ProjectDetails = ({ entry, evalIndex }: { entry: any, evalIndex: number }) =>
    (
        <div className="">
            <ul>
                <span className='sm:text-lg md:text-xl lg:text-2xl xl:text-2xl'>
                    <strong>
                        Project Details:<br /><br />
                        {entry?.hack?.projectName}</strong>
                </span>
                <li>Description: <strong>{entry?.hack?.problemStatement}</strong></li>
                <li>Solution: <strong> {entry?.hack?.solutionDescription}</strong></li>
                <li>Implementation: <strong> {entry?.hack?.implementationDescription}</strong></li>
                <ul>
                    Technology Stack: {entry?.hack?.technologyStack?.map((tech: string, i: number) => (
                        <li key={i}><strong>{tech}</strong></li>
                    ))}
                </ul>
            </ul>
        </div>
    )


    // EvaluationDetails.js
    const EvaluationDetails = ({ entry, evalIndex }: { entry: any, evalIndex: number }) => {
        const xLabels = [
            'Coherence',
            'Feasibility',
            'Innovation',
            'Fun',
        ];
        const uData = [
            entry?.eval[evalIndex]?.coherenceScore,
            entry?.eval[evalIndex]?.feasabilityScore,
            entry?.eval[evalIndex]?.innovationScore,
            entry?.eval[evalIndex]?.funScore
        ];
        return (

            <div className="flex flex-row items-start justify-between relative">
                <div className="absolute w-[35%] bg-white bg-opacity-50 border-4 sm:max-h-[50px] md:max-h-[100px] lg:max-h-[160px] xl:max-h-[250px] overflow-y-scroll overflow-x-hidden">
                    <ProjectDetails entry={entry} evalIndex={evalIndex} />
                </div>

                <div className="absolute left-[40%] w-[35%] bg-white bg-opacity-50 border-4 sm:max-h-[50px] md:max-h-[100px] lg:max-h-[160px] xl:max-h-[250px] overflow-y-scroll overflow-x-hidden">
                    <div
                        className={"relative"}
                    >
                        <ul>
                            <span className=" sm:text-lg md:text-xl lg:text-2xl xl:text-2xl"> <strong>Evaluation Details:<br /><br /></strong ></span>

                            <li>Evaluation Comments: {entry?.eval[evalIndex]?.evaluationRemarks}</li>
                            <li>Code Snippets: {entry?.eval[evalIndex]?.codeSnippets?.map((snippet: CodeEntry, i: number) => (<>
                                <li key={i}><strong>{snippet.code}</strong></li>
                                <li key={i}><strong>{snippet.comment}</strong></li></>
                            ))}</li>
                            <li>Fun Score: {entry?.eval[evalIndex]?.funScore}</li>
                            <li>Innovation Score: {entry?.eval[evalIndex]?.innovationScore}</li>
                            <li>Feasibility: {entry?.eval[evalIndex]?.feasibilityScore}</li>
                            <li>Coherence Score: {entry?.eval[evalIndex]?.coherenceScore}</li>

                        </ul>
                    </div>
                    {/* <div className="relative">
                        <BarChart
                            width={300}
                            height={200}
                            series={[{ data: uData, label: 'AIscore', type: 'bar' }]}
                            yAxis={[{ scaleType: 'band', data: xLabels }]}
                            xAxis={[{ min: 0, max: 10 }]}
                            layout="horizontal"
                        />
                    </div> */}

                </div >



            </div >
        )
    };

    const HaikuFeed = () => {
        return (
            <div className="absolute -top-2 h-[300px] w-[700px]  overflow-x-hidden overflow-y-scroll"
            >
                {haikuDb.map((haiku: any, i: number) => (
                    <div className="left-2 relative w-full h-3/4" key={i}>
                        <div className="card p-6 border-2 backdrop-blur-lg">
                            <span className="sm:text-lg md:text-xl lg:text-2xl xl:text-2xl">Title:{" "}<strong>{haiku.haikipu?.title}</strong></span>
                            <span className="sm:text-lg md:text-xl lg:text-2xl xl:text-2xl">Haiku:{" "}<strong>{haiku.haikipu?.haiku}</strong></span>

                            <span className="sm:text-lg md:text-xl lg:text-2xl xl:text-2xl">ID:{" "}<strong>{haiku._id}</strong></span>

                            <span className="sm:text-lg md:text-xl lg:text-2xl xl:text-2xl">Creator:{" "}<strong>{haiku.address}</strong></span>
                        </div>
                    </div>
                ))}

            </div>)
    }

    // Render form (simplified for demonstration)
    return (
        <div className="font-win relative h-screen w-full bg-black overflow-hidden">
            {/* Background image */}
            {/* Content on top of the backgriund image*/}
            <div className="flex  justify-center sm:left-[5%] md:left-[4%] lg:left-[4%] xl:left-[4%] sm:top-[6%] md:top-[6%] lg:top-[7%] xl:top-[8%] items-center h-[90%] w-[90%] absolute z-10">
                <Image
                    src="/assets/background.png"
                    alt="Background"
                    layout="fill"             // Esto hace que la imagen llene el contenedor
                    // objectFit="contain"      
                    objectPosition="center"   // Centra la imagen en el contenedor
                />

                <div className="absolute left-[3%] top-[4%] w-[33%]">
                    <Header />
                </div>

                <div className='flex absolute sm:left-[15%] md:left-[20%] lg:left-[25%] xl:left-[25%] sm:top-[12%] md:top-[12%] lg:top-[13%] xl:top-[14.5%] sm:gap-10 md:gap-8 lg:gap-6 xl:gap-4 text-sm'>
                    <button className='sm:h-[10px] md:h-[30px] lg:h-[40px] xl:h-[60px] sm:w-[20px] md:w-[60px] lg:w-[80px] xl:w-[120px] bg-[url(/assets/button.png)]' onClick={() => { setActiveTab(`${!isUpdate ? 'update' : 'submit'}`); setIsUpdate(!isUpdate) }} >
                        <label className='relative -top-10 left-8'>
                            ToggleType
                        </label>
                        <label className='relative -left-10'>
                            {isUpdate ? "Update" : "Submit"}
                        </label>
                    </button>
                    <button className='sm:h-[10px] md:h-[30px] lg:h-[40px] xl:h-[60px] sm:w-[20px] md:w-[60px] lg:w-[80px] xl:w-[120px] bg-[url(/assets/button.png)]' onClick={() => { setIsProject(!isProject); setActiveTab(`${!isProject ? 'update' : 'browse'}`) }}>
                        <label className='relative -top-10 left-6'>
                            Toggle View
                        </label>
                        <label className='relative -left-10'>
                            {isProject ? "Project" : "Haiku"}
                        </label>
                    </button>
                    <div className='sm:h-[10px] md:h-[30px] lg:h-[40px] xl:h-[60px] sm:w-[20px] md:w-[60px] lg:w-[80px] xl:w-[120px] bg-[url(/assets/button.png)]'>
                        <label className='relative -top-5 left-6'>
                            New Haikipu
                        </label>
                        <Faucet />
                    </div>
                </div>

                <div className='absolute sm:left-[16.5%] md:left-[16.5%] lg:left-[18%] xl:left-[20%] top-[67%] w-[33%]'>
                    <ul className=''>
                        <button className="font-bold sm:w-[70px] md:w-[80px] lg:w-[95px] xl:w-[95px] sm:h-[35px] md:h-[40px] lg:h-[47.5px] xl:h-[47.5px] bg-no-repeat bg-[url(/assets/btn.png)] bg-contain" onClick={() => evalHandler()}>
                            NEXT
                        </button>
                        <button className="font-bold sm:w-[70px] md:w-[80px] lg:w-[95px] xl:w-[95px] sm:h-[35px] md:h-[40px] lg:h-[47.5px] xl:h-[47.5px] bg-no-repeat bg-[url(/assets/btn.png)] bg-contain" onClick={() => evalHandler()}>
                            PREV
                        </button>
                    </ul>
                </div>

                <div className='absolute left-[6%] top-[30%] w-[52%]'>
                    <span className="relative sm:text-md md:text-lg lg:text-xl xl:text-2xl sm:-top-9 md:-top-10 lg:-top-12 xl:-top-14 left-6 text-yellow-500"> <strong>Project: {entry.hack.projectName}</strong ></span>
                    {isProject ? <EvaluationDetails entry={entry} evalIndex={evalIndex} /> : <HaikuFeed />}
                </div>

                <button
                    className="absolute left-[45%] bottom-[30%] sm:h-[60px] md:h-[80px] lg:h-[100px] xl:h-[120px] sm:w-[60px] md:w-[80px] lg:w-[100px] xl:w-[120px] bg-[url(/assets/nextProject.png)] bg-contain bg-no-repeat"
                    onClick={() => indexHandler()}>
                    <label className="relative left-[0%] top-[50%] text-sm text-white">Next Entry</label>
                </button>

                <div className="absolute left-[3.8%] top-[69%] sm:w-[45%] md:w-[45%] lg:w-[45%] xl:w-[45%] bg-[url(/assets/banner2.png)] bg-no-repeat bg-contain z-20">
                    <div className="">
                        <div>
                            {renderTabContent()}
                        </div>

                        <div className="flex flex-row relative">
                            <ul className=''>
                                <button onClick={handleAddTech} className=" absolute left-[10%] top-[30%] sm:h-[10px] md:h-[30px] lg:h-[40px] xl:h-[60px] sm:w-[20px] md:w-[60px] lg:w-[80px] xl:w-[120px] bg-cover bg-no-repeat text-sm bg-[url(/assets/button.png)]">
                                    <label className="relative -top-2"> Add Tech</label>
                                </button>
                                <br />
                                <button onClick={handleAddTeamMember} className=" absolute left-[36%] top-[30%]  sm:h-[10px] md:h-[30px] lg:h-[40px] xl:h-[60px] sm:w-[20px] md:w-[60px] lg:w-[80px] xl:w-[120px] bg-cover bg-no-repeat  text-sm bg-[url(/assets/button.png)]">
                                    <label className="relative -top-0"> Add Member</label>
                                </button>
                                <br />
                                {/* Submit Button */}
                                <button className="absolute sm:left-[85%] sm:bottom-[150%] md:left-[80%] md:bottom-[100%] lg:left-[75%] lg:bottom-[80%] xl:left-[75%] xl:bottom-[75%]  sm:h-[20px] md:h-[60px] lg:h-[80px] xl:h-[100px] sm:w-[20px] md:w-[60px] lg:w-[80px] xl:w-[100px] bg-contain mt-5 bg-[url(/assets/submit.png)] bg-no-repeat" onClick={() => isUpdate ? handleUpdate() : handleSubmit()}>
                                    <label className="relative top-4">submit</label>
                                </button>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="absolute right-[9.7%] top-[11%] w-[33%]">
                    <div className="bg-[url(/assets/desciLogo.png)] bg-contain sm:h-[60px] md:h-[80px] lg:h-[100px] xl:h-[120px] sm:w-[60px] md:w-[80px] lg:w-[100px] xl:w-[120px] bg-no-repeat"></div>
                </div>
                <div className="absolute right-[7%] top-[30%] w-[33%]">
                    <ChatSection />
                </div>
            </div>

        </div>

    );
};
export default Home;
