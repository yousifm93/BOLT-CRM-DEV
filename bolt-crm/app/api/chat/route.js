import HandleAiRequest from "@/components/chat/ai/functions/helper";


export async function POST(req) {
    return HandleAiRequest(req);
}


export async function GET(req) {
    return HandleAiRequest(req);
}