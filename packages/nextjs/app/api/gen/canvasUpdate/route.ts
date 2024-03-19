
import { NextResponse } from "next/server";
import { createChatEngine } from "../../chat/engine";
import { storeEvaluationByProject } from "../../metrics/evaluation";
import { storePrompt } from "../../metrics/prompt";
import { storeUsageByEmbeddingId } from "../../metrics/usage";
// Assumed environme
import {
    ChatMessage,
    Document,
    MongoDBAtlasVectorSearch,
    VectorStoreIndex,
    storageContextFromDefaults,
} from "llamaindex";
import { OpenAI, serviceContextFromDefaults } from "llamaindex";
import { Db, MongoClient, ObjectId } from "mongodb";
// Assuming we've defined or imported types for the Hackathon Application
import type { AIEvaluation, HackathonEntry, Haikipu } from "~~/types/dbSchema";
import { HaikuCanvas } from "~~/app/haiku";


const url = process.env.MONGODB_URL || 'mongodb+srv://At0x:r8MzJR2r4A1xlMOA@cluster2.8l2zh.mongodb.net/?retryWrites=true&w=majority'

const client = new MongoClient(url);
await client.connect();
// Database Name

async function llamaindex(payload: string, id: string) {
    const vectorStore = new MongoDBAtlasVectorSearch({
        mongodbClient: client,
        dbName: "nerdWorkState",
        collectionName: "nerdIndex", // this is where your embeddings will be stored
        indexName: "nerd_index", // this is the name of the index you will need to create
    });

    // now create an index from all the Documents and store them in Atlas
    const storageContext = await storageContextFromDefaults({ vectorStore });

    const essay = payload;

    // Create Document object with essay
    const document = new Document({ text: essay, id_: id });
    console.log({ document });
    // Split text and create embeddings. Store them in a VectorStoreIndex
    const result = await VectorStoreIndex.fromDocuments([document], { storageContext });
    const embeddingResults = await result.getNodeEmbeddingResults([document]);
    console.log({ result, embeddingResults });
    const db = client.db("nerdWorkState"); // Connect to the database
    const hackIndex = db.collection("nerdIndex");

    const embedding = await hackIndex.findOne({ "metadata.doc_id": id });

    console.log({ embeddingId: embedding?.id });
    console.log(`Successfully created embeddings in the MongoDB collection`);
    return { embeddingId: embedding?.id as string, result: embeddingResults };
}

async function runLlamaAndStore(
    db: Db,
    usedEmbeddingIds: string[],
    promptMessages: any,
    haikipu: Haikipu,
) {
    const haikuId = haikipu._id;
    const { embeddingId } = await llamaindex(JSON.stringify(haikipu), haikuId); //should we modify this id?
    // store in DB
    const promptResult = await storePrompt(
        db,
        haikipu,
        promptMessages,
        embeddingId,
        usedEmbeddingIds,
    );
    const usageResult = await storeUsageByEmbeddingId(db, haikuId, embeddingId, usedEmbeddingIds);
    const evaluationResult = await storeEvaluationByProject(db, haikuId, usedEmbeddingIds, embeddingId, haikipu);
    return {
        promptResult,
        usageResult,
        evaluationResult,
    };
}

// Revised function suited for hackathon application data
async function generateHackathonProposal(haikiput: HaikuCanvas) {
    const messages: ChatMessage[] = [
        {
            role: "system",
            content: `You are a coordination engine. Your role is to encode the semantic load of the provided context into haikipus which are a data object focused on coordination. You will recieve a knowledge graph and must encode a haiku with the semantic load which aims to foster coordination. Additionally, provide a summary and a contextual connection with the meta-context which relates other haikipus to the haiku. Prioritize  coherence to the data available to you. Respond in JSON format with the Haikipu type`
        },
        {
            role: "assistant",
            content: `
            type Haikipu = {
            haiku: string;
            summary: string;
            contextConnection: string;
                }
            `,
        },
        {
            role: "user",
            content: `Review the context summary: ${JSON.stringify(haikiput.canvas)}, use it to generate a haikipu for ${haikiput.title}.`,
        },
    ];

    const llm = new OpenAI({
        model: (process.env.MODEL as any) ?? "gpt-4-0125-preview",
        maxTokens: 512,
        additionalChatOptions: { response_format: { type: "json_object" } },
    });

    const serviceContext = serviceContextFromDefaults({
        llm,
        chunkSize: 512,
        chunkOverlap: 20,
    });

    const chatEngine = await createChatEngine(serviceContext);
    if (!chatEngine) {
        throw new Error("datasource is required in the request body");
    }

    // Convert message content from Vercel/AI format to LlamaIndex/OpenAI format

    const response = await chatEngine.chat({
        message: "Evaluate the summary and create a Haikipu.",
        chatHistory: messages,
    });
    console.log({
        response,
        serviceContext,
        raw: response.response,
        sourceNodes: JSON.stringify(response.sourceNodes),
        firstNode: !!response.sourceNodes?.length && response.sourceNodes[0],
    });
    const usedEmbeddingIds = response.sourceNodes?.map(node => node.id_) || [];
    const parsedResponse = JSON.parse(response.response);
    const haikipu: Haikipu = {
        title: haikiput.title,
        _id: haikiput.id + haikiput.nonce,
        address: haikiput.owner,
        timestamp: Date.now().toString(),
        type: "haikuChain",
        contextSummary: parsedResponse.summary,
        haiku: parsedResponse.haiku,
        explainer: parsedResponse.contextConnection,
    };

    return { haikipu, messages, usedEmbeddingIds };
}

export const maxDuration = 120; // This function can run for a maximum of 5 seconds
// Example usage for POST handler or another part of your application
export async function POST(request: Request) {
    try {
        const haikiput: HaikuCanvas = await request.json(); // Assuming the request body is properly formatted
        console.log(haikiput);
        const { usedEmbeddingIds, messages, haikipu } = await generateHackathonProposal(
            haikiput,
        );



        // Proceed with storing the enhanced proposal in MongoDB or returning it in the response
        //
        const db = client.db("nerdWorkState"); // Connect to the database
        const haikuCodex = db.collection("nerdCanvas"); //
        // assumed input
        // run this function asynchronously, do not block for it to finish
        runLlamaAndStore(db, usedEmbeddingIds, messages, haikipu);

        await haikuCodex.updateOne(
            {
                id: haikipu._id,
                address: haikipu.address,
            },
            { $addToSet: { haikuchain: haikipu } },
            { upsert: true }, // this creates new document if none match the filter
        );

        // Implementation depends on application requirements.
        //
        return NextResponse.json(haikipu, { status: 200 });
        // Implementation depends on application requirements.
        //
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "An error occurred processing the request" }, { status: 500 });
        // Handle error
        //
    }
}
