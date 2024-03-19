

import { NextResponse } from "next/server";
// Assumed environme
import {
    Document,
    MongoDBAtlasVectorSearch,
    VectorStoreIndex,
    storageContextFromDefaults,
} from "llamaindex";
import { MongoClient, ObjectId } from "mongodb";
// Assuming we've defined or imported types for the Hackathon Application
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
    haikipu: HaikuCanvas,
) {
    const haikuId = haikipu.id;
    const { embeddingId } = await llamaindex(JSON.stringify(haikipu), haikuId); //should we modify this id?
    // store in DB

    return {
        embeddingId
    };
}

// Revised function suited for hackathon application data

export const maxDuration = 120; // This function can run for a maximum of 5 seconds
// Example usage for POST handler or another part of your application
export async function POST(request: Request) {
    try {
        const haikipu: HaikuCanvas = await request.json(); // Assuming the request body is properly formatted
        console.log(haikipu);




        // Proceed with storing the enhanced proposal in MongoDB or returning it in the response
        //
        const db = client.db("nerdWorkState"); // Connect to the database
        const haikuCodex = db.collection("nerdCanvas"); //
        // assumed input
        // run this function asynchronously, do not block for it to finish
        runLlamaAndStore(haikipu);

        await haikuCodex.updateOne(
            {
                id: haikipu.id,
                address: haikipu.owner,
            },
            { $setOnInsert: haikipu },
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
