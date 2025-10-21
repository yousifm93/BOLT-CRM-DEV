export const leadStages = [
    'lead',
    'pendingApp',
    'screening',
    'preQualified',
    'preApproval',
    'active',
    'pastClients',
    'other',
]

export const taskStatuses = [
    { name: 'notStarted', label: 'Not Started' },
    { name: 'inProgress', label: 'In Progress' },
    { name: 'completed', label: 'Completed' },
    { name: 'onHold', label: 'On Hold' },
];

export const taskPriorities = [
    { name: 'low', label: 'Low' },
    { name: 'medium', label: 'Medium' },
    { name: 'high', label: 'High' },
];

export const leadStatuses = {
    lead: [
        //NEW WORKING ON IT	CONVERTED	NURTURE	DEAD
        { name: 'new', label: 'new' },
        { name: 'workingOnIt', label: 'working on it' },
        { name: 'converted', label: 'converted' },
        { name: 'nurture', label: 'nurture' },
        { name: 'dead', label: 'dead' },
    ],
    pendingApp: [
        // PURCHASE	REFINANCE	HELOC 
        { name: 'purchase', label: 'purchase' },
        { name: 'refinance', label: 'refinance' },
        { name: 'heloc', label: 'heloc' },
    ],
    screening: [
        // INITIAL SCREENING	NEEDS FOLLOW UP	DOCUMENTS REQUESTED
        { name: 'initialScreening', label: 'initial screening' },
        { name: 'needsFollowUp', label: 'needs follow up' },
        { name: 'documentsRequested', label: 'documents requested' },
    ],
    preQualified: [
        // PRE-QUALIFIED	NOT QUALIFIED
        { name: 'preQualified', label: 'pre-qualified' },
        { name: 'notQualified', label: 'not qualified' },
    ],
    preApproval: [
        // PRE-APPROVED	NOT APPROVED
        { name: 'preApproved', label: 'pre-approved' },
        { name: 'notApproved', label: 'not approved' },
    ],
    active: [
        // ACTIVE
        { name: 'active', label: 'active' },
    ],
    pastClients: [
        // PAST CLIENTS
        { name: 'closed', label: 'past clients' },
    ],
    other: [
        // OTHER
        { name: 'other', label: 'other' },
    ],
}

const loanEstimateSample = {
    "purchasePrice": 300000,
    "appraisalValue": 310000,
    "downPayment": 60000,
    "loanAmount": 240000,
    "ltv": 77.42,
    "mortgageType": "Conventional",
    "interestRate": 6.5,
    "anortizationTerm": 30,
    "escrowWaver": false,
    "FICO score": 720,
    "proposedMonthlyPayment": 1800,


    "firstName": "John",
    "lastName": "Doe",
    "socialSecurityNumber": "123-45-6789",
    "dateOfBirth": "1990-01-01",
    "residenceType": "rent",
    "maritalStatus": "single",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "dependendents": 0,
    "estimatedCreditScore": "good",
    "currentAddress": "123 Main St, Anytown, USA",
    "currentAddressOccupancy": "own",
    "currentAddressTime": "2 years",
    "militaryVeteran": false,
}