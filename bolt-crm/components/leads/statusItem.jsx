export default function StatusItem({ status, children, className }) {
    let name, label;

    if (typeof status === 'string') {
        // If status is a string, use it directly
        name = status;
        label = status;
    } else if (typeof status === 'object' && status !== null) {
        // If status is an object, destructure it
        ({ name, label } = status);
    }

    return (
        <div className={`p-1 rounded-md ${className || ''}
            ${name === 'Not Started' ? 'bg-gray-200 text-gray-800' : ''}
            ${name === 'In Progress' ? 'bg-blue-200 text-blue-800' : ''}
            ${name === 'Completed' ? 'bg-green-200 text-green-800' : ''}
            ${name === 'On Hold' ? 'bg-yellow-200 text-yellow-800' : ''}
            ${name === 'Done' ? 'bg-purple-200 text-purple-800' : ''}
            ${name === 'new' ? 'bg-blue-100 text-blue-800' : ''}
            ${name === 'workingOnIt' ? 'bg-orange-200 text-orange-800' : ''}
            ${name === 'converted' ? 'bg-green-200 text-green-800' : ''}
            ${name === 'nurture' ? 'bg-yellow-200 text-yellow-800' : ''}
            ${name === 'dead' ? 'bg-red-200 text-red-800' : ''}
            ${name === 'purchase' ? 'bg-emerald-200 text-emerald-800' : ''}
            ${name === 'refinance' ? 'bg-teal-200 text-teal-800' : ''}
            ${name === 'heloc' ? 'bg-cyan-200 text-cyan-800' : ''}
            ${name === 'initialScreening' ? 'bg-indigo-200 text-indigo-800' : ''}
            ${name === 'needsFollowUp' ? 'bg-amber-200 text-amber-800' : ''}
            ${name === 'documentsRequested' ? 'bg-lime-200 text-lime-800' : ''}
            ${name === 'preQualified' ? 'bg-green-200 text-green-800' : ''}
            ${name === 'notQualified' ? 'bg-red-200 text-red-800' : ''}
            ${name === 'preApproved' ? 'bg-emerald-200 text-emerald-800' : ''}
            ${name === 'notApproved' ? 'bg-red-200 text-red-800' : ''}
            ${name === 'active' ? 'bg-green-200 text-green-800' : ''}
            ${name === 'closed' ? 'bg-slate-200 text-slate-800' : ''}
            ${name === 'other' ? 'bg-gray-200 text-gray-800' : ''}
            ${!name || (!['Not Started', 'In Progress', 'Completed', 'On Hold', 'Done', 'new', 'workingOnIt', 'converted', 'nurture', 'dead', 'purchase', 'refinance', 'heloc', 'initialScreening', 'needsFollowUp', 'documentsRequested', 'preQualified', 'notQualified', 'preApproved', 'notApproved', 'active', 'closed', 'other'].includes(name)) ? 'bg-gray-100 text-gray-700' : ''}
        `}>
            {children || label || name || 'not set'}
        </div>
    );
}

// export const leadStatuses = {
//     lead: [
//         //NEW WORKING ON IT	CONVERTED	NURTURE	DEAD
//         { name: 'new', label: 'new' },
//         { name: 'workingOnIt', label: 'working on it' },
//         { name: 'converted', label: 'converted' },
//         { name: 'nurture', label: 'nurture' },
//         { name: 'dead', label: 'dead' },
//     ],
//     pendingApp: [
//         // PURCHASE	REFINANCE	HELOC
//         { name: 'purchase', label: 'purchase' },
//         { name: 'refinance', label: 'refinance' },
//         { name: 'heloc', label: 'heloc' },
//     ],
//     screening: [
//         // INITIAL SCREENING	NEEDS FOLLOW UP	DOCUMENTS REQUESTED
//         { name: 'initialScreening', label: 'initial screening' },
//         { name: 'needsFollowUp', label: 'needs follow up' },
//         { name: 'documentsRequested', label: 'documents requested' },
//     ],
//     preQualified: [
//         // PRE-QUALIFIED	NOT QUALIFIED
//         { name: 'preQualified', label: 'pre-qualified' },
//         { name: 'notQualified', label: 'not qualified' },
//     ],
//     preApproval: [
//         // PRE-APPROVED	NOT APPROVED
//         { name: 'preApproved', label: 'pre-approved' },
//         { name: 'notApproved', label: 'not approved' },
//     ],
//     active: [
//         // ACTIVE
//         { name: 'active', label: 'active' },
//     ],
//     pastClients: [
//         // PAST CLIENTS
//         { name: 'closed', label: 'past clients' },
//     ],
//     other: [
//         // OTHER
//         { name: 'other', label: 'other' },
//     ],
// }