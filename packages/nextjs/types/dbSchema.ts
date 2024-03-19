export type HackathonEntry = {
    address: string;
    _id: string;
    hack: HackathonProjectAttributes;
    teamMembers: TeamMember[];
    eval: AIEvaluation[];
    progressUpdates: ProgressUpdate[];
};

export type Haikipu = {
    _id: string,
    address: string,
    title: string,
    type: string,
    timestamp: string,
    contextSummary: any,
    haiku: string,
    explainer: string,
};


export type Node = {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export type HaikuNode = Node & {
    haikipu: Haikipu;
}

export type TextNode = Node & {
    text: string;
}

export type GroupNode = Node & {
    label?: string;
}

export type Edge = {
    id: string;
    fromNode: string;
    fromSide?: string;
    fromEnd?: string;
    toNode: string;
    toSide?: string;
    toEnd?: string;
    color?: string;
    label?: string;
}


export type Canvas = {
    node: HaikuNode[],
    edge: Edge[]
}

// Team Member
export type TeamMember = {
    name: string;
    email?: string;
    skills: string[];
    bio: string;
};

export type CodeEntry = {
    code: string;
    comment: string;
    language: string;
};

export type ProgressUpdate = {
    progress: string;
    wins: string;
    losses: string;
    gamePlan: string;
    actionItems?: string[];
    codeSnippets?: CodeEntry[];
};

export type HackathonProjectAttributes = {
    projectName: string;
    problemStatement: string;
    solutionDescription: string;
    implementationDescription: string;
    technologyStack: string[];
};

export type AIEvaluation = {
    coherenceScore: number;
    feasibilityScore: number;
    innovationScore: number;
    funScore: number;
    evaluationRemarks: string;
    codeSnippets: CodeEntry[];
}
