export default function LeadStrength({ children, priority = 'medium' }) {
    return (
        <div className={`p-1 rounded-md text-center min-w-16
            ${priority === 'low' ? 'bg-red-200 text-red-800' : ''}
            ${priority === 'medium' ? 'bg-yellow-200 text-yellow-800' : ''}
            ${priority === 'high' ? 'bg-green-200 text-green-800' : ''}
        `}>
            {children}
        </div>
    );
}

